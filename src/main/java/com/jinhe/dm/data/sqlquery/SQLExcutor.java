package com.jinhe.dm.data.sqlquery;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.StringTokenizer;

import org.apache.log4j.Logger;
import org.dom4j.Document;

import com.jinhe.tss.cache.Cacheable;
import com.jinhe.tss.cache.JCache;
import com.jinhe.tss.cache.Pool;
import com.jinhe.tss.framework.component.param.ParamManager;
import com.jinhe.tss.framework.exception.BusinessException;
import com.jinhe.tss.util.EasyUtils;
import com.jinhe.tss.util.XMLDocUtil;

public class SQLExcutor {

    static Logger log = Logger.getLogger(SQLExcutor.class);
    
    final static String DEFAULT_CONN_POOL =  "default_conn_pool";
    
    /**
     * 自己解析SQL语句的select字段。Oracle会自动把字段转成大写，容易混乱
     */
    boolean selfParse;
    
    public List<String> selectFields = new ArrayList<String>();
    
    public int count;
    public List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
    
    public SQLExcutor() {
    	this.selfParse = true;
    }
    
    public SQLExcutor(boolean selfParse) {
    	this.selfParse = selfParse;
    }
    
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
    
    private int getFirstIndex(String script, String keyword) {
    	// 一个复杂的SQL可能同时有大小写的From
    	int index1 = script.indexOf(keyword.toLowerCase());
    	int index2 = script.indexOf(keyword.toUpperCase());
    	if(index1 > 0 && index2 > 0) {
    		return Math.min(index1, index2);
    	}
    	else{
    		return Math.max(index1, index2);
    	}
    }
    
