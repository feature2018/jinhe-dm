package com.best.oasis.datamining;

import java.util.Enumeration;
import java.util.Locale;
import java.util.Random;
import java.util.ResourceBundle;

import org.apache.log4j.Logger;
import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.AbstractTransactionalJUnit4SpringContextTests;
import org.springframework.test.context.transaction.TransactionConfiguration;

import com.best.oasis.datamining.Constants;
import com.jinhe.tss.framework.Global;
import com.jinhe.tss.framework.component.param.Param;
import com.jinhe.tss.framework.component.param.ParamConstants;
import com.jinhe.tss.framework.component.param.ParamService;
import com.jinhe.tss.framework.sso.IdentityCard;
import com.jinhe.tss.framework.sso.TokenUtil;
import com.jinhe.tss.framework.sso.context.Context;
import com.jinhe.tss.framework.test.TestUtil;
import com.jinhe.tss.util.URLUtil;

/**
 * 初始化数据库。
 * 
 * 需使用 src/main/resources目录下的配置文件，比如persistence.xml, application.properties等。
 * 另外，初始化时需要把applicationContext.xml的<property name="generateDdl" value="true" /> 设置为true
 * persistence.xml 的 hibernate.dialect 设置为 org.hibernate.dialect.MySQLDialect
 */
@ContextConfiguration(
        locations={
                "classpath:META-INF/framework-spring.xml",
                "classpath:META-INF/spring.xml",
        } 
      )
@TransactionConfiguration(defaultRollback = false) // 不自动回滚，否则后续的test中没有初始化的数据
public class InitDatabase extends AbstractTransactionalJUnit4SpringContextTests { 
 
    Logger log = Logger.getLogger(this.getClass());    

    @Before
    public void setUp() throws Exception {
        Global.setContext(super.applicationContext);
    }
    
    @Test
    public void initDatabase() {
        log.info("create dm databse schema starting......");
 
        TestUtil.excuteSQL(getInitSQLDir());
 
        String token = TokenUtil.createToken(new Random().toString(), 12L); 
        IdentityCard card = new IdentityCard(token, new TxTestSupport.TempOperator());
        Context.initIdentityInfo(card);
        
        importSystemProperties();
        
        log.info("init dm databse over.");
    }
    
    static String PROJECT_NAME = "DM";
    static String getInitSQLDir() {
        String path = URLUtil.getResourceFileUrl("com/best/oasis").getPath();
        String projectDir = path.substring(1, path.indexOf(PROJECT_NAME) + PROJECT_NAME.length());
        return projectDir + "/webapp/sql/mysql";
    }
    
    @Autowired private ParamService paramService;
 
    /**
     * 导入 application.properties文件
     */
    public void importSystemProperties(){
        String name = "系统参数";
        Param group = addParam(ParamConstants.DEFAULT_PARENT_ID, name);
        ResourceBundle resources = ResourceBundle.getBundle("application", Locale.getDefault());
        if (resources == null) return;
        
        for (Enumeration<String> enumer = resources.getKeys(); enumer.hasMoreElements();) {
            String key = enumer.nextElement();
            String value = resources.getString(key);
            addParam(group.getId(), key, key, value);
        }
        
        addParam(group.getId(), Constants.DEFAULT_CONN_POOL, "默认数据源", "connectionpool-1");
        
        Param dlParam = addParam(group.getId(), Constants.DATASOURCE_LIST, "数据源列表");
        addParamItem(dlParam.getId(), "connectionpool-1", "数据源1", ParamConstants.COMBO_PARAM_MODE);
        addParamItem(dlParam.getId(), "connectionpool-2", "数据源2", ParamConstants.COMBO_PARAM_MODE);
    }

    /** 建参数组 */
    Param addParam(Long parentId, String name) {
        Param param = new Param();
        param.setName(name);
        param.setParentId(parentId);
        param.setType(ParamConstants.GROUP_PARAM_TYPE);
        paramService.saveParam(param);
        return param;
    }

    /** 简单参数 */
    Param addParam(Long parentId, String code, String name, String value) {
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
    Param addParam(Long parentId, String code, String name) {
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
