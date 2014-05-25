package com.jinhe.dm.analyse.wms;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Service;

import com.jinhe.dm.data.sqlquery.SQLExcutor;
import com.jinhe.dm.data.sqlquery.SqlConfig;
import com.jinhe.tss.framework.sso.context.Context;
import com.jinhe.tss.util.EasyUtils;
import com.jinhe.tss.util.InfoEncoder;

@Service("BaseInfoService")
public class BaseInfoServiceImp implements BaseInfoService {

	public Object[] login(String domain, String loginName, String password) {
		if (domain == null || loginName == null || password == null)
			return null;

		// 核对域名是否正确
		String script = SqlConfig.getWMSSQL("login", 1);
		Map<Integer, Object> paramsMap = new HashMap<Integer, Object>();
		paramsMap.put(1, loginName.toUpperCase());
		paramsMap.put(2, InfoEncoder.string2MD5(password).toLowerCase());
		paramsMap.put(3, domain);

		SQLExcutor excutor = new SQLExcutor();
		excutor.excuteQuery(script, paramsMap);

		if (excutor.result.isEmpty()) {
			return new Object[] { };
		}

		Map<String, Object> row = excutor.result.get(0);
		Long userId = EasyUtils.convertObject2Long(row.get("id"));
		HttpSession session = Context.getRequestContext().getRequest().getSession();
		session.setAttribute("WMS-userId", userId);

		return new Object[] { userId, row.get("userName") };
	}

	public List<Object[]> getWarehouseList(String userId) {
		HttpSession session = Context.getRequestContext().getRequest().getSession();
		Long userIdInSession = (Long) session.getAttribute("WMS-userId");
		if (userId == null || userIdInSession == null || !userIdInSession.equals(Long.parseLong(userId)))
			return null;

		String script = SqlConfig.getWMSSQL("whList", 2);

		Map<Integer, Object> paramsMap = new HashMap<Integer, Object>();
		paramsMap.put(1, userId);

		SQLExcutor excutor = new SQLExcutor();
		excutor.excuteQuery(script, paramsMap);

		List<Object[]> result = new ArrayList<Object[]>();
		for (Map<String, Object> row : excutor.result) {
			result.add(new Object[] {row.get("id"), row.get("name")});
		}
		return result;
	}
	
	public List<Object[]> getWarehouseList() {
		String script = SqlConfig.getWMSSQL("whList", 1);

		Map<Integer, Object> paramsMap = new HashMap<Integer, Object>();

		SQLExcutor excutor = new SQLExcutor();
		excutor.excuteQuery(script, paramsMap);

		List<Object[]> result = new ArrayList<Object[]>();
		for (Map<String, Object> row : excutor.result) {
			result.add(new Object[] {row.get("id"), row.get("name")});
		}
		return result;
	}
}
