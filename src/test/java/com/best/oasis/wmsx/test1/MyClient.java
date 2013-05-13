package com.best.oasis.wmsx.test1;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.HttpStatus;
import org.apache.commons.httpclient.methods.DeleteMethod;
import org.apache.commons.httpclient.methods.GetMethod;
import org.apache.commons.httpclient.methods.InputStreamRequestEntity;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.PutMethod;
import org.apache.commons.httpclient.methods.RequestEntity;
  
public class MyClient {  
  
    public static void main(String[] args) throws Exception {  
        doPut("http://localhost:9000/wmsx/customer/info/", 
                "<Customer><birthday>2013-05-13T12:36:07.814+08:00</birthday><id>1</id><name>Jon.King</name></Customer>");
        doPut("http://localhost:9000/wmsx/customer/info/", 
                "<Customer><birthday>2012-05-13T12:36:07.814+08:00</birthday><id>2</id><name>Lao.Zi</name></Customer>");
        doGet("http://localhost:9000/wmsx/customer/info/2");  
        
        doPost("http://localhost:9000/wmsx/customer/info/", 
                "<Customer><birthday>2012-05-13T12:36:07.814+08:00</birthday><id>2</id><name>Dao.Dao</name></Customer>");
        doGet("http://localhost:9000/wmsx/customer/info/2");  
        
        doGet("http://localhost:9000/wmsx/customer/info/");
        doDelete("http://localhost:9000/wmsx/customer/info/1");
        doGet("http://localhost:9000/wmsx/customer/info/");
        
        doGet("http://localhost:9000/wmsx/customer/search?name=2");  
        
    }  
      
    static void excuteMethod(HttpMethod method) throws IOException {  
        method.setRequestHeader("Content-Type", "application/xml");    
        
        HttpClient httpClient = new HttpClient();  
        int statusCode = httpClient.executeMethod(method);  
        if (statusCode == HttpStatus.SC_NO_CONTENT) {  
            System.out.print("No Content 没有新文档，浏览器应该继续显示原来的文档。");
        }
        if (statusCode != HttpStatus.SC_OK) {  
            System.out.println("Method failed: " + method.getStatusLine());  
            return;
        } 
        
        byte[] responseBody = method.getResponseBody();  
        System.out.println(new String(responseBody)); 
    }  
    
    
    static void doGet(String url) throws IOException {
        GetMethod method = new GetMethod(url);
        excuteMethod(method);
    }
    
    static void doDelete(String url) throws IOException {
        DeleteMethod method = new DeleteMethod(url);
        excuteMethod(method);
    }
    
    static void doPut(String url, String paramData) throws IOException {
        PutMethod method = new PutMethod(url);
        
        // 设置请求内容，将原请求中的数据流转给新的请求
        byte[] b = paramData.getBytes("UTF-8");  
        InputStream is = new ByteArrayInputStream(b, 0, b.length);  
        RequestEntity requestEntity = new InputStreamRequestEntity(is, 
                "application/xop+xml; charset=UTF-8; type=\"text/xml\"");
        method.setRequestEntity(requestEntity);
        
        excuteMethod(method);
    }  

    static void doPost(String url, String paramData) throws IOException {
        PostMethod method = new PostMethod(url);
        
        // 设置请求内容，将原请求中的数据流转给新的请求
        byte[] b = paramData.getBytes("UTF-8");  
        InputStream is = new ByteArrayInputStream(b, 0, b.length);  
        RequestEntity requestEntity = new InputStreamRequestEntity(is, 
                "application/xml; charset=UTF-8; type=\"text/xml\"");
        method.setRequestEntity(requestEntity);
        
        excuteMethod(method);
    }  
    
}  