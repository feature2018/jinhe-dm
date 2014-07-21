package com.jinhe.dm.analyse.btr;

import java.util.List;

public interface BaseService {
 
	boolean login(String loginName, String password);
	
	/**
	 * 读取登录用户有权限看到的分公司
	 */
	List<?> getOrgList();
	
	/**
	 * 读取快运分拨中心列表
	 */
	List<?> getCenterList(String orgIds);

}
