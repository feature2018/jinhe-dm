package com.jinhe.dm.log;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
    
/**
 * 用于分析方法的使用情况
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface Access {

    /** 方法的中文名称 */
    String methodName() default "";
}
