package com.jinhe.dm.data.sqlquery;

import java.io.Serializable;

import org.apache.commons.lang.builder.ToStringStyle;

public abstract class AbstractSO implements Serializable {
 
	private static final long serialVersionUID = -1193069209085971217L;

	public String toString() {
		return org.apache.commons.lang.builder.ToStringBuilder
				.reflectionToString(this, ToStringStyle.SHORT_PREFIX_STYLE);
	}

	public abstract String[] getParameterNames();
	
}
