package com.jinhe.dm.report;

import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockHttpServletRequest;

import com.jinhe.dm.TxTestSupport;
import com.jinhe.tss.framework.component.log.LogQueryCondition;
import com.jinhe.tss.framework.component.log.LogService;
import com.jinhe.tss.framework.sso.context.Context;

public class ReportTest extends TxTestSupport {
    
    @Autowired private ReportAction action;
    @Autowired private LogService logService;
    
    @Test
    public void testReportCRUD() {
        
        HttpServletResponse response = Context.getResponse();
        MockHttpServletRequest  request = new MockHttpServletRequest();
        
        request.addParameter("parentId", Report.DEFAULT_PARENT_ID.toString());
        action.getReport(request, response, Report.TYPE0);
        
        Report group1 = new Report();
        group1.setType(Report.TYPE0);
        group1.setParentId(Report.DEFAULT_PARENT_ID);
        group1.setName("report-group-1");
        action.saveReport(response, group1);
        
        Report group2 = new Report();
        group2.setType(Report.TYPE0);
        group2.setParentId(Report.DEFAULT_PARENT_ID);
        group2.setName("report-group-2");
        action.saveReport(response, group2);
        
        Report report1 = new Report();
        report1.setType(Report.TYPE1);
        report1.setParentId(group1.getId());
        report1.setName("report-1");
        report1.setScript("select * from dm_report where id = ?");
        report1.setParam("id:1");
        report1.setRemark("test report");
        action.saveReport(response, report1);
        
        action.getAllReport(response);
        action.getAllReportGroups(response);
        
        request.addParameter("reportId", report1.getId().toString());
        action.getReport(request, response, Report.TYPE1);
        
        action.startOrStop(response, group1.getId(), 1);
        action.startOrStop(response, report1.getId(), 0);
        
        action.copy(response, report1.getId(), group2.getId());
        action.sort(response, group1.getId(), group2.getId(), 1);
        action.move(response, report1.getId(), group2.getId());
        
        action.getAllReport(response);
        
        action.delete(response, report1.getId());
        action.getAllReport(response);
        
        try {
            Thread.sleep(1000); // 等待日志异步输出完毕
        } catch (InterruptedException e) {
        }
        
        LogQueryCondition condition = new LogQueryCondition();
        condition.setOperateTimeFrom(new Date(System.currentTimeMillis() - 1000*3600*3));
        Object[] logsInfo = logService.getLogsByCondition(condition);
        List<?> logs = (List<?>)logsInfo[0];
        for(Object temp : logs) {
            log.debug(temp);
        }
    }
}
