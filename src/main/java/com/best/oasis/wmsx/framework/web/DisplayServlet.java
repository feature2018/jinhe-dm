//package com.best.oasis.wmsx.framework.web;
//
//import java.io.IOException;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Map;
//
//import javax.servlet.ServletException;
//import javax.servlet.annotation.WebServlet;
//import javax.servlet.http.HttpServlet;
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//
//import com.best.oasis.wmsx.framework.SQLExcutor;
//import com.jinhe.tss.framework.web.dispaly.XmlPrintWriter;
//import com.jinhe.tss.framework.web.dispaly.grid.DefaultGridNode;
//import com.jinhe.tss.framework.web.dispaly.grid.GridDataEncoder;
//import com.jinhe.tss.framework.web.dispaly.grid.IGridNode;
//import com.jinhe.tss.util.XMLDocUtil;
// 
//
//@WebServlet(name="DisplayServlet", urlPatterns="/display.t")
//public class DisplayServlet extends HttpServlet {
//    private static final long serialVersionUID = 8087850681949512666L;
//    
//    public void init() {
//        System.out.println("DisplayServlet init...........");
//    }
//
//    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
//        doPost(request, response);
//    }
// 
//    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
//        
//        SQLExcutor excutor = new SQLExcutor();
//        excutor.excuteQuery("select id, orgCode, orgName from gv_bas_orginfo where id >= ?", 100200);
//        
//        List<IGridNode> temp = new ArrayList<IGridNode>();
//        for(Map<String, Object> item : excutor.result) {
// 
//            DefaultGridNode gridNode = new DefaultGridNode();
//            gridNode.getAttrs().putAll(item);
//            temp.add(gridNode);
//        }
//        
//        GridDataEncoder gEncoder = new GridDataEncoder(temp, XMLDocUtil.dataXml2Doc(excutor.parser.gridTempalte));
//        
//        response.setContentType("text/html;charset=GBK");
//        XmlPrintWriter writer = new XmlPrintWriter(response.getWriter());
//        gEncoder.print(writer);
//    }
//}
//
//	