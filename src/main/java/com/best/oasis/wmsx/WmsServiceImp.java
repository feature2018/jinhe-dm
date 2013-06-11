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

	public List<Object[]> getCustomerList() {
//		HttpSession session = Context.getRequestContext().getRequest().getSession();
//		Long userId = (Long) session.getAttribute("loginUserId");
		
		List<Object[]> list = new ArrayList<Object[]>();
		list.add(new Object[]{1L, "李宁"});
		list.add(new Object[]{2L, "茵曼"});
		list.add(new Object[]{3L, "七匹狼"});
		return list;
	}

	public List<Object[]> getWarehouseList() {
		List<Object[]> list = new ArrayList<Object[]>();
		list.add(new Object[]{1L, "上海仓"});
		list.add(new Object[]{2L, "杭州仓"});
		list.add(new Object[]{3L, "广州仓"});
		return list;
	}

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
