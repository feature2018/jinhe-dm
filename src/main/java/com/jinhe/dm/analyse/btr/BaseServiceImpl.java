package com.jinhe.dm.analyse.btr;

import java.util.ArrayList;
import java.util.Arrays;
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

@Service("BaseService")
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
		Long userId = EasyUtils.convertObject2Long(row.get("id"));
		HttpSession session = Context.getRequestContext().getRequest().getSession();
		session.setAttribute("BTR-USERID", userId);
		
		return true;
	}
	
	@SuppressWarnings("unchecked")
	public List<?> getOrgList() {
		String script = "select t.name as id, t.id as pk, t.code as code, t.name as name from usrvf_gg.gtv_org_golden t where t.parent_id=5555";
		SQLExcutor excutor = new SQLExcutor();
		excutor.excuteQuery(script);
 
        HttpSession session = Context.getRequestContext().getSession();
        List<String> fatherGroupNames = (List<String>) session.getAttribute(BTRAfterLoginCustomizer.USER_GROUPS_NAME);
        if(fatherGroupNames.size() == 1) { // 总部员工
        	return excutor.result;
        } 
        else if(fatherGroupNames.size() >= 2) { // 分公司员工 & 分拨员工，只能看到其所在的分公司
        	for(Map<String, Object> temp : excutor.result) {
        		if(temp.get("name").equals(fatherGroupNames.get(1))) {
        			return Arrays.asList(temp);
        		}
        	}
        }
 
		return new ArrayList<Object>();
	}
	
	@SuppressWarnings("unchecked")
	public List<?> getCenterList(String orgIds) {
		String script = "select t.name as id, t.id as pk, t.code as code, t.name as name" +
				" from usrvf_gg.gt_site t " +
				" where type_code = '01' and status = 'ENABLE'  and org_id in ( " + orgIds + " ) ";
		SQLExcutor excutor = new SQLExcutor();
		excutor.excuteQuery(script);
		
		HttpSession session = Context.getRequestContext().getSession();
		List<String> fatherGroupNames = (List<String>) session.getAttribute(BTRAfterLoginCustomizer.USER_GROUPS_NAME);
        if(fatherGroupNames.size() >= 3) { // 分拨员工，只能看到其所在的分拨
        	for(Map<String, Object> temp : excutor.result) {
        		if(temp.get("name").equals(fatherGroupNames.get(2))) {
        			return Arrays.asList(temp);
        		}
        	}
        }
		
		return excutor.result;
	}
}
