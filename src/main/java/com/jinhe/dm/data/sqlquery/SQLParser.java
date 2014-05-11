package com.jinhe.dm.data.sqlquery;

import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

import com.jinhe.tss.cache.Cacheable;
import com.jinhe.tss.cache.Pool;
import com.jinhe.tss.framework.component.cache.CacheHelper;
import com.jinhe.tss.util.EasyUtils;
 
public class SQLParser {
    
    String sql;
    
    public List<String> selectFields = new ArrayList<String>();
    
    public String gridTempalte;
    
    private SQLParser(String sql) {
        this.sql = sql;
    }
    
    public static SQLParser getInstance(String sql) {
    	Pool cache = CacheHelper.getNoDeadCache();
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
        sb.append("<grid><declare sequence=\"true\">");
        
        sql = sql.trim();
        int selectIndex = sql.indexOf("select ");
        int fromIndex   = sql.indexOf("from ");
        if(fromIndex < 0) {
			fromIndex = sql.indexOf("FROM ");
		}
        
        String fieldsStr = sql.substring(selectIndex + 7, fromIndex);
        String[] fileds = fieldsStr.split(",");
        for(String filed : fileds) {
            StringTokenizer st = new StringTokenizer(filed.trim()); 
            
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
