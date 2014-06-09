package com.jinhe.dm.analyse.btr;

import org.apache.log4j.Logger;

import com.jinhe.tss.framework.Global;
import com.jinhe.tss.framework.exception.BusinessException;
import com.jinhe.tss.framework.exception.UserIdentificationException;
import com.jinhe.tss.framework.sso.IOperator;
import com.jinhe.tss.framework.sso.IPWDOperator;
import com.jinhe.tss.framework.sso.PasswordPassport;
import com.jinhe.tss.framework.sso.identifier.BaseUserIdentifier;
import com.jinhe.tss.um.service.ILoginService;
import com.jinhe.tss.util.InfoEncoder;

/**
 * <p>
 * UM本地用户密码身份认证器<br>
 * 根据用户帐号、密码等信息，通过UM本地数据库进行身份认证
 * </p>
 */
public class BTRUserIdentifier extends BaseUserIdentifier {
    
    protected Logger log = Logger.getLogger(this.getClass());
    
    ILoginService loginservice = (ILoginService) Global.getContext().getBean("LoginService");
    
    protected IOperator validate() throws UserIdentificationException {
        PasswordPassport passport = new PasswordPassport();
        IPWDOperator operator = null;
        try {
            operator = loginservice.getOperatorDTOByLoginName(passport.getLoginName());
        } catch (BusinessException e) {
        	throw new BusinessException(e.getMessage(), false);
        }
        
        String password = passport.getPassword();
		String md5password = InfoEncoder.string2MD5(passport.getLoginName() + "_" + password);
        if ( !md5password.equals(operator.getPassword()) && !checkPWDInBTR(operator, password)) {
        	throw new BusinessException("用户密码不正确，请重新登录", false);
        }
        
        // 读取用户的所属分组信息（包括了分拨、分公司等）
        
        return operator;
    }
    
    boolean checkPWDInBTR(IPWDOperator operator, String password){
        log.debug("用户登陆时密码在主用户组中验证不通过，转向进行再次验证。");
        
        BaseService btrService = (BaseService) Global.getContext().getBean("BaseInfoService");
        
        String loginName = operator.getLoginName();
        boolean result = btrService.login(loginName, password);
 
        if(result) {
            log.info("用户【" + loginName + "】的密码在V5中验证通过。");
            return true;
        } 
        else {
            log.warn("用户【" + loginName + "】的密码在V5中验证不通过。");
            return false;
        } 
    }
}
