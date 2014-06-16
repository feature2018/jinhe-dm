package com.jinhe.dm.analyse.btr;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpSession;

import com.jinhe.tss.framework.Global;
import com.jinhe.tss.framework.sso.Environment;
import com.jinhe.tss.framework.sso.ILoginCustomizer;
import com.jinhe.tss.framework.sso.context.Context;
import com.jinhe.tss.um.service.ILoginService;

public class BTRAfterLoginCustomizer implements ILoginCustomizer {
    
    ILoginService loginSerivce = (ILoginService) Global.getContext().getBean("LoginService");

    public final static String USER_GROUPS_ID = "USER_GROUPS_ID";
    public final static String USER_GROUPS_NAME = "USER_GROUPS_NAME";
    
    public void execute() {
        // 获取登陆用户所在父组
    	Long logonUserId = Environment.getOperatorId();
        List<Object[]> fatherGroups = loginSerivce.getGroupsByUserId(logonUserId);
        List<Long> fatherGroupIds = new ArrayList<Long>();
        List<String> fatherGroupNames = new ArrayList<String>();	
        for(Object[] temp : fatherGroups) {
        	fatherGroupIds.add((Long) temp[0]);
        	fatherGroupNames.add((String) temp[1]);
        }
 
        HttpSession session = Context.getRequestContext().getSession();
        session.setAttribute(USER_GROUPS_ID, fatherGroupIds);
        session.setAttribute(USER_GROUPS_NAME, fatherGroupNames);
    }
}
