package com.best.oasis.wmsx.framework;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import com.jinhe.tss.framework.exception.BusinessException;
import com.jinhe.tss.framework.web.dispaly.XmlPrintWriter;
import com.jinhe.tss.framework.web.dispaly.grid.DefaultGridNode;
import com.jinhe.tss.framework.web.dispaly.grid.GridDataEncoder;
import com.jinhe.tss.framework.web.dispaly.grid.IGridNode;
import com.jinhe.tss.framework.web.dispaly.xmlhttp.XmlHttpEncoder;
import com.jinhe.tss.util.XMLDocUtil;

/**
 * http://localhost:9000/wmsx/display/showAsGrid/1
 */
@Controller
@RequestMapping("/display")
public class Display {
 
    static List<String> sqls = new ArrayList<String>();
    
    static {
        sqls.add("select sku.skucode SKU, sku.descrcn 产品名称, sku.skueancode EAN, l.locationcode as 库位, " +
                " t.qtyuom as 库存数量, t.qtyuseuom as 可用数量, t.qtyallocateduom as 分配量 " +
                " from gv_inv_lotlocationuom t, gv_bas_sku sku, gv_bas_location l " +
                " where t.qtyuom > 800 and t.sku_id = sku.id and l.id = t.location_id and t.warehouse_id = ?");
        sqls.add("select id, orgCode, orgName from gv_bas_orginfo where id >= ?");
        sqls.add("select id, whCode 仓库Code, w.descr 仓库 from gv_bas_warehouse w where w.id >= ?");
    }
 
    @RequestMapping("/showAsGrid/{index}")
    public void showAsGrid(HttpServletResponse response, 
            @PathVariable("index") int index) {
        
        String sql = sqls.get(index);
        
        SQLExcutor excutor = new SQLExcutor();
        excutor.excuteQuery(sql, 100200L);
        
        List<IGridNode> temp = new ArrayList<IGridNode>();
        for(Map<String, Object> item : excutor.result) {
            DefaultGridNode gridNode = new DefaultGridNode();
            gridNode.getAttrs().putAll(item);
            temp.add(gridNode);
        }
        
        GridDataEncoder gEncoder = new GridDataEncoder(temp, XMLDocUtil.dataXml2Doc(excutor.parser.gridTempalte));
        
        XmlHttpEncoder xmlHttpEncoder = new XmlHttpEncoder();
        xmlHttpEncoder.put("GridData", gEncoder);
        xmlHttpEncoder.put("PageData", "<pagelist totalpages=\"10\" totalrecords=\"999\" currentpage=\"3\" pagesize=\"100\"/>");
        xmlHttpEncoder.print(getWriter(response));
    }
    
   
    protected XmlPrintWriter getWriter(HttpServletResponse response) {
        response.setContentType("text/html;charset=GBK");
        try {
            return new XmlPrintWriter(response.getWriter());
        } catch (Exception e) {
            throw new BusinessException("初始化数据输出流失败", e);
        }
    }

}
