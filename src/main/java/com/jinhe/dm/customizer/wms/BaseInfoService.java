package com.jinhe.dm.customizer.wms;

import java.util.List;

import com.jinhe.tss.framework.component.cache.CacheLife;
import com.jinhe.tss.framework.component.cache.Cached;

public interface BaseInfoService {
 
	Object[] login(String domain, String loginName, String password);
 
	@Cached(cyclelife = CacheLife.LONG)
	List<Object[]> getWarehouseList();
	
	@Cached(cyclelife = CacheLife.LONG)
	List<Object[]> getWarehouseList(String userId);
}
