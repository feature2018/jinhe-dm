package com.best.oasis.wmsx.report.result;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.log4j.Logger;

import com.jinhe.tss.cache.Cacheable;
import com.jinhe.tss.cache.JCache;
import com.jinhe.tss.cache.Pool;

public class SQLExcutor {
    
    static Logger log = Logger.getLogger(SQLExcutor.class);
    
    SQLParser parser;
    
    int count;
    List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
    
    public void excuteQuery(String sql, Map<Integer, Object> paramsMap, int page, int pagesize, String datasource) {
        Pool connpool = JCache.getInstance().getCachePool(datasource);
        Cacheable connItem = connpool.checkOut(0);
        Connection conn = (Connection) connpool.checkOut(0).getValue();

        String queryDataSql = sql;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        try {
        	if(page > 0 && pagesize > 0) {
        	    String queryCountSql = " select count(*) " + sql.substring(sql.indexOf("from"));
                Statement stmt = conn.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_UPDATABLE);  
                rs = stmt.executeQuery(queryCountSql);  
                if (rs.next()) {  
                    count = rs.getInt(1);  
                }  
                log.debug("    queryCountSql: "  + queryCountSql);
                
        		int fromRow = 0;
        		int toRow = 0;
        		queryDataSql = "SELECT * FROM " + 
    	    		"( " + 
    	    		"	SELECT t.*, ROWNUM RN FROM ( " + sql + " ) t WHERE ROWNUM <= " + toRow +
    	    		") " + 
    	    		"WHERE RN > " + fromRow;
        	}
        	
        	log.debug("    queryDataSql: "  + queryDataSql);
            pstmt = conn.prepareStatement(queryDataSql);
            for( Entry<Integer, Object> entry : paramsMap.entrySet() ) {
                pstmt.setObject(entry.getKey(), entry.getValue()); // 从1开始，非0
            }
            rs = pstmt.executeQuery();
            
            this.parser = SQLParser.getInstance(sql);
            while(rs.next()) {
                Map<String, Object> rowData = new HashMap<String, Object>(); 
                
                int index = 1;  // 从1开始，非0
                for(String field : this.parser.selectFields) {
                    rowData.put(field, rs.getObject(index++));
                }
                
                result.add(rowData);
            }
            
        } catch (SQLException e) {
            log.error("执行SQL时出错", e);
        } finally {
            try {
                if (rs != null) {
                    rs.close();
                    rs = null;
                }
                if (pstmt != null) {
                    pstmt.close();
                    pstmt = null;
                }
            } catch (Exception e) {
            }
            
            connpool.checkIn(connItem);
        }
    }
 
}
