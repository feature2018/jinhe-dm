package com.jinhe.dm.customizer.wms;

import org.junit.Assert;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.jinhe.dm.TxTestSupport;

public class ServiceListTest extends TxTestSupport {
	
	@Autowired ServiceList serviceList;
	@Autowired KanbanService kanbanService;
	
	@Test
	public void testServiceList() {
		request.addParameter("domain", "800best");
		request.addParameter("loginName", "BL00618");
		request.addParameter("password", "jonking");
		serviceList.login(request, response);
		
		serviceList.getWarehouseList("106024");
		
		serviceList.logout(request, response);
		
		serviceList.statisticsWorkAmount(104221L);
	}
	
    @Test
    public void testStatisticsWorkAmount() {
    	Object returnObj1 = kanbanService.statisticsWorkAmount(100200L);
    	
    	// 第二次调用，测试cache是否生效
    	Object returnObj2 = kanbanService.statisticsWorkAmount(100200L);
    	
    	Assert.assertEquals(returnObj1, returnObj2);
    }

}
