package com.jinhe.dm.analyse.btr;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.jinhe.dm.TxTestSupport;

public class ServiceListTest extends TxTestSupport {
	
	@Autowired ServiceList serviceList;
	@Autowired BaseService baseInfoService;
	
	@Test
	public void testServiceList() {
		baseInfoService.login("BL00618", "jonking");
		
		serviceList.getOrgList();
		serviceList.getCenterList("60000");
	}
	
    protected String getDefaultSource(){
    	return "connpool-vf-oracle";
    }
}
