package com.jinhe.dm.log;

import java.io.File;
import java.util.List;

import com.jinhe.dm.Constants;
import com.jinhe.tss.cache.extension.workqueue.AbstractTask;
import com.jinhe.tss.cache.extension.workqueue.OutputRecordsManager;
import com.jinhe.tss.framework.component.param.ParamManager;
import com.jinhe.tss.util.FileHelper;

public class LogRecorder extends OutputRecordsManager{
	
	private static LogRecorder instance;
    
    private LogRecorder(){
    }
    
    public static LogRecorder getInstanse(){
        if(instance == null) {
            instance = new LogRecorder();
        }
        return instance;
    }
    
    protected int getMaxSize() { 
    	return 12; 
    }
    
    protected int getMaxTime() { 
    	return 3*60*1000;
    }
    
    protected void excuteTask(List<Object> logs) {
    	AbstractTask task = new FeedbakLogOutputTask();
        task.fill(logs);

        tpool.excute(task);
    }
    
    private final class FeedbakLogOutputTask extends AbstractTask {
		public void excute() {
			String logDir = ParamManager.getValue(Constants.Log_DIR);
			if( new File(logDir).exists() ) {
				new File(logDir).mkdirs();
			}
			
			// 记录日志，每条日志输出到一个文件中
			for (Object temp : records) {
		    	FeedbackLog log = (FeedbackLog) temp;
		    	
		    	File logFile = new File(logDir + File.separator + log.getName());
		    	FileHelper.writeFile(logFile, log.getContent());
		    }
		}
	}
}
