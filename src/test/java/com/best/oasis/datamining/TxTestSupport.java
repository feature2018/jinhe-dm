package com.best.oasis.datamining;

import java.util.Map;
import java.util.Random;

import org.apache.log4j.Logger;
import org.junit.After;
import org.junit.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.AbstractTransactionalJUnit4SpringContextTests;
import org.springframework.test.context.transaction.TransactionConfiguration;

import com.jinhe.tss.framework.Global;
import com.jinhe.tss.framework.component.param.Param;
import com.jinhe.tss.framework.component.param.ParamConstants;
import com.jinhe.tss.framework.component.param.ParamService;
import com.jinhe.tss.framework.sso.IOperator;
import com.jinhe.tss.framework.sso.IdentityCard;
import com.jinhe.tss.framework.sso.TokenUtil;
import com.jinhe.tss.framework.sso.context.Context;
import com.jinhe.tss.framework.test.IH2DBServer;

@ContextConfiguration(
	  locations={
		    "classpath:META-INF/spring-mvc.xml",
		    "classpath:META-INF/spring-test.xml"
	  }   
) 
@TransactionConfiguration(defaultRollback = true) // 自动回滚设置为false，否则数据将不插进去
public abstract class TxTestSupport extends AbstractTransactionalJUnit4SpringContextTests { 
 
    protected static Logger log = Logger.getLogger(TxTestSupport.class);    
    
    @Autowired protected IH2DBServer dbserver;
    @Autowired protected ParamService paramService;
    
    @Before
    public void setUp() throws Exception {
        Global.setContext(super.applicationContext);
        Context.setResponse(new MockHttpServletResponse());
        Context.initRequestContext(new MockHttpServletRequest());
        
        String token = TokenUtil.createToken(new Random().toString(), 12L); 
        IdentityCard card = new IdentityCard(token, new TempOperator());
        Context.initIdentityInfo(card);
        
        if(paramService.getParam(Constants.DEFAULT_CONN_POOL) == null) {
            addParam(ParamConstants.DEFAULT_PARENT_ID, Constants.DEFAULT_CONN_POOL, "默认数据源", "connectionpool-1");
        }
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
    
    /** 简单参数 */
    protected Param addParam(Long parentId, String code, String name, String value) {
        Param param = new Param();
        param.setCode(code);
        param.setName(name);
        param.setValue(value);
        param.setParentId(parentId);
        param.setType(ParamConstants.NORMAL_PARAM_TYPE);
        param.setModality(ParamConstants.SIMPLE_PARAM_MODE);
        paramService.saveParam(param);
        return param;
    }
}
