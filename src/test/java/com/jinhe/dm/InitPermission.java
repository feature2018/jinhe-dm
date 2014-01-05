package com.jinhe.dm;

import java.util.List;

import org.apache.log4j.Logger;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.AbstractTransactionalJUnit4SpringContextTests;
import org.springframework.test.context.transaction.TransactionConfiguration;

import com.jinhe.dm.report.Report;
import com.jinhe.dm.report.ReportDao;
import com.jinhe.tss.framework.Global;
import com.jinhe.tss.framework.sso.IdentityCard;
import com.jinhe.tss.framework.sso.TokenUtil;
import com.jinhe.tss.framework.sso.context.Context;
import com.jinhe.tss.um.UMConstants;
import com.jinhe.tss.um.helper.dto.OperatorDTO;
import com.jinhe.tss.um.permission.PermissionService;
import com.jinhe.tss.um.permission.ResourcePermission;
import com.jinhe.tss.um.service.ILoginService;

/**
 * 将已经存在的资源授权给Admin。
 */
@ContextConfiguration(
        locations={
          "classpath:META-INF/framework-spring.xml",  
          "classpath:META-INF/remote/um-remote.xml",
          "classpath:META-INF/spring.xml"
        } 
      )
@TransactionConfiguration(defaultRollback = false) // 不自动回滚
public class InitPermission extends AbstractTransactionalJUnit4SpringContextTests { 
 
    Logger log = Logger.getLogger(this.getClass());    
    
    @Autowired private ResourcePermission resourcePermission;
    @Autowired private ILoginService loginSerivce;
    @Autowired private PermissionService permissionService;
    @Autowired private ReportDao reportDao;
 
    @Before
    public void setUp() throws Exception {
        Global.setContext(super.applicationContext);
    }
    
    @Test
    public void initPermission() {
        // 初始化虚拟登录用户信息
        OperatorDTO loginUser = new OperatorDTO(UMConstants.ADMIN_USER_ID, UMConstants.ADMIN_USER_NAME);
        String token = TokenUtil.createToken("1234567890", UMConstants.ADMIN_USER_ID); 
        IdentityCard card = new IdentityCard(token, loginUser);
        Context.initIdentityInfo(card);
        
        // 获取登陆用户的权限（拥有的角色）并保存到用户权限（拥有的角色）对应表
        List<Object[]> userRoles = loginSerivce.getUserRolesAfterLogin(UMConstants.ADMIN_USER_ID);
        permissionService.saveUserRolesAfterLogin(userRoles, UMConstants.ADMIN_USER_ID);
        
        // 先检查DB的初始化情况，正常情况下资源视图的root节点已经被默认授权给Admin角色了。
        List<?> resources = reportDao.getEntities("from ReportResourceView");
        List<?> permissions = reportDao.getEntities("from ReportPermissionsFull");
        Assert.assertFalse("资源视图为空，请先确认DM数据库资源视图表是否初始化成功了，有可能连的是test/resources/application.properties下配置的H2测试库，" +
        		"先重命名该文件，确保连的是MySQL的DB。", resources.isEmpty());
        Assert.assertFalse("ReportPermissionsFull表为空，资源视图root节点没有被初始化权限。", permissions.isEmpty());
        
        List<?> list = reportDao.getEntities("from Report where deleted = 0 order by decode");
        for(Object temp : list) {
        	Report report = (Report) temp;
        	Long reportId = report.getId();
        	resourcePermission.addResource(reportId, Report.RESOURCE_TYPE_REPORT);
        }
    }
}
