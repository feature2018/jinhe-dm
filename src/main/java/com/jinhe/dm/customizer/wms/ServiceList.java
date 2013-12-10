package com.jinhe.dm.customizer.wms;

import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/wms")
public class ServiceList {
	
	protected Logger logger = Logger.getLogger(this.getClass());
	
	@Autowired private BaseInfoService baseService;
	@Autowired private KanbanService kanbanService;
	
	@RequestMapping(value = "/login", method = RequestMethod.POST)
	@ResponseBody
	public Object[] login(HttpServletRequest request, HttpServletResponse response) {
		String domain    = request.getParameter("domain");
		String loginName = request.getParameter("loginName");
		String password  = request.getParameter("password");
		
		return baseService.login(domain, loginName, password);
	}

	@RequestMapping("/logout")
	@ResponseBody
	public Object[] logout(HttpServletRequest request, HttpServletResponse response) {
		HttpSession session = request.getSession();
		session.removeAttribute("LoginUserId");
		return new Object[] { "SUCCESS" };
	}
	
	@RequestMapping("/whList")
	@ResponseBody
	public List<Object[]> getWarehouseList(String userId) {
		return baseService.getWarehouseList(userId);
	}
 
	@RequestMapping("/kanban/2/{whId}")
	@ResponseBody
	public List<Map<String, Object>> statisticsWorkAmount(@PathVariable("whId") Long whId) {
		
		return kanbanService.statisticsWorkAmount(whId);
	}
}
