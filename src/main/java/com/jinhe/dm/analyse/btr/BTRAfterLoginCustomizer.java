package com.jinhe.dm.analyse.btr;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpSession;

import com.jinhe.tss.framework.Global;
import com.jinhe.tss.framework.sso.Environment;
import com.jinhe.tss.framework.sso.ILoginCustomizer;
import com.jinhe.tss.framework.sso.context.Context;
import com.jinhe.tss.um.service.ILoginService;
import com.jinhe.tss.util.EasyUtils;

public class BTRAfterLoginCustomizer implements ILoginCustomizer {
    
    ILoginService loginSerivce = (ILoginService) Global.getContext().getBean("LoginService");
    BaseService baseService = (BaseService) Global.getContext().getBean("BaseService");

    public final static String USER_GROUPS_ID = "USER_GROUPS_ID";
    public final static String USER_GROUPS_NAME = "USER_GROUPS_NAME";
    
    public final static String PERMISSION_1 = "PERMISSION_1";
    public final static String PERMISSION_2 = "PERMISSION_2";
    
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
        
        // TODO 处理下org和center的格式（现在是List<Map>）
        List<?> orgList = baseService.getOrgList();
		String orgs = EasyUtils.list2Str(orgList);
        session.setAttribute(PERMISSION_1, orgs);
        
        if(orgList.size() > 0 ) {
        	String centers = EasyUtils.list2Str(baseService.getCenterList(orgs));
            session.setAttribute(PERMISSION_2, centers);
        }
    }
}
