package com.jinhe.dm.analyse.btr;

import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/service")
public class ServiceList {
	
	protected Logger logger = Logger.getLogger(this.getClass());
	
	@Autowired private BaseService baseService;
	
	/**
	 * 读取登录用户有权限看到的分公司
	 */
	@RequestMapping("/orgs")
	@ResponseBody
	public List<?> getOrgList() {
		return baseService.getOrgList();
	}
	
	/**
	 * 读取快运分拨中心列表
	 */
	@RequestMapping("/centers")
	@ResponseBody
	public List<?> getCenterList(String org) {
		return baseService.getCenterList(org);
	}
	
	@RequestMapping("/self/centers")
	@ResponseBody
	public List<?> getSelfCenterList() {
		List<String> fatherGroups = _BTRHelper.getFatherGroups();
		if(fatherGroups != null && fatherGroups.size() >= 2) { // 分公司或分拨员工，只能看到其所在（分公司）的分拨
			String org = fatherGroups.get(1);
			return baseService.getCenterList(org);
		}
		
		return baseService.getAllCenterList();
	}
}
