package com.best.oasis.wmsx.report;

import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.best.oasis.wmsx.TxTestSupport;

public class ReportTest extends TxTestSupport {
    
    @Autowired private ReportAction action;
    
    @Test
    public void getAllReport() {
        action.getAllReport(null);
    }

}
