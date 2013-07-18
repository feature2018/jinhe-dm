package com.best.oasis.datamining.report;

import javax.servlet.http.HttpServletResponse;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockHttpServletRequest;

import com.best.oasis.datamining.Constants;
import com.best.oasis.datamining.TxTestSupport;
import com.best.oasis.datamining.report.Report;
import com.best.oasis.datamining.report.ReportAction;
import com.best.oasis.datamining.report.query.Display;
import com.jinhe.tss.framework.component.param.Param;
import com.jinhe.tss.framework.component.param.ParamConstants;
import com.jinhe.tss.framework.sso.context.Context;

public class DisplayTest extends TxTestSupport {
    
    @Autowired private ReportAction action;
    @Autowired private Display display;
    
    @Test
    public void testReportDisplay() {        
        HttpServletResponse response = Context.getResponse();
        MockHttpServletRequest  request = new MockHttpServletRequest();
        
        Report report1 = new Report();
        report1.setType(Report.TYPE1);
        report1.setParentId(Report.DEFAULT_PARENT_ID);
        report1.setName("report-1");
        report1.setScript(" select id, orgName from gv_bas_orgInfo where id > ? <#if param2??> and orgcode <> ? </#if> ");
        report1.setParam("组织ID:Number,组织CODE:String");
        report1.setRemark("test report");
        action.saveReport(response, report1);
        
        
        log.debug("开始测试报表展示：");
        request.addParameter("param1", "0");
        request.addParameter("param2", "best");
        
        if(paramService.getParam(Constants.DEFAULT_CONN_POOL) == null) {
            addParam(ParamConstants.DEFAULT_PARENT_ID, 
                    Constants.DEFAULT_CONN_POOL, "默认数据源", "connectionpool-1");
        }
        
        Long reportId = report1.getId();
        display.showAsGrid(request, response, reportId, 1, 10);
        display.showAsJson(request, reportId);
        
        if(paramService.getParam(Constants.TEMP_EXPORT_PATH) == null) {
            addParam(ParamConstants.DEFAULT_PARENT_ID, Constants.TEMP_EXPORT_PATH, "默认导出目录", "D:/temp");
        }
        display.exportAsCSV(request, response, reportId, 1, 0);
    }
    
    /** 简单参数 */
    Param addParam(Long parentId, String code, String name, String value) {
        Param param = new Param();
        param.setCode(code);
        param.setName(name);
        param.setValue(value);
        param.setParentId(parentId);
        param.setType(ParamConstants.NORMAL_PARAM_TYPE);
        param.setModality(ParamConstants.SIMPLE_PARAM_MODE);
        paramService.saveParam(param);
        return param;
    }
}
