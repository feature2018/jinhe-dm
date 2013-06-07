package com.best.oasis.wmsx;

import org.apache.log4j.Logger;
import org.junit.After;
import org.junit.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.AbstractTransactionalJUnit4SpringContextTests;
import org.springframework.test.context.transaction.TransactionConfiguration;

import com.jinhe.tss.framework.Global;
import com.jinhe.tss.framework.sso.context.Context;
import com.jinhe.tss.framework.test.IH2DBServer;

@ContextConfiguration(
	  locations={
		    "classpath:META-INF/framework-spring.xml",
		    "classpath:META-INF/spring.xml",
		    "classpath:spring-mvc.xml"
	  }   
) 
@TransactionConfiguration(defaultRollback = true) // 自动回滚设置为false，否则数据将不插进去
public abstract class TxTestSupport extends AbstractTransactionalJUnit4SpringContextTests { 
 
    protected static Logger log = Logger.getLogger(TxTestSupport.class);    
    
    @Autowired protected IH2DBServer dbserver;
    
    @Before
    public void setUp() throws Exception {
        Global.setContext(super.applicationContext);
        
        Context.setResponse(new MockHttpServletResponse());
    }
 
    @After
    public void tearDown() throws Exception {
        dbserver.stopServer();
    }

}
