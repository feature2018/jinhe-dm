package com.jinhe.dm.report.permission;

import javax.persistence.Entity;
import javax.persistence.Table;

import com.jinhe.dm.report.Report;
import com.jinhe.tss.um.permission.AbstractResourcesView;

/** 
 * 站点栏目资源视图 
 */
@Entity
@Table(name = "view_report_resources")
public class ReportResourceView extends AbstractResourcesView {

	public String getResourceType() {
		return Report.RESOURCE_TYPE_REPORT;
	}
}