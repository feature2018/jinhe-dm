package com.jinhe.dm.report.permission;

import javax.persistence.Entity;
import javax.persistence.Table;

import com.jinhe.tss.um.permission.AbstractSuppliedTable;

/** 
 *报表资源权限补齐表
 */
@Entity
@Table(name = "dm_permissionfull_report")
public class ReportPermissionsFull extends AbstractSuppliedTable {

}