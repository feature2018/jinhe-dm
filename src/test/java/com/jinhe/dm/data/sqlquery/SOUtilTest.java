package com.jinhe.dm.data.sqlquery;

import java.util.Date;

import org.junit.Test;
	
public class SOUtilTest {
	
	@Test
	public void testSOUtil() {
		CustomerSO temp = new CustomerSO();
		temp.id = "1200";
		temp.xxCodes = "x1,x2";
		temp.birthday = new Date();
		
		System.out.println(SOUtil.getProperties(temp));
		System.out.println(SOUtil.generateQueryParametersMap(temp));
	}
	
	public class CustomerSO extends AbstractSO {
 
		private static final long serialVersionUID = 1L;
		
		private String id;  
	    private String name;  
	    private String xxCodes;  
	    private Date birthday;  
	    
	    public String getId() {  
	        return id;  
	    }  
	    public void setId(String id) {  
	        this.id = id;  
	    }  
	    public String getName() {  
	        return name;  
	    }  
	    public void setName(String name) {  
	        this.name = name;  
	    }  
	    public Date getBirthday() {  
	        return birthday;  
	    }  
	    public void setBirthday(Date birthday) {  
	        this.birthday = birthday;  
	    }  
	 
		public String[] getParameterNames() {
			return new String[] {"id", "name", "birthday"};
		}
		public String getXxCodes() {
			return xxCodes;
		}
		public void setXxCodes(String xxCodes) {
			this.xxCodes = xxCodes;
		}  
	}
}  
