package com.jinhe.dm.analyse.btr;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Service;

import com.jinhe.dm.data.sqlquery.SQLExcutor;
import com.jinhe.dm.data.sqlquery.SqlConfig;
import com.jinhe.tss.framework.sso.context.Context;
import com.jinhe.tss.util.EasyUtils;
import com.jinhe.tss.util.InfoEncoder;

@Service("BaseInfoService")
public class BaseServiceImpl implements BaseService {
 
	public boolean login(String loginName, String password) {
		if (loginName == null || password == null)
			return false;

		String script = SqlConfig.getWMSSQL("login", 1);
		Map<Integer, Object> paramsMap = new HashMap<Integer, Object>();
		paramsMap.put(1, loginName);
		paramsMap.put(2, InfoEncoder.string2MD5(password).toLowerCase());

		SQLExcutor excutor = new SQLExcutor();
		excutor.excuteQuery(script, paramsMap);

		if (excutor.result.isEmpty()) {
			return false;
		}

		Map<String, Object> row = excutor.result.get(0);
		Long userId = EasyUtils.convertObject2Long(row.get("ID"));
		HttpSession session = Context.getRequestContext().getRequest().getSession();
		session.setAttribute("BTR-USERID", userId);
		
		// TODO 读取登录用户有权限看到的分公司、分拨等信息
		script = "select t.id as id, t.code as code, t.name as name from usrvf_gg.gtv_org_golden t";
		excutor = new SQLExcutor();
		excutor.excuteQuery(script, paramsMap);
		
		script = "select t.id, t.code, t.name, t.org_id, t.org_name " +
				" from usrvf_gg.gt_site t " +
				" where type_code = '01' and status = 'ENABLE'  and org_id in (60000) ";
		excutor = new SQLExcutor();
		excutor.excuteQuery(script, paramsMap);

		return true;
	}
}
