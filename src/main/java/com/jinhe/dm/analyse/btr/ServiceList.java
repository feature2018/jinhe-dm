package com.jinhe.dm.analyse.btr;

import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/btr")
public class ServiceList {
	
	protected Logger logger = Logger.getLogger(this.getClass());
	
	@Autowired private BaseService baseService;
	
	/**
	 * 读取快运分公司列表
	 */
	@RequestMapping("/orgs")
	@ResponseBody
	public List<Object[]> getOrgList() {
		
		// TODO 按用户的登录信息（所属分拨、组）对这里进行过滤，只能看到其有权限看的分公司、分拨等信息
		
		return null;
	}
	
	/**
	 * 读取快运分拨中心列表
	 */
	@RequestMapping("/sites")
	@ResponseBody
	public List<Object[]> getSiteList() {
		return null;
	}
}
