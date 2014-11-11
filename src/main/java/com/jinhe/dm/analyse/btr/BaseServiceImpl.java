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

		SQLExcutor excutor = new SQLExcutor(false);
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
	public List<Map<String, Object>>  getOrgList() {
		String script = "select t.name as id, t.id as pk, t.code as code, t.name as name from gtv_org_golden t where t.parent_id=5555";
		SQLExcutor excutor = new SQLExcutor(false);
		excutor.excuteQuery(script);
 
		List<String> fatherGroups = _BTRHelper.getFatherGroups();
        if(fatherGroups != null) {
            if(fatherGroups.size() == 1) { // 总部员工
            	return excutor.result;
            } 
            else if(fatherGroups.size() >= 2) { // 分公司员工 & 分拨员工，只能看到其所在的分公司
            	for(Map<String, Object> temp : excutor.result) {
            		if(temp.get("name").equals(fatherGroups.get(1))) {
            			return Arrays.asList(temp);
            		}
            	}
            }
        }
 
		return new ArrayList<Map<String, Object>>();
	}
	
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> getCenterList(String org) {
		String script = "select t.name as id, t.id as pk, t.code as code, t.name as name" +
				" from gt_site t " +
				" where type_code = '01' and status = 'ENABLE'  and org_name = '" + org + "' ";
		SQLExcutor excutor = new SQLExcutor(false);
		excutor.excuteQuery(script);
		
		List<String> fatherGroups = _BTRHelper.getFatherGroups();
		if(fatherGroups != null && fatherGroups.size() >= 3) { // 分拨员工，只能看到其所在的分拨
        	for(Map<String, Object> temp : excutor.result) {
        		if(temp.get("name").equals(fatherGroups.get(2))) {
        			return Arrays.asList(temp);
        		}
        	}
        }
		
		return excutor.result;
	}
	
	public List<Map<String, Object>> getAllCenterList() {
		String script = "select t.name as id, t.id as pk, t.code as code, t.name as name" +
				" from gt_site t " +
				" where type_code = '01' and status = 'ENABLE' ";
		SQLExcutor excutor = new SQLExcutor(false);
		excutor.excuteQuery(script);
 
		return excutor.result;
	}
}
