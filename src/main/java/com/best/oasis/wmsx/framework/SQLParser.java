package com.best.oasis.wmsx.framework;

import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

import com.jinhe.tss.cache.Cacheable;
import com.jinhe.tss.cache.JCache;
import com.jinhe.tss.cache.Pool;
import com.jinhe.tss.util.EasyUtils;
 
public class SQLParser {
    
    static Pool cache = JCache.getInstance().getCachePool("SQLParser");
    
    String sql;
    
    List<String> selectFields = new ArrayList<String>();
    
    String gridTempalte;
    
    private SQLParser(String sql) {
        this.sql = sql;
    }
    
    public static SQLParser getInstance(String sql) {
        Cacheable cacheItem = cache.getObject(sql);
        if( cacheItem == null ) {
            SQLParser parser = initParser(sql);
            cache.putObject(sql, parser);
            return parser;
        } 
        else {
            return (SQLParser) cacheItem.getValue();
        }
    }
    
    private static SQLParser initParser(String sql) {
        SQLParser parser = new SQLParser(sql);
        
        StringBuffer sb = new StringBuffer();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?><grid><declare sequence=\"true\">");
        
        sql = sql.trim();
        int selectIndex = sql.indexOf("select ");
        int fromIndex   = sql.indexOf(" from ");
        String fieldsStr = sql.substring(selectIndex + 7, fromIndex);
        String[] fileds = fieldsStr.split(",");
        for(String filed : fileds) {
            StringTokenizer st = new StringTokenizer(filed); 
            
            String displayName = "";
            while (st.hasMoreElements()) {
                displayName = st.nextToken().trim(); 
            }
            if(EasyUtils.isNullOrEmpty(displayName)) {
                continue;
            }
            
            parser.selectFields.add(displayName);
            sb.append("<column name=\"" + displayName + "\" mode=\"string\" caption=\"" + displayName + "\" />");
        }
        sb.append("</declare><data></data></grid>");
        parser.gridTempalte = sb.toString();
        
        return parser;
    }

}
