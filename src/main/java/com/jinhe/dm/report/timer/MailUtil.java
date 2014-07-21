package com.jinhe.dm.report.timer;

import java.io.File;
import java.util.List;
import java.util.Map;

import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeUtility;

import org.apache.log4j.Logger;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;

import com.jinhe.dm.Constants;
import com.jinhe.dm.data.util.DataExport;
import com.jinhe.tss.framework.component.param.ParamManager;
import com.jinhe.tss.framework.exception.BusinessException;

public class MailUtil {
	
	protected static Logger log = Logger.getLogger(MailUtil.class);
	
	private static JavaMailSenderImpl mailSender;
	
	private static String MAIL_SERVER = "hzsmtp1.800best.com";
	private static String SEND_FROM_EMAIL = "BtrBI@800best.com";
	
	// TODO 邮箱信息配置到参数管理里
	public static MailSender getMailSender() {
		if(mailSender != null) {
			return mailSender;
		}
		
		mailSender = new JavaMailSenderImpl();
		mailSender.setHost(MAIL_SERVER);
		mailSender.setPort(25);
		
		return mailSender;
	}
	
	public void send(String subject, String text, String receiver[]) {
		SimpleMailMessage mail = new SimpleMailMessage();

		try {
			mail.setTo(receiver);
			mail.setFrom(SEND_FROM_EMAIL); // 发送者,这里还可以另起Email别名，不用和xml里的username一致
			mail.setSubject(subject); // 主题
			mail.setText(text);       // 邮件内容
			getMailSender().send(mail);
		} 
		catch (Exception e) {
			throw new BusinessException("发送文本邮件时出错了：", e);
		}
	}
	
	public static void send(String title, String receiver[], List<Map<String, Object>> data, List<String> fields) {
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
			html.append("<style type='text/css'> " );
			html.append("	table { border-collapse:collapse; border-spacing:0; }");
			html.append("	td { line-height: 1.42857143; vertical-align: top;  border: 1px solid black; text-align: left;}");
			html.append("	td { margin:0; padding:0; padding: 2px 2px 2px 2px; font-family: 微软雅黑; font-size: 15px;}");
			html.append("</style>");
			html.append("</head>");
			html.append("<body>");
			if(data.size() > 100) {
				html.append("<h1>详细见附件</h1>");
			} else {
				html.append("<table>");
				if(fields != null) {
					html.append("<tr>");
	            	for(String field : fields) {
	            		html.append("<td>").append("&nbsp;").append(field).append("&nbsp;").append("</td>");
	            	}
	            	html.append("</tr>");
	            }
	        	for( Map<String,Object> row : data) {
	        		html.append("<tr>");
	        		for(String field : fields) {
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
	        DataExport.exportCSV(exportPath, data, fields);
	        
			fileName = MimeUtility.encodeWord(fileName); // 使用MimeUtility.encodeWord()来解决附件名称的中文问题
			messageHelper.addAttachment(MimeUtility.encodeWord(fileName), new File(exportPath));
			
			sender.send(mailMessage);
		} 
		catch (Exception e) {
			throw new BusinessException("发送报表邮件时出错了：", e);
		}
	}
}
