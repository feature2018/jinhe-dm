package com.best.oasis.wmsx.framework.web;

import java.util.Date;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.best.oasis.wmsx.restful.Customer;

/**
 * http://localhost:9000/wmsx/test/Jon.King
 */

@Controller
@RequestMapping("/test")
public class JSONController {

    @RequestMapping(value="{name}", method = RequestMethod.GET)
    public @ResponseBody Customer getShopInJSON(@PathVariable String name) {

        Customer c = new Customer();
        c.setName(name);
        c.setBirthday(new Date());
        
        return c;

    }
    
}
