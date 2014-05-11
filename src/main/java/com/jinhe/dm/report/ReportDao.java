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
    
    /**
     * 不直接调用dao.update(entity)方法，以避开decodeInterceptor和permissionInterceptor等的拦截。
     * TODO operateInfoInteceptor也将拦截不到，导致无法设置更新时间等信息
     */
    Report refreshReport(Report report);
    
    Report deleteReport(Report report);
 
}
