package com.best.oasis.wmsx.test1;

import org.apache.cxf.interceptor.LoggingInInterceptor;
import org.apache.cxf.interceptor.LoggingOutInterceptor;
import org.apache.cxf.jaxrs.JAXRSServerFactoryBean;

import com.best.oasis.wmsx.CustomerServiceImpl;
  
public class MyServer {  
    
    public static void main(String[] args) throws Exception {  
        
        JAXRSServerFactoryBean factory = new JAXRSServerFactoryBean();  

        factory.setResourceClasses(CustomerServiceImpl.class);
        
        factory.setAddress("http://localhost:9000/wmsx/");  
        
        factory.getInInterceptors().add(new LoggingInInterceptor());  
        factory.getOutInterceptors().add(new LoggingOutInterceptor());  
        
        factory.create();  
    }  
    
}  
