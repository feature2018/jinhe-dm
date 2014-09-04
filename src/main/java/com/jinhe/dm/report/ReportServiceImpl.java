package com.jinhe.dm.report;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.apache.log4j.Logger;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jinhe.dm.data.sqlquery.SOUtil;
import com.jinhe.dm.data.sqlquery.SQLExcutor;
import com.jinhe.dm.data.util._DateUtil;
import com.jinhe.tss.framework.component.param.ParamConstants;
import com.jinhe.tss.framework.exception.BusinessException;
import com.jinhe.tss.util.DateUtil;
import com.jinhe.tss.util.EasyUtils;

@Service("ReportService")
public class ReportServiceImpl implements ReportService {
	
	private Logger logger = Logger.getLogger(this.getClass());
    
    @Autowired ReportDao reportDao;
    
    public Report getReport(Long id) {
        Report report = reportDao.getEntity(id);
        reportDao.evict(report);
        return report;
    }
    
	public Long getReportIdByName(String name) {
		String hql = "select o.id from Report o where o.name = ? order by o.decode";
		List<?> list = reportDao.getEntities(hql, name); 
		if(EasyUtils.isNullOrEmpty(list)) {
			return null;
		}
		return (Long) list.get(0);
	}
    
    @SuppressWarnings("unchecked")
    public List<Report> getAllReport() {
        return (List<Report>) reportDao.getEntities("from Report o order by o.decode");
    }
    
    @SuppressWarnings("unchecked")
    public List<Report> getAllReportGroups() {
        return (List<Report>) reportDao.getEntities("from Report o where o.type = ? order by o.decode", Report.TYPE0);
    }

    public Report saveReport(Report report) {
        if ( report.getId() == null ) {
            report.setSeqNo(reportDao.getNextSeqNo(report.getParentId()));
            reportDao.create(report);
        }
        else {
        	reportDao.refreshReport(report);
        }
        return report;
    }
    
    public Report delete(Long id) {
    	 Report report = getReport(id);
         List<Report> list1 = reportDao.getChildrenById(id, Report.OPERATION_DELETE); // 一并删除子节点
         List<Report> list2 = reportDao.getChildrenById(id);
         
         if(list1.size() < list2.size()) {
         	throw new BusinessException("你的权限不足，无法删除整个枝。");
         }
         return reportDao.deleteReport(report);
    }

    public void startOrStop(Long reportId, Integer disabled) {
        List<Report> list = ParamConstants.TRUE.equals(disabled) ? 
                reportDao.getChildrenById(reportId, Report.OPERATION_DISABLE) : reportDao.getParentsById(reportId);
        
        for (Report report : list) {
            report.setDisabled(disabled);
            reportDao.updateWithoutFlush(report);
        }
        reportDao.flush();
    }

    public void sort(Long startId, Long targetId, int direction) {
        reportDao.sort(startId, targetId, direction);
    }

    public List<Report> copy(Long reportId, Long groupId) {
        Report report = getReport(reportId);
        Report group  = getReport(groupId);
        
        reportDao.evict(report);
        report.setId(null);
        report.setParentId(groupId);
        report.setSeqNo(reportDao.getNextSeqNo(groupId));
 
        if (ParamConstants.TRUE.equals(group.getDisabled())) {
            report.setDisabled(ParamConstants.TRUE); // 如果目标根节点是停用状态，则新复制出来的节点也为停用状态
        }
        
        report = reportDao.create(report);
        List<Report> list = new ArrayList<Report>();
        list.add(report);
        
        return list;
    }

    public void move(Long reportId, Long groupId) {
        List<Report> list  = reportDao.getChildrenById(reportId);
        Report targetGroup = reportDao.getEntity(groupId);
        for (Report temp : list) {
            if (temp.getId().equals(reportId)) { // 判断是否是移动节点（即被移动枝的根节点）
                temp.setSeqNo(reportDao.getNextSeqNo(groupId));
                temp.setParentId(groupId);
            }
            
            if (ParamConstants.TRUE.equals(targetGroup.getDisabled())) {
                temp.setDisabled(ParamConstants.TRUE); // 如果目标根节点是停用状态，则所有新复制出来的节点也一律为停用状态
            }
            
            reportDao.update(temp);
        }
    }
    
