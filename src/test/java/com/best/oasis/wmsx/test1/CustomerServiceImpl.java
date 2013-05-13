package com.best.oasis.wmsx.test1;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

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
}  
