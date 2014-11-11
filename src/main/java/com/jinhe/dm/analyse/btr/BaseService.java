package com.jinhe.dm.analyse.btr;

import java.util.List;
import java.util.Map;

public interface BaseService {
 
	boolean login(String loginName, String password);
	
	/**
	 * 读取登录用户有权限看到的分公司
	 */
	List<Map<String, Object>> getOrgList();
	
	/**
	 * 读取快运分拨中心列表
	 */
	List<Map<String, Object>> getCenterList(String org);

	List<Map<String, Object>> getAllCenterList();
}
