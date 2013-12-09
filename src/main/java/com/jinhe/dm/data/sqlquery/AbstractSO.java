package com.jinhe.dm.data.sqlquery;


public abstract class AbstractSO {
	
	public String toString() {
		return org.apache.commons.lang.builder.ToStringBuilder
				.reflectionToString(this);
	}
	
	public abstract String[] getParameterNames();
	
}
