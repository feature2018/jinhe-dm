package com.jinhe.dm.data.sqlquery;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.log4j.Logger;
import org.dom4j.Document;

import com.jinhe.dm.Constants;
import com.jinhe.tss.cache.Cacheable;
import com.jinhe.tss.cache.JCache;
import com.jinhe.tss.cache.Pool;
import com.jinhe.tss.framework.component.param.ParamManager;
import com.jinhe.tss.framework.exception.BusinessException;
import com.jinhe.tss.util.XMLDocUtil;

public class SQLExcutor {
    
    static Logger log = Logger.getLogger(SQLExcutor.class);
    
    public List<String> selectFields = new ArrayList<String>();
    
    public Document getGridTemplate() {
    	StringBuffer sb = new StringBuffer();
        sb.append("<grid><declare sequence=\"true\">");
        if(selectFields.size() > 0) {
            for(String filed : selectFields) {
                sb.append("<column name=\"" + filed + "\" mode=\"string\" caption=\"" + filed + "\" />");
            }
        }
        else {
        	sb.append("<column name=\"没有查询到数据\" mode=\"string\" caption=\"没有查询到数据\" />");
        }

        sb.append("</declare><data></data></grid>");
        
    	return XMLDocUtil.dataXml2Doc(sb.toString());
    }
    
    public int count;
    public List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
    
    public void excuteQuery(String sql, AbstractSO so) {
    	excuteQuery(sql, SOUtil.generateQueryParametersMap(so));
    }
    
    public void excuteQuery(String sql, Map<Integer, Object> paramsMap) {
    	excuteQuery(sql, paramsMap, 0, 0);
    }
    
    public void excuteQuery(String sql) {
    	excuteQuery(sql, new HashMap<Integer, Object>());
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
        	String dbUrl = conn.getMetaData().getURL();
            String driveName = conn.getMetaData().getDriverName();

            log.debug(" database url: 【" + dbUrl + "】。");
            log.debug(" database diverName: 【 " + driveName + "】。");
            
        	if(page > 0 && pagesize > 0) {
        		String queryCountSql = " select count(*) from (\n " + sql + " \n) t ";
                log.debug("  excuteQuery  queryCountSql: \n" + queryCountSql);
        	    
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
                if (driveName.startsWith("MySQL")) {
                    queryDataSql = sql + "\n LIMIT " + (fromRow) + ", " + pagesize;
                } else if (driveName.startsWith("Oracle")) {
					queryDataSql = "SELECT * FROM ( SELECT t.*, ROWNUM RN FROM (\n " + sql + " \n) t WHERE ROWNUM <= " + toRow + ") WHERE RN > " + fromRow;
                } else {
                    // TODO 暂时不支持其他数据源
                } 
        	}
        	
        	log.debug("    queryDataSql: \n"  + queryDataSql);
        	
            pstmt = conn.prepareStatement(queryDataSql);
            for( Entry<Integer, Object> entry : paramsMap.entrySet() ) {
                pstmt.setObject(entry.getKey(), entry.getValue()); // 从1开始，非0
            }
            rs = pstmt.executeQuery();
            
            while (rs.next()) {
                Map<String, Object> rowData = new LinkedHashMap<String, Object>();
                
                // 从1开始，非0
                ResultSetMetaData rsMetaData = rs.getMetaData();
				for(int index = 1; index <= rsMetaData.getColumnCount(); index++) {
                	String columnName = rsMetaData.getColumnLabel(index).toLowerCase();
                	if(columnName.equals("rn")) continue;
                	
					rowData.put(columnName, rs.getObject(index));
					
					if(result.isEmpty()) {
						selectFields.add(columnName);
					}
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