    private void fetchSelectFields(String sql) {
    	if(selectFields.size() > 0) return;
    	
        sql = sql.trim();
        int selectIndex = getFirstIndex(sql, "select");
        
    	// 一个复杂的SQL可能同时有大小写的select/from
        int fromIndex = getFirstIndex(sql, "from");
        
        String fieldsStr = sql.substring(selectIndex + 6, fromIndex);
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
            
            selectFields.add(displayName);
        }
    }

    public Object getFirstRow(String columnName) {
    	if(result.size() >= 1) {
    		return result.get(0).get(columnName);
    	}
    	return null;
    }
    
    public void excuteQuery(String sql, String datasource) {
        excuteQuery(sql, new HashMap<Integer, Object>(), datasource);
    }

    public void excuteQuery(String sql, AbstractSO so) {
        excuteQuery(sql, SOUtil.generateQueryParametersMap(so));
    }
    
    public void excuteQuery(String sql, AbstractSO so, String datasource) {
        excuteQuery(sql, SOUtil.generateQueryParametersMap(so), datasource);
    }
    
    public void excuteQuery(String sql) {
        excuteQuery(sql, new HashMap<Integer, Object>(), 0, 0);
    }
    
    public void excuteQuery(String sqlCollection, int index, Map<Integer, Object> paramsMap) {
    	String sql = SqlConfig.getWMSSQL(sqlCollection, index);
        excuteQuery(sql, paramsMap, 0, 0);
    }

    public void excuteQuery(String sql, Map<Integer, Object> paramsMap) {
        excuteQuery(sql, paramsMap, 0, 0);
    }

    public void excuteQuery(String sql, Map<Integer, Object> paramsMap, int page, int pagesize) {
        // ParamManager.getValue 有缓存，不宜用。（单元测试环节或自动切换数据源时容易出问题）
        // String datasource = ParamManager.getValue(DEFAULT_CONN_POOL).trim();
        String datasource = ParamManager.getValueNoSpring(DEFAULT_CONN_POOL).trim();
        excuteQuery(sql, paramsMap, page, pagesize, datasource);
    }

    public void excuteQuery(String sql, Map<Integer, Object> paramsMap, String datasource) {
        excuteQuery(sql, paramsMap, 0, 0, datasource);
    }

    public void excuteQuery(String sql, Map<Integer, Object> paramsMap, Connection conn) {
        excuteQuery(sql, paramsMap, 0, 0, conn);
    }

    public void excuteQuery(String sql, Map<Integer, Object> paramsMap, int page, int pagesize, String datasource) {
        Pool connpool = JCache.getInstance().getPool(datasource);
        Cacheable connItem = connpool.checkOut(0);
        Connection conn = (Connection) connItem.getValue();

        try {
            this.excuteQuery(sql, paramsMap, page, pagesize, conn);
        } catch (Exception e) {
        	this.result = null;
        	throw new BusinessException(e.getMessage(), e);
        } finally {
            // 返回连接到连接池
            connpool.checkIn(connItem);
        }
    }
    
    private PreparedStatement prepareStatement(Connection conn, String sql, Map<Integer, Object> paramsMap) throws SQLException {
    	PreparedStatement pstmt = conn.prepareStatement(sql);
        if (paramsMap != null) {
        	log.debug("params : " + paramsMap);
            for (Entry<Integer, Object> entry : paramsMap.entrySet()) {
                Object value = entry.getValue();
                if(value instanceof Date) {
            		value = new Timestamp(((Date)value).getTime());
            	}
				pstmt.setObject(entry.getKey(), value); // 从1开始，非0
            }
        }
        
        return pstmt;
    }

    public void excuteQuery(String sql, Map<Integer, Object> paramsMap, int page, int pagesize, Connection conn) {
    	long startTime = System.currentTimeMillis();
    	
        String queryDataSql = sql;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        result = new ArrayList<Map<String, Object>>();
        
        String dbUrl = null, driveName;
        try {
        	dbUrl = conn.getMetaData().getURL();
            driveName = conn.getMetaData().getDriverName();
            log.debug(" database url: 【" + dbUrl + "】。");
            log.debug(" database diverName: 【 " + driveName + "】。");
            
            // 如果不分页查询 ，则不执行count(*)查询
            if (page > 0 && pagesize > 0) {
            	// 已经取到总记录Count值，则不执行count(*)查询
            	if(count <= 0) {
            		String queryCountSql = " select count(*) from (\n " + sql + " \n) t ";
                    log.debug("  excuteQuery  queryCountSql: \n" + queryCountSql);
                    
                    pstmt = prepareStatement(conn, queryCountSql, paramsMap);
                    rs = pstmt.executeQuery();
                    if (rs.next()) {
                        count = rs.getInt(1);
                    }
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

            log.debug("  excuteQuery  queryDataSql: \n" + queryDataSql);

            pstmt = prepareStatement(conn, queryDataSql, paramsMap);
            rs = pstmt.executeQuery();
            
            if(selfParse) {
            	fetchSelectFields(sql);
            }

            while (rs.next()) {
                Map<String, Object> rowData = new LinkedHashMap<String, Object>();

                // 从1开始，非0
                ResultSetMetaData rsMetaData = rs.getMetaData();
                int fieldNum =  selfParse ? selectFields.size() : rsMetaData.getColumnCount();
				for(int index = 1; index <= fieldNum; index++) {
					String columnName;
	                if(selfParse) {
	                	columnName = selectFields.get(index - 1);
	                } 
	                else {
	                	columnName = rsMetaData.getColumnLabel(index).toLowerCase();
	                	if(columnName.equals("rn")) continue;
	                	
	                	if( result.isEmpty() && !selectFields.contains(columnName) ) {
							selectFields.add(columnName);
						}
	                }
	                
	                rowData.put(columnName, rs.getObject(index));
                }

                result.add(rowData);
            }
            
            log.debug("本次SQL查询耗时：" + (System.currentTimeMillis() - startTime) + "ms");

        } catch (SQLException e) {
            String errorMsg = "执行SQL时出错了:" + e.getMessage();
            log.error(errorMsg + "\n   数据源：" + dbUrl + ",\n   参数：" + paramsMap + ",\n   脚本：" + sql);
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
        }
    }

    // 执行单条sql，带参数，一般为insert 或 update 语句
    public static void excute(String sql, Map<Integer, Object> paramsMap, String datasource) {
        List<Map<Integer, Object>> paramsMapList = new ArrayList<Map<Integer, Object>>();
        paramsMapList.add(paramsMap);
        excuteBatch(sql, paramsMapList, datasource);
    }
 
    // 直接执行的sql，不带参数， create table/drop table/insert/delete/update等
    public static void excute(String sql, String datasource) {
        Pool connpool = JCache.getInstance().getPool(datasource);
        Cacheable connItem = connpool.checkOut(0);
        Connection conn = (Connection) connItem.getValue();
 
        try {
        	excute(sql, conn);
        } catch (Exception e) {
        	throw new BusinessException("执行SQL时出错了。sql : " + sql, e);
        } finally {
            connpool.checkIn(connItem);
        }
    }
    
    public static void excute(String sql, Connection conn) {
    	try {
    		boolean autoCommit = conn.getAutoCommit();
            conn.setAutoCommit(false);
            
    		log.debug(" excute  sql: " + sql);
			conn.createStatement().execute(sql);
			conn.commit();
			
			conn.setAutoCommit(autoCommit);
			
		} catch (SQLException e) {
			throw new BusinessException("执行SQL时出错了。sql : " + sql, e);
		} 
    }
    
    // 批量执行SQL, 每条SQL的参数放在Map里，key值为参数序号。
    public static void excuteBatch(String sql, List<Map<Integer, Object>> paramsList, String datasource) {
        List<Object[]> _paramsList = new ArrayList<Object[]>();
        for(Map<Integer, Object> params : paramsList) {
        	List<Map.Entry<Integer, Object>> list = new ArrayList<Map.Entry<Integer, Object>>(params.entrySet());
    		
    		Collections.sort(list, new Comparator<Map.Entry<Integer, Object>>() {   
    		    public int compare(Map.Entry<Integer, Object> o1, Map.Entry<Integer, Object> o2) {      
    		        return (o1.getKey() - o2.getKey()); 
    		    }
    		});
    		
    		Object[] paramObjs = new Object[list.size()];
    		int index = 0;
    		for(Map.Entry<Integer, Object> entry : list) {
    			paramObjs[index++] = entry.getValue();
    		}
    		_paramsList.add(paramObjs);
        }

        excuteBatchII(sql, _paramsList, datasource);
    }
    
    public static void excuteBatchII(String sql, List<Object[]> paramsList, String datasource) {
    	Pool connpool = JCache.getInstance().getPool(datasource);
        Cacheable connItem = connpool.checkOut(0);
        Connection conn = (Connection) connItem.getValue();
        
        try {
        	excuteBatch(sql, paramsList, conn);
        } catch (Exception e) {
        	throw new BusinessException("执行SQL时出错了。sql : " + sql, e);
        } finally {
            connpool.checkIn(connItem);
        }
    }

    // 批量执行SQL
    public static void excuteBatch(String sql, List<Object[]> paramsList, Connection conn) {
        PreparedStatement pstmt = null;
        try {
            log.debug("  excuteBatch  sql: " + sql);

            boolean autoCommit = conn.getAutoCommit();
            conn.setAutoCommit(false);
            
            pstmt = conn.prepareStatement(sql);
            if(paramsList != null) {
            	for (Object[] params : paramsList) {
                	int index = 1;
                    for (Object paramValue : params) {
                        pstmt.setObject(index++, paramValue); // 从1开始，非0
                    }
                    pstmt.addBatch();
                }
            }
            pstmt.executeBatch();

            conn.commit();
            conn.setAutoCommit(autoCommit);

        } catch (SQLException e) {
            throw new BusinessException("执行SQL时出错了。sql : " + sql, e);
        } finally {
            try {
                if (pstmt != null) {
                    pstmt.close();
                    pstmt = null;
                }
            } catch (Exception e) {
            }
        }
    }
}
