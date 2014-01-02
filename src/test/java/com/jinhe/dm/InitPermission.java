package com.jinhe.dm;

import java.util.List;

import org.apache.log4j.Logger;
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
        
        List<?> list = reportDao.getEntities("from Report where deleted = 0 and id < 214 order by decode");
        for(Object temp : list) {
        	Report report = (Report) temp;
        	Long reportId = report.getId();
        	resourcePermission.addResource(reportId, Report.RESOURCE_TYPE_REPORT);
        }
    }
}
