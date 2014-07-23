package com.jinhe.dm.report.timer;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.jinhe.dm.data.sqlquery.SQLExcutor;
import com.jinhe.dm.report.ReportService;
import com.jinhe.tss.framework.Global;
import com.jinhe.tss.framework.component.timer.AbstractJob;
import com.jinhe.tss.um.helper.dto.OperatorDTO;
import com.jinhe.tss.um.service.ILoginService;
import com.jinhe.tss.util.EasyUtils;

/**
 * com.jinhe.dm.report.timer.ReportJob | 0 36 10 * * ? | 268:各省日货量流向:pjjin@800best.com,BL01037:param1=today-1
 * 261:各省生产货量:BL00618,BL01037:param1=today-0
 */
public class ReportJob extends AbstractJob {
	
	ReportService reportService = (ReportService) Global.getContext().getBean("ReportService");
	ILoginService loginService  = (ILoginService) Global.getContext().getBean("LoginService");

	/* 
	 * jobConfig的格式为
	 *  
	 *  1:报表一:x1@x.com
     *  2:报表二:x2@x.com
	 *	3:报表三:x3@x.com,x4@x.com:param1=a,param2=b
	 *  
	 */
	protected void excuteJob(String jobConfig) {
		
		String[] jobConfigs = EasyUtils.split(jobConfig, "\n");
		
		for(int i = 0; i < jobConfigs.length; i++) {
			String reportInfo[] = EasyUtils.split(jobConfigs[i], ":");
			Long reportId = EasyUtils.convertObject2Long(reportInfo[0]);
			String title = reportInfo[1];
			String receiver[] = getEmails( reportInfo[2].trim().split(",") );
					
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

	private String[] getEmails(String[] receiver) {
		// 将登陆账号转换成该用户的邮箱
		List<String> emails = new ArrayList<String>();
		for(int j = 0; j < receiver.length; j++) {
			String temp = receiver[j];
			
			// 判断配置的是否已经是email，如不是，做loginName处理
			if(temp.indexOf("@") < 0) {
				try {
					OperatorDTO user = loginService.getOperatorDTOByLoginName(temp);
					emails.add( (String) user.getAttribute("email") );
				} catch(Exception e) {
				}
			}
			else {
				emails.add(temp);
			}
		}
		receiver = new String[emails.size()];
		receiver = emails.toArray(receiver);
		
		return receiver;
	}
}
