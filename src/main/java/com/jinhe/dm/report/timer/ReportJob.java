package com.jinhe.dm.report.timer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.stereotype.Component;


@Component("mailService")
public class ReportJob {
	
	@Autowired private MailSender mailSender;

	public void sendMail() {
		System.out.println("-----------发送邮件!---------");
		SimpleMailMessage msg = new SimpleMailMessage();
		msg.setText("this is a test mail");
		try {
			mailSender.send(msg);
		} catch (MailException e) {
			e.printStackTrace();
		}
		System.out.println("-----------发送成功!---------");
	}
 
}
