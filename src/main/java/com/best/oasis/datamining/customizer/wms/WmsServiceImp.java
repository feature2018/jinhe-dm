package com.best.oasis.datamining.customizer.wms;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Service;

import com.best.oasis.datamining.Constants;
import com.best.oasis.datamining.report.query.SQLExcutor;
import com.jinhe.tss.framework.component.param.ParamManager;
import com.jinhe.tss.framework.sso.context.Context;
import com.jinhe.tss.util.EasyUtils;

@Service("WmsService")
public class WmsServiceImp implements WmsService {
    
    public Object[] login(String loginName, String password) {
        HttpServletRequest request = Context.getRequestContext().getRequest();
        HttpSession session = request.getSession();
        
        // TODO 执行登陆 select id, userName from gv_sys_accout t where t.loginName = ? and t.password = ?
        
        session.setAttribute("loginUserId", 12L);
        return new Object[] {12L, loginName};
    }
 
	public List<Object[]> getWarehouseList() {
	    HttpSession session = Context.getRequestContext().getRequest().getSession();
	    Long userId = (Long) session.getAttribute("loginUserId");
	    
	    List<Object[]> list = new ArrayList<Object[]>();
	    if( userId != null ) {
	        list.add(new Object[]{104221L, "上海EC仓"});
	        list.add(new Object[]{100544L, "杭州OFC - 海宁仓"});
	        list.add(new Object[]{100200L, "李宁仓库"});
	    }
		return list;
	}
 
	public List<Map<String, Object>> kanban(Long whId) {
		String datasource = ParamManager.getValue(Constants.DEFAULT_CONN_POOL).trim();
		
		Long allocateTypeId = 2427L; // 分配单据日志
        Long pickTypeId     = 557L;  // 拣货单据日志
        Long checkTypeId    = 2600L; // 验货单据日志
        Long sendTypeId     = 548L;  // 发货单据日志
        Long weightTypeId   = 2616L; // 称重单据日志

        Long allocateCancelTypeId = 2552L; // 分配取消单据日志
        Long pickCancelTypeId     = 2551L; // 拣货取消单据日志
        Long checkCancelTypeId    = 2601L; // 验货取消单据日志
        Long sendCancelTypeId     = 1107L; // 发货取消单据日志
        
        String script = "select d.docno docno, d.operatetype_id opType from GV_LOG_DOCUMENT_LOG d, gv_sys_codeinfo dt " + 
                " where d.doctype_id = dt.id and dt.code in ('SO', 'PK') " + 
                " and d.warehouse_id = ? and d.createdtime >= trunc(sysdate) " + 
                " order by d.createdtime asc";
        
        Map<Integer, Object> paramsMap = new HashMap<Integer, Object>();
        paramsMap.put(1, whId);
        
        SQLExcutor excutor = new SQLExcutor();
        excutor.excuteQuery(script, paramsMap, 1, 0, datasource);

        Map<String, List<Long>> docOperations = new HashMap<String, List<Long>>();
        
        // 把每个单据做的操作以map的形式先统计出来
        for (Map<String, Object> row : excutor.result) {
            String docNo = (String) row.get("docno");
            Long optTypeId = EasyUtils.convertObject2Long(row.get("opType"));

            List<Long> optTypeIdList = docOperations.get(docNo);
            if (optTypeIdList == null) {
                docOperations.put(docNo, optTypeIdList = new ArrayList<Long>());
            }

            if (optTypeId.equals(allocateCancelTypeId)) { // 预分配（ 可能是昨天做的分配，今天做的取消 ）
                optTypeIdList.remove(allocateTypeId);
                continue;
            }
            if (optTypeId.equals(pickCancelTypeId)) { // 拣货
                optTypeIdList.remove(pickTypeId);
                continue;
            }
            if (optTypeId.equals(checkCancelTypeId)) { // 验货
                optTypeIdList.remove(checkTypeId);
                continue;
            }
            if (optTypeId.equals(sendCancelTypeId)) { // 发货
                optTypeIdList.remove(sendTypeId);
                continue;
            }

            optTypeIdList.add(optTypeId);
        }
        
        Integer[] kanban = new Integer[6];
        
        /** 获取各个环节执行数量 */
        for (int i = 0; i < 6; i++) {
            kanban[i] = 0;
        }

        // 当天到目前为止的下单数
        script = "select count(*) total from gv_sales_order_header h where h.wh_id = ? " +
        		" and h.createdtime >= trunc(sysdate) and h.status_id <> 560";
        excutor = new SQLExcutor();
        excutor.excuteQuery(script, paramsMap, 1, 0, datasource);
        
        kanban[0] = EasyUtils.convertObject2Integer(excutor.result.get(0).get("total"));
        
        for (Map.Entry<String, List<Long>> entry : docOperations.entrySet()) {
            List<Long> operations = entry.getValue();
            if (operations.contains(allocateTypeId)) {
                kanban[1]++;
            }
            if (operations.contains(pickTypeId)) {
                kanban[2]++;
            }
            if (operations.contains(checkTypeId)) {
                kanban[3]++;
            }
            if (operations.contains(weightTypeId)) {
                kanban[4]++;
            }
            if (operations.contains(sendTypeId)) {
                kanban[5]++;
            }
        }
   
        List<Map<String, Object>> result = new ArrayList<Map<String,Object>>();
        List<String> names  = Arrays.asList("今日下单数", "分配订单数", "拣货订单数", "验货订单数", "称重订单数", "发运订单数");
        List<String> colors = Arrays.asList("red", "#3F5C71", "#a6bfd2", "#d6ffd2", "#3883bd", "green");
        
        for(int i = 0; i < kanban.length; i++) {
            Map<String, Object> map = new HashMap<String, Object>();
            map.put("name", names.get(i));
            map.put("value", kanban[i]);
            map.put("color", colors.get(i));
            
            result.add(map);
        }
        
		return result;
	}
}
