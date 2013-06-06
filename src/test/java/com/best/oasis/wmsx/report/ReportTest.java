package com.best.oasis.wmsx.report;

import com.best.oasis.wmsx.TxTestSupport;

public class ReportTest extends TxTestSupport {
    
    ReportAction action = new ReportAction();
    
    public void testGetAllReport() {
        action.getAllReport(null);
    }

}
