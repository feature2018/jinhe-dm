package com.best.oasis.wmsx.framework;

import java.util.ArrayList;
import java.util.List;

import com.jinhe.tss.cache.JCache;

public class SQLParser {
    
    static JCache cache = JCache.getInstance();
    
    String sql;
    
    List<String> selectFields = new ArrayList<String>();
    
    private SQLParser(String sql) {
        this.sql = sql;
    }
    
    public static SQLParser getInstance(String sql) {
        return null;
    }
    
    public String createGridTemplate() {
        return null;
    }

}
