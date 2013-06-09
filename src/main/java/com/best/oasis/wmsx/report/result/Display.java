package com.best.oasis.wmsx.report.result;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import com.best.oasis.wmsx.report.Report;
import com.best.oasis.wmsx.report.ReportService;
import com.jinhe.tss.framework.web.dispaly.grid.DefaultGridNode;
import com.jinhe.tss.framework.web.dispaly.grid.GridDataEncoder;
import com.jinhe.tss.framework.web.dispaly.grid.IGridNode;
import com.jinhe.tss.framework.web.mvc.BaseActionSupport;
import com.jinhe.tss.util.XMLDocUtil;

/**
 * http://localhost:9000/wmsx/display/12/1/100
 */
@Controller
@RequestMapping("/display")
public class Display extends BaseActionSupport {
    
    @Autowired private ReportService reportService;
 
    @RequestMapping("/{reportId}/{page}/{pagesize}")
    public void showAsGrid(HttpServletResponse response, 
            @PathVariable("reportId") Long reportId, 
            @PathVariable("page") int page,
            @PathVariable("pagesize") int pagesize,
            Map<String, String> paramsMap) {
        
        Report report = reportService.getReport(reportId);
        String sql = report.getScript();
        
        SQLExcutor excutor = new SQLExcutor();
        excutor.excuteQuery(sql, 100200L);
        
        List<IGridNode> temp = new ArrayList<IGridNode>();
        for(Map<String, Object> item : excutor.result) {
            DefaultGridNode gridNode = new DefaultGridNode();
            gridNode.getAttrs().putAll(item);
            temp.add(gridNode);
        }
        
        GridDataEncoder gEncoder = new GridDataEncoder(temp, XMLDocUtil.dataXml2Doc(excutor.parser.gridTempalte));
        
        print("SourceTree", gEncoder);
        print("PageData", "<pagelist totalpages=\"10\" totalrecords=\"999\" currentpage=\"3\" pagesize=\"100\"/>");
    }
 

}
