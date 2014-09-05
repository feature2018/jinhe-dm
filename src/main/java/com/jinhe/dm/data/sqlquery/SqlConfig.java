package com.jinhe.dm.data.sqlquery;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.Element;

import com.jinhe.tss.cache.Cacheable;
import com.jinhe.tss.cache.Pool;
import com.jinhe.tss.framework.component.cache.CacheHelper;
import com.jinhe.tss.util.FileHelper;
import com.jinhe.tss.util.MacrocodeCompiler;
import com.jinhe.tss.util.URLUtil;
import com.jinhe.tss.util.XMLDocUtil;

public class SqlConfig {
	
	private static final Logger log = Logger.getLogger(SqlConfig.class);
	
	static Pool cache = CacheHelper.getNoDeadCache();
	
	static Map<String, Object> sqlNestFmParams = new HashMap<String, Object>(); // SQL嵌套解析用
	
	public static String getWMSSQL(String reportName, int index) {
		Cacheable cacheItem = cache.getObject(reportName);
		if(cacheItem == null) {
			File sqlDir = new File(URLUtil.getResourceFileUrl("script").getPath());
			List<File> sqlFiles = FileHelper.listFilesByTypeDeeply("xml", sqlDir);
			for(File sqlFile : sqlFiles) {
				Document doc = XMLDocUtil.createDocByAbsolutePath(sqlFile.getPath());
				List<Element> reportNodes = XMLDocUtil.selectNodes(doc, "//report");
				for(Element reportNode : reportNodes) {
					
					List<String> reportSQLs = new ArrayList<String>();
					
					String id = reportNode.attributeValue("id").trim();
					List<Element> sqlNodes = XMLDocUtil.selectNodes(reportNode, "sql");
					for(Element sqlNode : sqlNodes) {
						String sql = sqlNode.getText().trim();
						reportSQLs.add(sql);
						
						sqlNestFmParams.put("${" + id + "_" + reportSQLs.size() + "}", sql);
					}
					
					Cacheable cacheTemp = cache.putObject(id, reportSQLs);
					if( reportName.equals(id) ) {
						cacheItem = cacheTemp;
					}
				}
			}
		}
		
		if(cacheItem == null) {
			log.error("没有找到报表【" + reportName + "】的SQL。");
			return null;
		}
		
		List<?> reportSQLs = (List<?>) cacheItem.getValue();
		if(reportSQLs != null && reportSQLs.size() >= index) {
			String script = (String) reportSQLs.get(index - 1);
			
			// 自动解析script里的宏嵌套
			script = MacrocodeCompiler.run(script, sqlNestFmParams, true);
			
			return script;
		}
		return null;
	}
}
