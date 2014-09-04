package com.jinhe.dm.log;

import java.lang.reflect.Method;
import java.util.Date;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import org.apache.commons.lang.builder.ToStringBuilder;
import org.apache.commons.lang.builder.ToStringStyle;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;

import com.jinhe.tss.framework.sso.Environment;

@Component("accessLogInterceptor")
public class AccessLogInterceptor implements MethodInterceptor {

    protected Logger log = Logger.getLogger(this.getClass());

    public Object invoke(MethodInvocation invocation) throws Throwable {
        Method targetMethod = invocation.getMethod(); /* 获取目标方法 */
        Object[] args = invocation.getArguments(); /* 获取目标方法的参数 */
        String methodName = targetMethod.getName();

        Access annotation = targetMethod.getAnnotation(Access.class); // 取得注释对象
        if (annotation == null) {
            return invocation.proceed(); /* 如果没有配置分析，则直接执行方法并返回结果 */
        }
        
        // 在方法被正式执行前，先把参数转成字符串记录下来（以防在方法里把参数给修改了）
        StringBuffer buffer = new StringBuffer();
        for (Object arg : args) {
        	if(arg instanceof String || arg instanceof Number) {
        		 buffer.append(arg).append(", ");
        	}
        	else {
        		buffer.append(ToStringBuilder
        				.reflectionToString(arg, ToStringStyle.SHORT_PREFIX_STYLE)).append(", ");
        	}
        }

        String params = buffer.toString();
        if (params != null && params.length() > 500) {
            params = params.substring(0, 500);
        }

        // 执行方法
        long start = System.currentTimeMillis();
        Object returnVal = invocation.proceed();
        long runningTime = System.currentTimeMillis() - start;

        // 方法的访问日志记录成败不影响方法的正常访问，所以对记录日志过程中各种可能异常进行try catch
        try {
            AccessLog log = new AccessLog();
            log.setClassName(targetMethod.getDeclaringClass().getName());
    		log.setMethodName(methodName);
    		log.setMethodCnName(annotation.methodName());
            log.setAccessTime(new Date(start));
            log.setRunningTime(runningTime);
            log.setParams(params);
            log.setUserId(Environment.getOperatorId());
            log.setIp(Environment.getClientIp());

            AccessLogRecorder.getInstanse().output(log);
        } 
        catch(Exception e) {
        	log.error("记录方法【" + methodName + "】的访问日志时出错了。错误信息：" + e.getMessage());
        }

        return returnVal;
    }
}
