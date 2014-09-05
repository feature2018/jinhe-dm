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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import com.jinhe.dm.Constants;
import com.jinhe.dm.data.sqlquery.AbstractExportSO;
import com.jinhe.dm.data.sqlquery.AbstractVO;
import com.jinhe.tss.framework.component.param.ParamManager;
import com.jinhe.tss.framework.exception.BusinessException;
import com.jinhe.tss.util.EasyUtils;

public class DataExport {
	
	/**
     * 将已经读取到缓存中的VOList分页展示给前台
     */
    public static Map<String, Object> getDataByPage(List<? extends AbstractVO> voList, int page, int rows ) {
    	Map<String, Object> rlt = new HashMap<String, Object>();
        rlt.put("total", voList.size());

        page = page < 1 ? 1 : page;
        rows = rows < 1 ? 50 : rows;
        int fromLine = (page - 1) * rows;
        int toLine = page * rows;
        if (fromLine <= voList.size()) {
            toLine = voList.size() < toLine ? voList.size() : toLine;
            rlt.put("rows", voList.subList(fromLine, toLine));
        }
        
        if(voList != null && voList.size() > 0) {
        	rlt.put("headerNames", voList.get(0).displayHeaderNames());
        }

        return rlt;
    }
    
    public static String exportCSV(List<Object[]> data, List<String> cnFields) {
    	String basePath = ParamManager.getValue(Constants.TEMP_EXPORT_PATH).replace("\n", "");
        String exportFileName = System.currentTimeMillis() + ".csv";
		String exportPath = basePath + "/" + exportFileName;
		
		DataExport.exportCSV(exportPath, convertList2Array(data), cnFields );
		return exportFileName;
    }
    
    public static String exportCSV(List<? extends AbstractVO> voList, AbstractExportSO so) {
    	String basePath = ParamManager.getValue(Constants.TEMP_EXPORT_PATH).replace("\n", "");
        String exportFileName = so.getExportFileName();
		String exportPath = basePath + "/" + exportFileName;

        List<String> cnFields = null;
        if(voList != null && voList.size() > 0) {
        	cnFields = voList.get(0).displayHeaderNames();
        }
        
        Object[][] data = convertList2Array(AbstractVO.voList2Objects(voList));
		exportCSV(exportPath, data, cnFields );
		
		return exportFileName;
    }
    
    /**  把 List<Object[]> 转换成 Object[][] 的 */
    public static Object[][] convertList2Array(List<Object[]> list) {
        if (list == null || list.isEmpty()) {
            return new Object[0][0];
        }

        int rowSize = list.size();
        int columnSize = list.get(0).length;
        Object[][] rlt = new Object[rowSize][columnSize];

        for (int i = 0; i < rowSize; i++) {
            Object[] tmpArrays = list.get(i);
            for (int j = 0; j < columnSize; j++) {
                rlt[i][j] = tmpArrays[j];
            }
        }
        return rlt;
    }
    
    public static String exportCSVII(String fileName, Object[][] data, List<String> cnFields) {
    	String basePath = ParamManager.getValue(Constants.TEMP_EXPORT_PATH).replace("\n", "");
		String exportPath = basePath + "/" + fileName;
		
		exportCSV(exportPath, data, cnFields );
		return fileName;
    }

    public static void exportCSV(String path, Object[][] data, List<String> fields) {
    	List<Object[]> list = new ArrayList<Object[]>();
    	for(Object[] temp : data) {
    		list.add(temp);
    	}
    	
    	com.jinhe.dm.data.util.DataExport.exportCSV(path, list, fields);
    }
 
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
            		String valueS = value.toString().replaceAll(",", "，");
            		valueS = valueS.replaceAll("\r\n", " ").replaceAll("\n", " ");
					values.add(valueS); // 导出时字段含英文逗号会错列
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