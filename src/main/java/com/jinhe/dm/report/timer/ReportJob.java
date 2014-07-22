package com.jinhe.dm.report.timer;

import java.util.HashMap;
import java.util.Map;

import com.jinhe.dm.data.sqlquery.SQLExcutor;
import com.jinhe.dm.report.ReportService;
import com.jinhe.tss.framework.Global;
import com.jinhe.tss.framework.component.timer.AbstractJob;
import com.jinhe.tss.util.EasyUtils;

/**
 *
 */
public class ReportJob extends AbstractJob {

	/* 
	 * jobConfig的格式为
	 *  
	 *  1:报表一:x1@x.com
     *  2:报表二:x2@x.com
	 *	3:报表三:x3@x.com,x4@x.com:param1=a,param2=b
	 *  
	 */
	protected void excuteJob(String jobConfig) {
		ReportService reportService = (ReportService) Global.getContext().getBean("ReportService");
		
		String[] jobConfigs = EasyUtils.split(jobConfig, "\n");
		
		for(int i = 0; i < jobConfigs.length; i++) {
			String reportInfo[] = EasyUtils.split(jobConfigs[i], ":");
			Long reportId = EasyUtils.convertObject2Long(reportInfo[0]);
			String title = reportInfo[1];
			String receiver[] = reportInfo[2].trim().split(",");
					
	    	Map<String, String> paramsMap = new HashMap<String, String>();
	    	if(reportInfo.length > 3) {
	    		String[] params = reportInfo[3].split(",");
	    		for(String param : params) {
	    			String[] keyValue = param.split("=");
	    			paramsMap.put(keyValue[0].trim(), keyValue[1].trim());
	    		}
	    	}
	        SQLExcutor excutor = reportService.queryReport(reportId, paramsMap, 0, 0, null);
	        
	        MailUtil.send(title, receiver, excutor.result, excutor.selectFields);
		}
	}
}
