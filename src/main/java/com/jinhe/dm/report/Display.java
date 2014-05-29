package com.jinhe.dm.report;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.jinhe.dm.Constants;
import com.jinhe.dm.data.sqlquery.SOUtil;
import com.jinhe.dm.data.sqlquery.SQLExcutor;
import com.jinhe.dm.data.util.DataExport;
import com.jinhe.tss.framework.component.log.IBusinessLogger;
import com.jinhe.tss.framework.component.log.Log;
import com.jinhe.tss.framework.component.param.ParamManager;
import com.jinhe.tss.framework.exception.BusinessException;
import com.jinhe.tss.framework.persistence.pagequery.PageInfo;
import com.jinhe.tss.framework.web.dispaly.grid.DefaultGridNode;
import com.jinhe.tss.framework.web.dispaly.grid.GridDataEncoder;
import com.jinhe.tss.framework.web.dispaly.grid.IGridNode;
import com.jinhe.tss.framework.web.mvc.BaseActionSupport;
import com.jinhe.tss.util.DateUtil;
import com.jinhe.tss.util.EasyUtils;

/**
 * http://localhost:9000/dm/display/12/1/100
 */
@Controller
@RequestMapping("/display")
public class Display extends BaseActionSupport {
    
    @Autowired private ReportService reportService;
 
    @RequestMapping("/{reportId}/{page}/{pagesize}")
    public void showAsGrid(HttpServletRequest request, HttpServletResponse response, 
            @PathVariable("reportId") Long reportId, 
            @PathVariable("page") int page,
            @PathVariable("pagesize") int pagesize) {
    	
    	long start = System.currentTimeMillis();
    	SQLExcutor excutor = queryReport(request, reportId, page, pagesize);
    	
    	outputAccessLog(reportId, "showAsGrid", request.getParameterMap(), start);
        
        List<IGridNode> temp = new ArrayList<IGridNode>();
        for(Map<String, Object> item : excutor.result) {
            DefaultGridNode gridNode = new DefaultGridNode();
            gridNode.getAttrs().putAll(item);
            temp.add(gridNode);
        }
        GridDataEncoder gEncoder = new GridDataEncoder(temp, excutor.getGridTemplate());
        
        PageInfo pageInfo = new PageInfo();
        pageInfo.setPageSize(pagesize);
        pageInfo.setTotalRows(excutor.count);
        pageInfo.setPageNum(page);
        
        print(new String[] {"ReportData", "PageInfo"}, new Object[] {gEncoder, pageInfo});
    }
    
    @RequestMapping("/export/{reportId}/{page}/{pagesize}")
    public void exportAsCSV(HttpServletRequest request, HttpServletResponse response, 
            @PathVariable("reportId") Long reportId, 
            @PathVariable("page") int page,
            @PathVariable("pagesize") int pagesize) {
        
    	long start = System.currentTimeMillis();
        SQLExcutor excutor = queryReport(request, reportId, page, pagesize);
        
        String fileName = reportId + ".csv";
        String exportPath = ParamManager.getValue(Constants.TEMP_EXPORT_PATH).replace("\n", "") + "/" + fileName;
        DataExport.exportCSV(exportPath, excutor.result, excutor.selectFields);
        DataExport.downloadFileByHttp(response, exportPath);
        
        outputAccessLog(reportId, "exportAsCSV", request.getParameterMap(), start);
    }
    
    /**
     * report可能是report的ID 也 可能是 Name
     */
    @RequestMapping("/json/{report}")
    @ResponseBody
    public List<Map<String, Object>> showAsJson(HttpServletRequest request, @PathVariable("report") String report) {
    	Long reportId;
    	try {
    		reportId = Long.valueOf(report);
    	} catch(Exception e) {
    		reportId = reportService.getReportIdByName(report);
    	}
    	
    	if(reportId == null) {
    		throw new BusinessException("【" + report + "】数据服务不存在。");
    	}
    	
    	long start = System.currentTimeMillis();
        SQLExcutor excutor = queryReport(request, reportId, 0, 0);
        
        outputAccessLog(reportId, "showAsJson", request.getParameterMap(), start);
        
        return excutor.result;
    }
    
	@SuppressWarnings("unchecked")
	private SQLExcutor queryReport(HttpServletRequest request, Long reportId, int page, int pagesize) {
		Map<String, String[]> requestMap = request.getParameterMap();
    	Report report = reportService.getReport(reportId);
        String paramsConfig = report.getParam();
        String reportScript = report.getScript();
        
    	Map<Integer, Object> paramsMap = new HashMap<Integer, Object>();
    	Map<String, Object> fmDataMap = new HashMap<String, Object>();
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
                if( !requestMap.containsKey(paramKy) ) {
                	continue;
                }
                
                String requestParamValue = requestMap.get(paramKy)[0];
                Object paramType = map.get("type");
                Object isMacrocode = map.get("isMacrocode");
                
                if( reportScript.indexOf("in (${" + paramKy + "})") > 0) {
                	// 处理in查询的条件值，为每个项加上单引号
                	requestParamValue = SOUtil.insertSingleQuotes(requestParamValue.toString());
                } 
                // 判断参数是否只用于freemarker解析
                else if( !"true".equals(isMacrocode) ) {
                	Object value = preTreatParamValue(requestParamValue, paramType);
                	paramsMap.put(paramsMap.size() + 1, value); 
                }
                fmDataMap.put(paramKy, requestParamValue);
	        }
    	}
    	
        // 结合 requestMap 进行 freemarker解析 sql
    	reportScript = SOUtil.freemarkerParse(reportScript, fmDataMap);
        
        SQLExcutor excutor = new SQLExcutor();
        String datasource = report.getDatasource();
        excutor.excuteQuery(reportScript, paramsMap, page, pagesize, datasource);
		
        return excutor;
	}

	private Object preTreatParamValue(String requestParamValue, Object paramType) {
		if(paramType == null) return requestParamValue;
		
		paramType = paramType.toString().toLowerCase();
		if("number".equals(paramType)) {
			return EasyUtils.convertObject2Integer(requestParamValue);
		}
		else if("date".equals(paramType)) {
			return new java.sql.Timestamp(DateUtil.parse(requestParamValue).getTime());
		}
		else {
			return requestParamValue;
		}
	} 
	
	/** 业务日志处理对象 */
    @Autowired private IBusinessLogger businessLogger;
	
	/**
	 * 记录下报表的访问信息。
	 */
	private void outputAccessLog(Long reportId, String methodName, Map<String, String[]> requestMap, long start) {
		Report report = reportService.getReport(reportId);
		String methodCnName = report.getName();
		
		String params = "";
		for(Entry<String, String[]> entry : requestMap.entrySet()) {
			params += entry.getKey() + "=" + entry.getValue()[0] + ", ";
		}
        if (params != null && params.length() > 500) {
            params = params.substring(0, 500);
        }
        
		long runningTime = System.currentTimeMillis() - start;
		
		// 方法的访问日志记录成败不影响方法的正常访问，所以对记录日志过程中各种可能异常进行try catch
        try {
            Log log = new Log("Display." + methodName, "Display." + methodName + "( " + params + ")");
            log.setOperateTable(methodCnName);
            log.setOperateTime(new Date(start));
            log.setMethodExcuteTime((int) runningTime);
            
            businessLogger.output(log);
        } 
        catch(Exception e) {
        	log.error("记录方法【" + methodCnName + "." + methodName + "】的访问日志时出错了。错误信息：" + e.getMessage());
        }
	}
}
