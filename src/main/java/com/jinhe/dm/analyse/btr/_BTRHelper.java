package com.jinhe.dm.analyse.btr;

import java.util.List;

import javax.servlet.http.HttpSession;

import com.jinhe.tss.framework.sso.context.Context;

public class _BTRHelper {
	
	@SuppressWarnings("unchecked")
	public static List<String> getFatherGroups() {
		HttpSession session = Context.getRequestContext().getSession();
		return (List<String>) session.getAttribute(BTRAfterLoginCustomizer.USER_GROUPS_NAME);
	}

}
