package com.jinhe.dm.analyse.btr;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.jinhe.dm.data.sqlquery.SQLExcutor;
import com.jinhe.tss.framework.sso.context.Context;

@Controller
@RequestMapping("/btr")
public class ServiceList {
	
	protected Logger logger = Logger.getLogger(this.getClass());
	
	@Autowired private BaseService baseService;
	
	/**
	 * 读取登录用户有权限看到的分公司
	 */
	@RequestMapping("/orgs")
	@ResponseBody
	@SuppressWarnings("unchecked")
	public List<?> getOrgList() {
		String script = "select t.id as id, t.code as code, t.name as name from usrvf_gg.gtv_org_golden t";
		SQLExcutor excutor = new SQLExcutor();
		excutor.excuteQuery(script);
 
        HttpSession session = Context.getRequestContext().getSession();
        List<String> fatherGroupNames = (List<String>) session.getAttribute(BTRAfterLoginCustomizer.USER_GROUPS_ID);
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
	
	/**
	 * 读取快运分拨中心列表
	 */
	@RequestMapping("/centers")
	@ResponseBody
	@SuppressWarnings("unchecked")
	public List<?> getCenterList(String orgIds) {
		String script = "select t.id as id, t.code as code, t.name as name" +
				" from usrvf_gg.gt_site t " +
				" where type_code = '01' and status = 'ENABLE'  and org_id in ( " + orgIds + " ) ";
		SQLExcutor excutor = new SQLExcutor();
		excutor.excuteQuery(script);
		
		HttpSession session = Context.getRequestContext().getSession();
		List<String> fatherGroupNames = (List<String>) session.getAttribute(BTRAfterLoginCustomizer.USER_GROUPS_ID);
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
