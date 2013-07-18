package com.best.oasis.datamining.report.query;

import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.best.oasis.datamining.Constants;
import com.best.oasis.datamining.report.Report;
import com.best.oasis.datamining.report.ReportService;
import com.best.oasis.datamining.report.util.DataExport;
import com.jinhe.tss.framework.component.param.ParamManager;
import com.jinhe.tss.framework.persistence.pagequery.PageInfo;
import com.jinhe.tss.framework.web.dispaly.grid.DefaultGridNode;
import com.jinhe.tss.framework.web.dispaly.grid.GridDataEncoder;
import com.jinhe.tss.framework.web.dispaly.grid.IGridNode;
import com.jinhe.tss.framework.web.mvc.BaseActionSupport;
import com.jinhe.tss.util.DateUtil;
import com.jinhe.tss.util.EasyUtils;
import com.jinhe.tss.util.XMLDocUtil;

import freemarker.template.Configuration;
import freemarker.template.Template;

/**
 * http://localhost:9000/dm/display/12/1/100
 */
@Controller
@RequestMapping("/display")
public class Display extends BaseActionSupport {
    
    @Autowired private ReportService reportService;
 
    @RequestMapping("/{reportId}/{page}/{pagesize}")
    public void showAsGrid(HttpServletRequest request, HttpServletResponse response, 
            @PathVariable("reportId") Long reportId, 
            @PathVariable("page") int page,
            @PathVariable("pagesize") int pagesize) {
    	
    	SQLExcutor excutor = queryReport(request, reportId, page, pagesize);
        
        List<IGridNode> temp = new ArrayList<IGridNode>();
        for(Map<String, Object> item : excutor.result) {
            DefaultGridNode gridNode = new DefaultGridNode();
            gridNode.getAttrs().putAll(item);
            temp.add(gridNode);
        }
        GridDataEncoder gEncoder = new GridDataEncoder(temp, XMLDocUtil.dataXml2Doc(excutor.parser.gridTempalte));
        
        PageInfo pageInfo = new PageInfo();
        pageInfo.setPageSize(pagesize);
        pageInfo.setTotalRows(excutor.count);
        pageInfo.setPageNum(page);
        
        print(new String[] {"ReportData", "PageInfo"}, new Object[] {gEncoder, pageInfo});
    }
    
    @RequestMapping("/export/{reportId}/{page}/{pagesize}")
    public void exportAsCSV(HttpServletRequest request, HttpServletResponse response, 
            @PathVariable("reportId") Long reportId, 
            @PathVariable("page") int page,
            @PathVariable("pagesize") int pagesize) {
        
        SQLExcutor excutor = queryReport(request, reportId, page, pagesize);
        
        String fileName = reportId + ".csv";
        String exportPath = ParamManager.getValue(Constants.TEMP_EXPORT_PATH).replace("\n", "") + "/" + fileName;
        DataExport.exportCSV(exportPath, excutor.result, excutor.parser.selectFields);
        DataExport.downloadFileByHttp(response, exportPath);
    }
    
    @RequestMapping("/json/{reportId}")
    @ResponseBody
    public List<Map<String, Object>> showAsJson(HttpServletRequest request, @PathVariable("reportId") Long reportId) {
        SQLExcutor excutor = queryReport(request, reportId, 0, 0);
        return excutor.result;
    }
    
	private SQLExcutor queryReport(HttpServletRequest request, Long reportId, int page, int pagesize) {
	    
		Map<String, String[]> requestMap = request.getParameterMap();
    	Report report = reportService.getReport(reportId);
        
        String params = report.getParam();
    	Map<Integer, Object> paramsMap = new HashMap<Integer, Object>();
    	if( !EasyUtils.isNullOrEmpty(params) ) {
    	    String[] paramArray = params.split(",");
            for(int i = 0; i < paramArray.length; i++) {
                int index = i + 1;
                String paramKy = "param" + index;
                if( !requestMap.containsKey(paramKy) ) continue;
                
                String paramValue = requestMap.get(paramKy)[0];
                Object value;
                
                String paramType = paramArray[i].split(":")[1].toLowerCase();
                if("number".equals(paramType)) {
                    value = EasyUtils.convertObject2Integer(paramValue);
                }
                else if("date".equals(paramType)) {
                    value = DateUtil.parse(paramValue);
                }
                else {
                    value = paramValue;
                }
                
                paramsMap.put(index, value);
            }
    	}
    	
        // 结合 requestMap 进行 freemarker解析 sql
    	String script = report.getScript();
    	script = freemarkerParser(script, requestMap);
        
        SQLExcutor excutor = new SQLExcutor();
        String datasource = report.getDatasource();
        excutor.excuteQuery(script, paramsMap, page, pagesize, datasource);
		
        return excutor;
	}
	
    /** 用Freemarker引擎解析脚本 */
    private String freemarkerParser(String script, Map<String, String[]> requestMap) {
        try {
            Template temp = new Template("t.ftl", new StringReader(script), new Configuration());
            Writer out = new StringWriter();
            temp.process(requestMap, out);
            script = out.toString();
            out.flush();
        } catch (Exception e) {
            log.error("用Freemarker引擎解析脚本出错了", e);
            return script;
        }  
        return script;
    }
    
}
