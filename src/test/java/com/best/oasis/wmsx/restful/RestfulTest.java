package com.best.oasis.wmsx.restful;

import org.apache.cxf.interceptor.LoggingInInterceptor;
import org.apache.cxf.interceptor.LoggingOutInterceptor;
import org.apache.cxf.jaxrs.JAXRSServerFactoryBean;
import org.codehaus.jackson.jaxrs.JacksonJsonProvider;

import com.jinhe.tss.framework.test.TestUtil;

public class RestfulTest {

    public static void startServer() throws Exception {
        JAXRSServerFactoryBean factory = new JAXRSServerFactoryBean();
        factory.setResourceClasses(CustomerServiceImpl.class);
        factory.setAddress("http://localhost:9000/wmsx/rs/");
        factory.getInInterceptors().add(new LoggingInInterceptor());
        factory.getOutInterceptors().add(new LoggingOutInterceptor());
        
        factory.setProvider(new JacksonJsonProvider()); // 更换默认的JSON providers为Jackson

        factory.create();
    }
    
    public static void main(String[] args) throws Exception {  
        
        startServer();
        
        TestUtil.doPut("http://localhost:9000/wmsx/rs/customer/info/", 
                "<Customer><birthday>2013-05-13T12:36:07.814+08:00</birthday><id>1</id><name>Jon.King</name></Customer>");
        TestUtil.doPut("http://localhost:9000/wmsx/rs/customer/info/", 
                "<Customer><birthday>2012-05-13T12:36:07.814+08:00</birthday><id>2</id><name>Lao.Zi</name></Customer>");
        TestUtil.doGet("http://localhost:9000/wmsx/rs/customer/info/2");  
        
        TestUtil.doPost("http://localhost:9000/wmsx/rs/customer/info/", 
                "<Customer><birthday>2012-05-13T12:36:07.814+08:00</birthday><id>2</id><name>Dao.Dao</name></Customer>");
        TestUtil.doGet("http://localhost:9000/wmsx/rs/customer/info/2");  
        
        TestUtil.doGet("http://localhost:9000/wmsx/rs/customer/info/");
        TestUtil.doDelete("http://localhost:9000/wmsx/rs/customer/info/1");
        TestUtil.doGet("http://localhost:9000/wmsx/rs/customer/info/");
        
        TestUtil.doGet("http://localhost:9000/wmsx/rs/customer/search?name=2");  
        
    }  
      
 
}
