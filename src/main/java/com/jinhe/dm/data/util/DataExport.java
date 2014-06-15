package com.jinhe.dm.data.util;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import com.jinhe.tss.framework.exception.BusinessException;
import com.jinhe.tss.util.EasyUtils;

public class DataExport {
 
    public static void exportCSV(String path, List<Map<String, Object>> data, List<String> fields) {
    	List<Object[]> list = new ArrayList<Object[]>();

        for (Map<String, Object> row : data) {
        	list.add( row.values().toArray() );
        }
        
    	exportCSV(path, list, fields);
    }
    
    public static void exportCSV(String path, Collection<Object[]> data, List<String> fields) {
        try {
            File parent = new File(path).getParentFile();
            if (!parent.exists()) {
                parent.mkdirs();
            }

            File file = new File(path);
            if (!file.exists()) {
                file.createNewFile();
            }
            
            OutputStreamWriter write = new OutputStreamWriter(new FileOutputStream(file), "GBK" );
            BufferedWriter fw = new BufferedWriter(write);   
            
            if(fields != null) {
            	fw.write(EasyUtils.list2Str(fields)); // 表头
            }
            
            fw.write("\r\n");

            int index = 0;
            for (Object[] row : data) {
            	List<Object> values = new ArrayList<Object>();
            	for(Object value : row) {
            		if(value == null) {
            			value = "";
            		}
            		values.add(value.toString().replaceAll(",", "，")); // 导出时字段含英文逗号会错列
            	}
                fw.write(EasyUtils.list2Str(values));
                fw.write("\r\n");

                if (index++ % 10000 == 0) {
                    fw.flush(); // 每一万行输出一次
                }
            }

            fw.flush();
            fw.close();
            
        } catch (IOException e) {
            throw new BusinessException("export csv error:" + path, e);
        }
    }

    /**
     * 使用http请求下载附件。
     * @param sourceFilePath 导出文件路径
     * @param exportName  导出名字
     */
    public static void downloadFileByHttp(HttpServletResponse response, String sourceFilePath) {
        File sourceFile = new File(sourceFilePath);
        
        response.reset();
        response.setCharacterEncoding("utf-8");
        response.setContentType("application/octet-stream"); // 设置附件类型
        response.setContentLength((int) sourceFile.length());
        response.setHeader("Content-Disposition", "attachment; filename=\"" + sourceFile.getName() + "\"");
        
        InputStream inStream = null;
        OutputStream outStream = null;
        try {
            outStream = response.getOutputStream();
            inStream = new FileInputStream(sourceFilePath);
            
            int len = 0;
            byte[] b = new byte[1024];
            while ((len = inStream.read(b)) != -1) {
                outStream.write(b, 0, len);
                outStream.flush();
            }           
        } catch (IOException e) {
            throw new RuntimeException("导出时发生IOException!!", e);
        } finally {
            try {
                if(inStream != null){
                    inStream.close();
                }
                if(outStream != null){
                    outStream.close();
                }
                outStream.close();
            } catch (IOException e) {
                throw new RuntimeException("导出时发生IOException!!", e);
            }           
        }
        
        sourceFile.delete();  // 删除资源文件夹下面的zip文件
    }
}
