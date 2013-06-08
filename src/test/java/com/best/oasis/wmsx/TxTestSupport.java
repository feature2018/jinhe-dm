package com.best.oasis.wmsx;

import java.util.Map;
import java.util.Random;

import org.apache.log4j.Logger;
import org.junit.After;
import org.junit.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.AbstractTransactionalJUnit4SpringContextTests;
import org.springframework.test.context.transaction.TransactionConfiguration;

import com.jinhe.tss.framework.Global;
import com.jinhe.tss.framework.sso.IOperator;
import com.jinhe.tss.framework.sso.IdentityCard;
import com.jinhe.tss.framework.sso.TokenUtil;
import com.jinhe.tss.framework.sso.context.Context;
import com.jinhe.tss.framework.test.IH2DBServer;

@ContextConfiguration(
	  locations={
		    "classpath:META-INF/framework-spring.xml",
		    "classpath:META-INF/spring.xml",
		    "classpath:META-INF/spring-mvc.xml"
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
        
        String token = TokenUtil.createToken(new Random().toString(), 12L); 
        IdentityCard card = new IdentityCard(token, new TempOperator());
        Context.initIdentityInfo(card);
    }
 
    @After
    public void tearDown() throws Exception {
        dbserver.stopServer();
    }
    
    static class TempOperator implements IOperator {
        private static final long serialVersionUID = 1L;
        
        public Long getId() {
            return 12L;
        }
        public String getLoginName() {
            return "Jon.King";
        }
        public String getUserName() {
            return "Jon.King";
        }
        public boolean isAnonymous() {
            return true;
        }
        public Object getAttribute(String name) {
            return null;
        }
        public Map<String, Object> getAttributesMap() {
            return null;
        }
        public String getAuthenticateMethod() {
            return null;
        }
    } 
}
