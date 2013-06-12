package com.best.oasis.wmsx.report.result;

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

import com.best.oasis.wmsx.report.Report;
import com.best.oasis.wmsx.report.ReportService;
import com.jinhe.tss.framework.persistence.pagequery.PageInfo;
import com.jinhe.tss.framework.web.dispaly.grid.DefaultGridNode;
import com.jinhe.tss.framework.web.dispaly.grid.GridDataEncoder;
import com.jinhe.tss.framework.web.dispaly.grid.IGridNode;
import com.jinhe.tss.framework.web.mvc.BaseActionSupport;
import com.jinhe.tss.util.DateUtil;
import com.jinhe.tss.util.EasyUtils;
import com.jinhe.tss.util.XMLDocUtil;

/**
 * http://localhost:9000/wmsx/display/12/1/100
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
        
        print("SourceTree", gEncoder);
        
        PageInfo pageInfo = new PageInfo();
        pageInfo.setPageSize(pagesize);
        pageInfo.setTotalRows(excutor.count);
        pageInfo.setPageNum(page);
        print("PageInfo", pageInfo);
    }

	private SQLExcutor queryReport(HttpServletRequest request, Long reportId,
			int page, int pagesize) {
		Map<String, String[]> requestMap = request.getParameterMap();
    	
    	Report report = reportService.getReport(reportId);
        String script = report.getScript();
        String params = report.getParam();
        
    	Map<Integer, Object> paramsMap = new HashMap<Integer, Object>();
    	
    	String[] paramArray = params.split(",");
    	for(int i = 0; i < paramArray.length; i++) {
    		int index = i + 1;
    		String paramType = paramArray[i].split(":")[1].toLowerCase();
    		String paramValue = requestMap.get("param" + index)[0];
    		
    		Object value;
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
        
        // TODO 结合 paramsMap 进行 freemarker解析 sql
        
        SQLExcutor excutor = new SQLExcutor();
        excutor.excuteQuery(script, paramsMap, page, pagesize);
		return excutor;
	}
 
    @RequestMapping("/json/{reportId}")
    @ResponseBody
    public List<Map<String, Object>> showAsJson(HttpServletRequest request, @PathVariable("reportId") Long reportId) {
    	SQLExcutor excutor = queryReport(request, reportId, 0, 0);
    	return excutor.result;
    }
    
}
