package com.jinhe.dm.report;

import com.jinhe.tss.framework.Config;
import com.jinhe.tss.util.BeanUtil;
 
public class ScriptPreCheatorFactory {
    
    protected static ScriptPreCheator instance;
 
    public static ScriptPreCheator getPreCheator() {
        if (instance == null) {
            String configValue = Config.getAttribute("script_precheator");
            if (configValue != null) {
                instance = (ScriptPreCheator) BeanUtil.newInstanceByName(configValue);
            } else {
                return null;
            }
        }
        return instance;
    }
}
