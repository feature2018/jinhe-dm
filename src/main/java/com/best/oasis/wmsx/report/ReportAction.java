package com.best.oasis.wmsx.report;

import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.jinhe.tss.framework.web.dispaly.tree.LevelTreeParser;
import com.jinhe.tss.framework.web.dispaly.tree.TreeEncoder;
import com.jinhe.tss.framework.web.mvc.BaseActionSupport;

@Controller
@RequestMapping("report")
public class ReportAction extends BaseActionSupport {
    
    @Autowired private ReportService reportService;
    
    @RequestMapping("/all")
    public void getAllReport(HttpServletResponse response) {
        List<?> list = reportService.getAllReport();
        TreeEncoder treeEncoder = new TreeEncoder(list, new LevelTreeParser());
        print("SourceTree", treeEncoder);
    }
    
    @RequestMapping("/groups")
    public void getAllReportGroups(HttpServletResponse response) {
        List<?> list = reportService.getAllReportGroups();
        TreeEncoder treeEncoder = new TreeEncoder(list, new LevelTreeParser());
        print("SourceTree", treeEncoder);
    }
    
    @RequestMapping(value = "/{id}", method = RequestMethod.GET)
    public void getReport(HttpServletResponse response, Long id) {
        
    }

    public void saveReport(HttpServletResponse response, Report report) {
        
    }
    
    public void delete(HttpServletResponse response, Long id) {
        
    }

    public void startOrStop(HttpServletResponse response, Long reportId, Integer disabled) {
        
    }

    public void sort(HttpServletResponse response, Long startId, Long targetId, int direction) {
        
    }

    public void copy(HttpServletResponse response, Long reportId, Long groupId) {
        
    }

    public void move(HttpServletResponse response, Long sourceId, Long targetId) {
        
    }
    
    

}
