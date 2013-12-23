package com.jinhe.dm.report;

import java.util.List;

import com.jinhe.dm.Constants;
import com.jinhe.tss.framework.persistence.ITreeSupportDao;
import com.jinhe.tss.um.permission.filter.PermissionFilter4Branch;
import com.jinhe.tss.um.permission.filter.PermissionTag;
 
public interface ReportDao extends ITreeSupportDao<Report> {
	
    @PermissionTag(
    		application = Constants.APPLICATION_CODE,
    		resourceType = Report.RESOURCE_TYPE_REPORT,
            filter = PermissionFilter4Branch.class)
    List<Report> getChildrenById(Long id, String operationId);
 
}