    @SuppressWarnings("unchecked")
  	public SQLExcutor queryReport(Long reportId, Map<String, String> requestMap, int page, int pagesize, Object loginUserId) {
		Report report = this.getReport(reportId);
		String paramsConfig = report.getParam();
		String reportScript = report.getScript();
          
      	Map<Integer, Object> paramsMap = new HashMap<Integer, Object>();
      	Map<String, Object> fmDataMap = new HashMap<String, Object>();
        fmDataMap.putAll(requestMap);
      	
      	if( !EasyUtils.isNullOrEmpty(paramsConfig) ) {
      		List<LinkedHashMap<Object, Object>> list;
      		try {  
      			ObjectMapper objectMapper = new ObjectMapper();
      			paramsConfig = paramsConfig.replaceAll("'", "\"");
      			
  				list = objectMapper.readValue(paramsConfig, List.class);  
      	        
      	    } catch (Exception e) {  
      	        throw new BusinessException("报表【" + report.getName() + "】的参数配置有误，要求为标准JSON格式。", e);
      	    }  
      		
      		for(int i = 0; i < list.size(); i++) {
  	        	LinkedHashMap<Object, Object> map = list.get(i);
  	        	
  	        	int index = i + 1;
  	        	String paramKy = "param" + index;
				if (!requestMap.containsKey(paramKy)) {
					continue;
				}

				String paramValue = requestMap.get(paramKy).trim();
				Object paramType = map.get("type");
				Object isMacrocode = map.get("isMacrocode");
				
				// 将相对时间解析成绝对时间（today - 2 --> 2014-7-20）
				if (Pattern.compile("^today[\\s]*-[\\s]*\\d{1,4}").matcher(paramValue).matches()) {
					int deltaDays = Integer.parseInt(paramValue.split("-")[1].trim());
					Date today = _DateUtil.noHMS(new Date());
					paramValue = DateUtil.format(_DateUtil.subDays(today, deltaDays));
				} 

				if (reportScript.indexOf("in (${" + paramKy + "})") > 0) {
					// 处理in查询的条件值，为每个项加上单引号
					paramValue = SOUtil.insertSingleQuotes(paramValue);
				}
				// 判断参数是否只用于freemarker解析
				else if (!"true".equals(isMacrocode)) {
					Object value = preTreatParamValue(paramValue, paramType);
					paramsMap.put(paramsMap.size() + 1, value);
				}
				fmDataMap.put(paramKy, paramValue);
  	        }
      	}
      	
        // 结合 requestMap 进行 freemarker解析 sql
      	// TODO 需要允许指定sql预处理类。
      	reportScript = SOUtil.freemarkerParse(reportScript, fmDataMap);
          
		SQLExcutor excutor = new SQLExcutor(false);
		String datasource = report.getDatasource();
		excutor.excuteQuery(reportScript, paramsMap, page, pagesize, datasource);

		return excutor;
  	}

  	private Object preTreatParamValue(String paramValue, Object paramType) {
  		if(paramType == null || paramValue == null) {
  			return paramValue;
  		}
  		
  		paramType = paramType.toString().toLowerCase();
  		if("number".equals(paramType)) {
  			return EasyUtils.convertObject2Integer(paramValue);
  		}
  		else if("date".equals(paramType)) {
			try {
				Date dateObj = DateUtil.parse(paramValue);
				return new java.sql.Timestamp(dateObj.getTime());
			} catch(Exception e) {
				logger.error("Date type param'value is wrong: " + e.getMessage());
				return null;
			}
  		}
  		else {
  			return paramValue;
  		}
  	} 
}