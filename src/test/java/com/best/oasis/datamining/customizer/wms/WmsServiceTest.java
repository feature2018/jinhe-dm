package com.best.oasis.datamining.customizer.wms;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.best.oasis.datamining.TxTestSupport;

public class WmsServiceTest extends TxTestSupport {
    
    @Autowired WmsService service;
 
    @Test
    public void getWarehouseList() {
        service.getWarehouseList();
    }

    @Test
    public void kanban() {
        service.kanban(100200L);
    }

    @Test
    public void login() {
        service.login("BL00618", "abc123");
    }

}
