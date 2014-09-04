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
import com.jinhe.dm.data.sqlquery.SQLExcutor;
import com.jinhe.dm.data.util.DataExport;
import com.jinhe.dm.log.AccessLog;
import com.jinhe.dm.log.AccessLogRecorder;
import com.jinhe.tss.framework.component.param.ParamManager;
import com.jinhe.tss.framework.exception.BusinessException;
import com.jinhe.tss.framework.persistence.pagequery.PageInfo;
import com.jinhe.tss.framework.sso.Environment;
import com.jinhe.tss.framework.web.dispaly.grid.DefaultGridNode;
import com.jinhe.tss.framework.web.dispaly.grid.GridDataEncoder;
import com.jinhe.tss.framework.web.dispaly.grid.IGridNode;
import com.jinhe.tss.framework.web.mvc.BaseActionSupport;

/**
 * http://localhost:9000/dm/display/12/1/100
 */
@Controller
@RequestMapping("/display")
public class Display extends BaseActionSupport {
    
    @Autowired private ReportService reportService;
    
    private Map<String, String> getRequestMap(HttpServletRequest request) {
    	Map<String, String[]> parameterMap = request.getParameterMap();
    	Map<String, String> requestMap = new HashMap<String, String>();
    	for(String key : parameterMap.keySet()) {
    		String[] value = parameterMap.get(key);
    		if(value != null && value.length > 0) {
    			requestMap.put(key, value[0]);
    		}
    	}
    	
    	return requestMap;
    }
    
    private Object getLoginUserId() {
        return Environment.getOperatorId();
    }
 
    @RequestMapping("/{reportId}/{page}/{pagesize}")
    public void showAsGrid(HttpServletRequest request, HttpServletResponse response, 
            @PathVariable("reportId") Long reportId, 
            @PathVariable("page") int page,
            @PathVariable("pagesize") int pagesize) {
    	
    	long start = System.currentTimeMillis();
    	Map<String, String> requestMap = getRequestMap(request);
		SQLExcutor excutor = reportService.queryReport(reportId, requestMap, page, pagesize, getLoginUserId());
    	
    	outputAccessLog(reportId, "showAsGrid", requestMap, start);
        
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
    	Map<String, String> requestMap = getRequestMap(request);
		SQLExcutor excutor = reportService.queryReport(reportId, requestMap, page, pagesize, getLoginUserId());
        
        String fileName = reportId + "-" + System.currentTimeMillis() + ".csv";
        String exportPath = ParamManager.getValue(Constants.TEMP_EXPORT_PATH).replace("\n", "") + "/" + fileName;
        DataExport.exportCSV(exportPath, excutor.result, excutor.selectFields);
        DataExport.downloadFileByHttp(response, exportPath);
        
        outputAccessLog(reportId, "exportAsCSV", requestMap, start);
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
    	Map<String, String> requestMap = getRequestMap(request);
        SQLExcutor excutor = reportService.queryReport(reportId, requestMap, 0, 0, getLoginUserId());
        
        outputAccessLog(reportId, "showAsJson", requestMap, start);
        
        return excutor.result;
    }
    
	/**
	 * 记录下报表的访问信息。
	 */
	private void outputAccessLog(Long reportId, String methodName, Map<String, String> requestMap, long start) {
		Report report = reportService.getReport(reportId);
		String methodCnName = report.getName();
		
		String params = "";
		for(Entry<String, String> entry : requestMap.entrySet()) {
			params += entry.getKey() + "=" + entry.getValue() + ", ";
		}
        if (params != null && params.length() > 500) {
            params = params.substring(0, 500);
        }
        
		long runningTime = System.currentTimeMillis() - start;
		
		// 方法的访问日志记录成败不影响方法的正常访问，所以对记录日志过程中各种可能异常进行try catch
        try {
            AccessLog log = new AccessLog();
            log.setClassName(Display.class.getSimpleName());
    		log.setMethodName(methodName);
    		log.setMethodCnName(methodCnName);
            log.setAccessTime(new Date(start));
            log.setRunningTime(runningTime);
            log.setParams(params);
            log.setUserId(Environment.getOperatorId());

            AccessLogRecorder.getInstanse().output(log);
        } 
        catch(Exception e) {
        	log.error("记录方法【" + methodCnName + "." + methodName + "】的访问日志时出错了。错误信息：" + e.getMessage());
        }
	}
}
