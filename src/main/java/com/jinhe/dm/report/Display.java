package com.jinhe.dm.report;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

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
import com.jinhe.tss.framework.persistence.pagequery.PageInfo;
import com.jinhe.tss.framework.web.dispaly.grid.DefaultGridNode;
import com.jinhe.tss.framework.web.dispaly.grid.GridDataEncoder;
import com.jinhe.tss.framework.web.dispaly.grid.IGridNode;
import com.jinhe.tss.framework.web.mvc.BaseActionSupport;
import com.jinhe.tss.util.DateUtil;
import com.jinhe.tss.util.EasyUtils;
import com.jinhe.tss.util.XMLDocUtil;

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
        GridDataEncoder gEncoder = new GridDataEncoder(temp, XMLDocUtil.dataXml2Doc(excutor.parser.gridTempalte));
        
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
        DataExport.exportCSV(exportPath, excutor.result, excutor.parser.selectFields);
        DataExport.downloadFileByHttp(response, exportPath);
        
        outputAccessLog(reportId, "exportAsCSV", request.getParameterMap(), start);
    }
    
    @RequestMapping("/json/{reportId}")
    @ResponseBody
    public List<Map<String, Object>> showAsJson(HttpServletRequest request, @PathVariable("reportId") Long reportId) {
        SQLExcutor excutor = queryReport(request, reportId, 0, 0);
        return excutor.result;
    }
    
	private SQLExcutor queryReport(HttpServletRequest request, Long reportId, int page, int pagesize) {
	    
		Map<String, String[]> requestMap = request.getParameterMap();
    	Report report = reportService.getReport(reportId);
        
        String params = report.getParam();
    	Map<Integer, Object> paramsMap = new HashMap<Integer, Object>();
    	if( !EasyUtils.isNullOrEmpty(params) ) {
    	    String[] paramArray = params.split(",");
            for(int i = 0; i < paramArray.length; i++) {
                int index = i + 1;
                String paramKy = "param" + index;
                if( !requestMap.containsKey(paramKy) ) continue;
                
                String paramValue = requestMap.get(paramKy)[0];
                Object value;
                
                String paramType = paramArray[i].split(":")[1].toLowerCase();
                if("number".equals(paramType)) {
                    value = EasyUtils.convertObject2Integer(paramValue);
                }
                else if("date".equals(paramType)) {
                    value = new java.sql.Timestamp(DateUtil.parse(paramValue).getTime());
                }
                else {
                    value = paramValue;
                }
                
                paramsMap.put(index, value);
            }
    	}
    	
        // 结合 requestMap 进行 freemarker解析 sql
    	String script = report.getScript();
    	script = SOUtil.freemarkerParse(script, requestMap);
        
        SQLExcutor excutor = new SQLExcutor();
        String datasource = report.getDatasource();
        excutor.excuteQuery(script, paramsMap, page, pagesize, datasource);
		
        return excutor;
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
