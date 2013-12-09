package com.jinhe.dm.log;

import org.junit.Test;

import com.jinhe.dm.TxTestSupport;

public class LogRecorderTest extends TxTestSupport {
	
	@Test
	public void testLogRecord() {
		LogRecorder logRecorder = LogRecorder.getInstanse();
		for(int i = 1; i <= 20; i++) {
			FeedbackLog log = new FeedbackLog();
			log.setName("log" + i);
			log.setContent("testestsetsetstestsetsets\ntestset");
			logRecorder.output(log);
		}
		
		try {
			Thread.sleep(1000); // 等待日志输出完毕
		} catch (InterruptedException e) {
		}
	}

}
