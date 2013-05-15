package com.best.oasis.wmsx.framework;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.jinhe.tss.framework.web.dispaly.grid.DefaultGridNode;
import com.jinhe.tss.framework.web.dispaly.grid.GridDataEncoder;
import com.jinhe.tss.framework.web.dispaly.grid.IGridNode;
import com.jinhe.tss.util.XMLDocUtil;

public class Display {

    public String showAsGrid(String sql, Object...params) {
        SQLExcutor excutor = new SQLExcutor();
        excutor.excuteQuery(sql, params);
        
        List<IGridNode> temp = new ArrayList<IGridNode>();
        for(Map<String, Object> item : excutor.result) {
 
            DefaultGridNode gridNode = new DefaultGridNode();
            gridNode.getAttrs().putAll(item);
            temp.add(gridNode);
        }
        
        GridDataEncoder gEncoder = new GridDataEncoder(temp, XMLDocUtil.dataXml2Doc(excutor.parser.gridTempalte));
        
//        XmlHttpEncoder xmlHttpEncoder = new XmlHttpEncoder();
//        xmlHttpEncoder.put("GridShow", gEncoder);
//        xmlHttpEncoder.print(getWriter());
 
        return gEncoder.toXml();
    }
    
//    private XmlPrintWriter writer;
//    protected XmlPrintWriter getWriter() {
//        if (writer == null) {
//            /* 初始化数据输出流  */
//            HttpServletResponse response = Context.getResponse();
//            response.setContentType("text/html;charset=GBK");
//            try {
//                writer = new XmlPrintWriter(response.getWriter());
//            } catch (Exception e) {
//                throw new BusinessException("初始化数据输出流失败", e);
//            }
//        }
//        return writer;
//    }
    
    public static void main(String[] args) {
        String gridXML = new Display().showAsGrid("select id, orgCode, orgName from gv_bas_orginfo where id=?", 100200);
        System.out.println(gridXML);
        System.exit(1);
    }

}
