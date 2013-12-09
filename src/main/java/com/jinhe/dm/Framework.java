package com.jinhe.dm;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.jinhe.tss.framework.Config;

@Controller
@RequestMapping("/framework")
public class Framework {
	
	@RequestMapping(value = "/version", method = RequestMethod.GET)
	@ResponseBody
	public Object[] getVersion(HttpServletRequest request, HttpServletResponse response) {
		String packageTime = Config.getAttribute("last.package.time");
		String environment = Config.getAttribute("xingng.environment");
		return new Object[] { packageTime, environment };
	}

}
