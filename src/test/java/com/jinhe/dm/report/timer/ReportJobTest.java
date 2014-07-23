package com.jinhe.dm.report.timer;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.jinhe.dm.TxTestSupport;
import com.jinhe.dm.report.Report;
import com.jinhe.dm.report.ReportService;

public class ReportJobTest extends TxTestSupport {
	
	@Autowired private ReportService service;

	@Test
	public void testReportJob() {
        Report report1 = new Report();
        report1.setType(Report.TYPE1);
        report1.setParentId(Report.DEFAULT_PARENT_ID);
        report1.setName("report-1");
        report1.setScript(" select id, name from dm_report " +
        		" where id > ? <#if param2??> and type <> ? <#else> and type = 1 </#if>" +
        		"	and createTime > ?");
        
        String paramsConfig = 
        		"[ {'label':'报表ID', 'type':'Number', 'nullable':'false', 'jsonUrl':'../xxx/list', 'multiple':'true'}," +
        		  "{'label':'报表类型', 'type':'String'}," +
        		  "{'label':'创建时间', 'type':'date'}]"	;
        report1.setParam(paramsConfig);
        
        service.saveReport(report1);
        
        ReportJob job = new ReportJob();
        
        String jobConfig = "1:报表一:pjjin@800best.com,BL00618:param1=0,param2=0,param3=today-0\n" + 
			               "1:报表一:BL00618,pjjin@800best.com:param1=0,param3=today-1";
		job.excuteJob(jobConfig);
	}
	
    protected String getDefaultSource(){
    	return "connectionpool";
    }
}
