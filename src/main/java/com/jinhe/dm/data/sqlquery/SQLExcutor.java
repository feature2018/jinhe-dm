package com.jinhe.dm.data.sqlquery;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.log4j.Logger;

import com.jinhe.dm.Constants;
import com.jinhe.tss.cache.Cacheable;
import com.jinhe.tss.cache.JCache;
import com.jinhe.tss.cache.Pool;
import com.jinhe.tss.framework.component.param.ParamManager;
import com.jinhe.tss.framework.exception.BusinessException;

public class SQLExcutor {
    
    static Logger log = Logger.getLogger(SQLExcutor.class);
    
    public SQLParser parser;
    
    public int count;
    public List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
    
    public void excuteQuery(String sql, AbstractSO so) {
    	excuteQuery(sql, SOUtil.generateQueryParametersMap(so));
    }
    
    public void excuteQuery(String sql, Map<Integer, Object> paramsMap) {
    	excuteQuery(sql, paramsMap, 0, 0);
    }
    
    public void excuteQuery(String sql, Map<Integer, Object> paramsMap, int page, int pagesize) {
    	String datasource = ParamManager.getValue(Constants.DEFAULT_CONN_POOL).trim();
    	excuteQuery(sql, paramsMap, page, pagesize, datasource);
    }
    
    public void excuteQuery(String sql, Map<Integer, Object> paramsMap, int page, int pagesize, String datasource) {
        Pool connpool = JCache.getInstance().getPool(datasource);
        if(connpool == null) {
        	throw new BusinessException("数据源【" + datasource + "】无法获取到连接池");
        }
        Cacheable connItem = connpool.checkOut(0);
        Connection conn = (Connection) connItem.getValue();
        
        String queryDataSql = sql;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        try {
        	if(page > 0 && pagesize > 0) {
        		int fromIndex = sql.indexOf("from");
        		if(fromIndex < 0) {
        			fromIndex = sql.indexOf("FROM");
        		}
        	    String queryCountSql = " select count(*) " + sql.substring(fromIndex);
        	    int orderbyIndex = queryCountSql.lastIndexOf("order by");
        	    if(orderbyIndex < 0) {
        	    	orderbyIndex = queryCountSql.lastIndexOf("ORDER BY");
        	    }
        	    if(orderbyIndex > 0) {
        	        queryCountSql = queryCountSql.substring(0, orderbyIndex);
        	    }
        	    
        	    log.debug("    queryCountSql: "  + queryCountSql);
        	    
        	    pstmt = conn.prepareStatement(queryCountSql);
        	    if(paramsMap != null) {
        	    	for( Entry<Integer, Object> entry : paramsMap.entrySet() ) {
        	    		pstmt.setObject(entry.getKey(), entry.getValue()); // 从1开始，非0
        	    	}
        	    }
                rs = pstmt.executeQuery(); 

                if (rs.next()) {  
                    count = rs.getInt(1);  
                }  
                
        		int fromRow = pagesize * (page - 1);
        		int toRow = pagesize * page;
        		
        		// 各种数据库的分页不一样
        		if(datasource.endsWith("mysql")) {
        			queryDataSql = sql + " LIMIT " + (fromRow) + ", " + pagesize;
        		} 
        		else { // 默认为oracle
        			queryDataSql = "SELECT * FROM " + 
            	    		"( " + 
            	    		"   SELECT t.*, ROWNUM RN FROM ( " + sql + " ) t WHERE ROWNUM <= " + toRow +
            	    		") " + 
            	    		"WHERE RN > " + fromRow;
        		}
        	}
        	
        	log.debug("    queryDataSql: "  + queryDataSql);
        	
            pstmt = conn.prepareStatement(queryDataSql);
            for( Entry<Integer, Object> entry : paramsMap.entrySet() ) {
                pstmt.setObject(entry.getKey(), entry.getValue()); // 从1开始，非0
            }
            rs = pstmt.executeQuery();
            
            this.parser = SQLParser.getInstance(sql);
            while(rs.next()) {
                Map<String, Object> rowData = new LinkedHashMap<String, Object>(); 
                
                int index = 1;  // 从1开始，非0
                for(String field : this.parser.selectFields) {
                    rowData.put(field, rs.getObject(index++));
                }
                
                result.add(rowData);
            }
            
        } catch (SQLException e) {
            String errorMsg = "执行SQL时出错，数据源【" + datasource + "】。";
			log.error(errorMsg, e);
            throw new BusinessException(errorMsg, e);
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
