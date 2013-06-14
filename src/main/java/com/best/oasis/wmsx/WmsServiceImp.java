package com.best.oasis.wmsx;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Service;

import com.jinhe.tss.framework.sso.context.Context;

@Service("WmsService")
public class WmsServiceImp implements WmsService {
 
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

	/* 
  select d.docno, d.operatetype_id
   from GV_LOG_DOCUMENT_LOG d, gv_sys_codeinfo dt
  where d.doctype_id = dt.id
    and dt.code in ('SO', 'PK')
    and d.warehouse_id = 104221
    and d.createdtime >= trunc(sysdate)
  order by d.createdtime asc

  select count(*) from gv_sales_order_header h 
    where h.wh_id = :warehouse_id and h.createdtime >= trunc(sysdate)
	 */
	public Map<String, Object> kanban(Long whId) {
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("总订单数", 10000);
		map.put("分配订单数", 2000);
		map.put("拣货订单数", 1000);
		map.put("验货订单数", 1000);
		map.put("发运订单数", 5000);
		return map;
	}

	public Object[] login(String loginName, String password) {
		HttpServletRequest request = Context.getRequestContext().getRequest();
		HttpSession session = request.getSession();
		
		// TODO 执行登陆 select id, userName from gv_sys_accout t where t.loginName = ? and t.password = ?
		
		session.setAttribute("loginUserId", 12L);
		return new Object[] {12L, loginName};
	}
}
