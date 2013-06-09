package com.best.oasis.wmsx.report.result;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;

import com.jinhe.tss.cache.Cacheable;
import com.jinhe.tss.cache.JCache;
import com.jinhe.tss.cache.Pool;
import com.jinhe.tss.framework.component.param.ParamManager;

public class SQLExcutor {
    
    static Logger log = Logger.getLogger(SQLExcutor.class);
    
    static String POOL_CODE = ParamManager.getValue("CONNECTION_POOL");
    static Pool connectionPool = JCache.getInstance().getCachePool(POOL_CODE);
    
    SQLParser parser;
    List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
    
    public void excuteQuery(String sql, Object...params) {
        Cacheable connItem = connectionPool.checkOut(0);
        Connection conn = (Connection) connItem.getValue();

        PreparedStatement pstmt = null;
        ResultSet rs = null;
        try {
            pstmt = conn.prepareStatement(sql);
            if (params != null && params.length > 0) {
                for(int i = 0; i < params.length; i++){
                    pstmt.setObject(i + 1, params[i]); // 从1开始，非0
                }
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
            
            connectionPool.checkIn(connItem);
        }
    }
 
}
