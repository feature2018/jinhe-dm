package com.best.oasis.wmsx;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.core.Context;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.UriInfo;

import org.springframework.stereotype.Service;

@Service("CustomerService") 
public class CustomerServiceImpl implements CustomerService {  
 
    static Map<String, Customer> map = new HashMap<String, Customer>();
    
    public void createCustomer(Customer customer) {
        String id = customer.getId();
        if ( !map.containsKey(id) ) {
            map.put(id, customer);
        }
    }
    
    public void updateCustomer(Customer customer) {
        String id = customer.getId();
        if (map.containsKey(id)) {
            map.put(id, customer);
        }
    }

    public void deleteCustomer(String id) {
        System.out.println("Method:" + request.getMethod());
        System.out.println("uri:" + uriInfo.getPath());
        System.out.println(uriInfo.getPathParameters());
        
        map.remove(id);
    }

    public Customer getCustomerById(String id) {
        return map.get(id);
    }

    public Collection<Customer> getCustomerList() {
        return map.values();
    }
    
    public Customer queryCustomerByName(String name) {
        return map.get(name);
    }
    
    @Context
    private UriInfo uriInfo;
    
    @Context
    private Request request;
}  
