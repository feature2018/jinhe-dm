package com.best.oasis.wmsx.report;

import java.util.List;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import com.jinhe.tss.framework.web.dispaly.tree.LevelTreeParser;
import com.jinhe.tss.framework.web.dispaly.tree.TreeEncoder;
import com.jinhe.tss.framework.web.mvc.BaseActionSupport;

@Controller
@RequestMapping("report")
public class ReportAction extends BaseActionSupport {
    
    @Autowired private ReportService reportService;
    
    @RequestMapping("/list")
    public void get2Tree(HttpServletResponse response) {
        List<?> list = reportService.getAllReport();
        TreeEncoder treeEncoder = new TreeEncoder(list, new LevelTreeParser());
        print("SourceTree", treeEncoder);
    }

}
