package com.jinhe.dm.report.timer;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeUtility;

import org.springframework.mail.MailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;

import com.jinhe.dm.Constants;
import com.jinhe.dm.data.sqlquery.SQLExcutor;
import com.jinhe.dm.data.util.DataExport;
import com.jinhe.dm.report.ReportService;
import com.jinhe.tss.framework.Global;
import com.jinhe.tss.framework.component.param.ParamManager;
import com.jinhe.tss.framework.component.timer.AbstractJob;
import com.jinhe.tss.framework.exception.BusinessException;
import com.jinhe.tss.util.EasyUtils;

public class ReportJob extends AbstractJob {

	private static final String SEND_FROM_EMAIL = "330391381@qq.com";

	private MailSender getMailSender() {
		JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
		mailSender.setHost("smtp.qq.com");
		mailSender.setPort(25);
		
		mailSender.setUsername(SEND_FROM_EMAIL);
		mailSender.setPassword("daodao2013"); 
		
		mailSender.getJavaMailProperties().put("mail.smtp.auth", true);
		
		return mailSender;
	}

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
	        
	        send(title, receiver, excutor);
		}
	}
	
	private void send(String title, String receiver[], SQLExcutor excutor) {
		JavaMailSenderImpl sender = (JavaMailSenderImpl) getMailSender();
		MimeMessage mailMessage = sender.createMimeMessage();
		
		try {
			// 设置utf-8或GBK编码，否则邮件会有乱码
			MimeMessageHelper messageHelper = new MimeMessageHelper(mailMessage, true, "utf-8");
			messageHelper.setTo(receiver);   // 接受者
			messageHelper.setFrom(SEND_FROM_EMAIL);  // 发送者
			messageHelper.setSubject("定时报表：" + title); // 主题
			
			// 邮件内容，注意加参数true
			StringBuffer html = new StringBuffer();
			html.append("<html>");
			html.append("<head>");
			html.append("</head>");
			html.append("<body>");
			if(excutor.result.size() > 100) {
				html.append("<h1>详细见附件</h1>");
			} else {
				html.append("<table>");
				if(excutor.selectFields != null) {
					html.append("<tr>");
	            	for(String field : excutor.selectFields) {
	            		html.append("<td>").append(field).append("</td>");
	            	}
	            	html.append("</tr>");
	            }
	        	for( Map<String,Object> row : excutor.result) {
	        		html.append("<tr>");
	        		for(String field : excutor.selectFields) {
	            		html.append("<td>").append(row.get(field)).append("</td>");
	            	}
	        		html.append("</tr>");
	        	}
				html.append("</table>");
			}
			html.append("</body>");
			html.append("</html>");
			
			messageHelper.setText(html.toString(), true);
			log.debug(html);
			
			// 附件内容
			String fileName = title + "-" + System.currentTimeMillis() + ".csv";
	        String exportPath = ParamManager.getValue(Constants.TEMP_EXPORT_PATH).replace("\n", "") + "/" + fileName;
	        DataExport.exportCSV(exportPath, excutor.result, excutor.selectFields);
	        
			fileName = MimeUtility.encodeWord(fileName); // 使用MimeUtility.encodeWord()来解决附件名称的中文问题
			messageHelper.addAttachment(MimeUtility.encodeWord(fileName), new File(exportPath));
			
			sender.send(mailMessage);
		} 
		catch (Exception e) {
			throw new BusinessException("发送定时报表邮件时出错了：", e);
		}
	}
}
