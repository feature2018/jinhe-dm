package com.jinhe.dm.report.timer;

import java.io.File;

import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeUtility;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.AbstractJUnit4SpringContextTests;

@ContextConfiguration(locations = { "classpath:META-INF/spring-timer.xml" })
public class SpringMailTest extends AbstractJUnit4SpringContextTests {

	@Autowired
	MailSender sender;

//	@Test
	public void testSendMail() {
		SimpleMailMessage mail = new SimpleMailMessage();

		try {
			mail.setTo("pjjin@800best.com");// 接受者
			mail.setFrom("pjjin@800best.com");// 发送者,这里还可以另起Email别名，不用和xml里的username一致
			mail.setSubject("spring mail test!");// 主题
			mail.setText("springMail的简单发送测试");// 邮件内容
			sender.send(mail);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	@Test
	public void send() {
		// 获取JavaMailSender bean
		JavaMailSenderImpl senderImpl = new JavaMailSenderImpl();
		MimeMessage mailMessage = senderImpl.createMimeMessage();
		
		try {
			// 设置utf-8或GBK编码，否则邮件会有乱码
			MimeMessageHelper messageHelper = new MimeMessageHelper(mailMessage, true, "utf-8");
			
			messageHelper.setTo("pjjin@800best.com");// 接受者
			messageHelper.setFrom("lovejava@163.com");// 发送者
			messageHelper.setSubject("测试邮件");// 主题
			// 邮件内容，注意加参数true
			// //注意<img/>标签，src='cid:a'，'cid'是contentId的缩写，'a'是一个标记，需要在后面的代码中调用MimeMessageHelper的addInline方法替代成文件  
			messageHelper
					.setText(
							"<html><head></head><body><h1>hello!!chao.wang</h1><img src='cid:a'/></body></html>",
							true);
			// 附件内容
			messageHelper.addInline("a", new File("d:/temp/tss.jpg"));
			messageHelper.addAttachment("b", new File("d:/temp/tss2.jpg"));
			
			File file = new File("d:/temp/测试附件.rar");
			// 这里的方法调用和插入图片是不同的，使用MimeUtility.encodeWord()来解决附件名称的中文问题
			messageHelper.addAttachment(MimeUtility.encodeWord(file.getName()), file);
			
			((JavaMailSender)sender).send(mailMessage);
		} 
		catch (Exception e) {
			e.printStackTrace();
		}
	}

}
