package com.jinhe.dm;

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
    
    protected MockHttpServletRequest request;
    protected MockHttpServletResponse response;
    
    @Before
    public void setUp() throws Exception {
        Global.setContext(super.applicationContext);
        Context.setResponse(response = new MockHttpServletResponse());
		Context.initRequestContext(request = new MockHttpServletRequest());
        
        String token = TokenUtil.createToken(new Random().toString(), 12L); 
        IdentityCard card = new IdentityCard(token, new TempOperator());
        Context.initIdentityInfo(card);
        
        if(paramService.getParam(Constants.DATASOURCE_LIST) == null) {
        	Param dlParam = addParamGroup(ParamConstants.DEFAULT_PARENT_ID, Constants.DATASOURCE_LIST, "数据源列表");
            addParamItem(dlParam.getId(), "connectionpool-1", "数据源1", ParamConstants.COMBO_PARAM_MODE);
            addParamItem(dlParam.getId(), "connectionpool-2", "数据源2", ParamConstants.COMBO_PARAM_MODE);
        }
        if(paramService.getParam(Constants.DEFAULT_CONN_POOL) == null) {
            addParam(ParamConstants.DEFAULT_PARENT_ID, Constants.DEFAULT_CONN_POOL, "默认数据源", "connectionpool-1");
        }
        if(paramService.getParam(Constants.Log_DIR) == null) {
			String tmpDir = System.getProperty("java.io.tmpdir") + "fbLog";
			log.info("输出日志目录：" + tmpDir);
            addParam(ParamConstants.DEFAULT_PARENT_ID, Constants.Log_DIR, "反馈日志目录", tmpDir);
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
    
    /** 下拉型参数 */
    Param addParamGroup(Long parentId, String code, String name) {
        Param param = new Param();
        param.setCode(code);
        param.setName(name);
        param.setParentId(parentId);
        param.setType(ParamConstants.NORMAL_PARAM_TYPE);
        param.setModality(ParamConstants.COMBO_PARAM_MODE);
        paramService.saveParam(param);
        return param;
    }

    /** 新建设参数项 */
    Param addParamItem(Long parentId, String value, String text, Integer mode) {
        Param param = new Param();
        param.setValue(value);
        param.setText(text);
        param.setParentId(parentId);
        param.setType(ParamConstants.ITEM_PARAM_TYPE);
        param.setModality(mode);
        paramService.saveParam(param);
        return param;
    }
}
