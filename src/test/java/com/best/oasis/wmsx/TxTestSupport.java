package com.best.oasis.wmsx;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit38.AbstractTransactionalJUnit38SpringContextTests;
import org.springframework.test.context.transaction.TransactionConfiguration;

import com.jinhe.tss.framework.Global;
import com.jinhe.tss.framework.sso.context.Context;
import com.jinhe.tss.framework.test.IH2DBServer;

@SuppressWarnings("deprecation")
@ContextConfiguration(
	  locations={
		    "classpath:META-INF/framework-spring.xml",
		    "classpath:META-INF/spring.xml",
		    "classpath:spring-mvc.xml"
	  }   
) 
@TransactionConfiguration(defaultRollback = true) // 自动回滚设置为false，否则数据将不插进去
public abstract class TxTestSupport extends AbstractTransactionalJUnit38SpringContextTests { 
 
    protected static Logger log = Logger.getLogger(TxTestSupport.class);    
    
    @Autowired protected IH2DBServer dbserver;
    
    protected void setUp() throws Exception {
        super.setUp();
        Global.setContext(super.applicationContext);
        
        Context.setResponse(new MockHttpServletResponse());
    }
 
    protected void tearDown() throws Exception {
        super.tearDown();
        dbserver.stopServer();
    }

}
