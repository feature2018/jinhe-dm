package com.jinhe.dm.data.sqlquery;

/**
 * 需要导出的数据的查询条件
 *
 */
public abstract class AbstractExportSO extends AbstractSO {

	private static final long serialVersionUID = -8242722351039220496L;

	public abstract String getExportFileName();
	
}
