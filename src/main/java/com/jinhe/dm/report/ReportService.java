package com.jinhe.dm.report;

import java.util.List;

import com.jinhe.dm.Constants;
import com.jinhe.tss.framework.component.log.Logable;
import com.jinhe.tss.um.permission.filter.PermissionFilter4Create;
import com.jinhe.tss.um.permission.filter.PermissionFilter4Sort;
import com.jinhe.tss.um.permission.filter.PermissionTag;

public interface ReportService {

    Report getReport(Long id);
    
    @PermissionTag(
    		application = Constants.APPLICATION_CODE,
	        operation = Report.OPERATION_VIEW, 
	        resourceType = Report.RESOURCE_TYPE_REPORT
	)
    List<Report> getAllReport();

    @PermissionTag(
    		application = Constants.APPLICATION_CODE,
	        operation  = Report.OPERATION_VIEW, 
	        resourceType = Report.RESOURCE_TYPE_REPORT
	)
    List<Report> getAllReportGroups();

    @PermissionTag(
    		application = Constants.APPLICATION_CODE,
            operation = Report.OPERATION_EDIT , 
            resourceType = Report.RESOURCE_TYPE_REPORT,
            filter = PermissionFilter4Create.class)
    @Logable(operateTable="报表", operateType="新增/更新", operateInfo="新增/更新了：${args[0]?default(\"\")}")
    Report saveReport(Report report);
    
    @Logable(operateTable="报表", operateType="删除", operateInfo="删除了：${returnVal?default(\"\")}")
    Report delete(Long id);

    @Logable(operateTable="报表", operateType="停用/启用", 
            operateInfo="<#if args[1]=1>停用<#else>启用</#if>了报表(ID = ${args[0]?default(\"\")}) ")
    void startOrStop(Long reportId, Integer disabled);

    @PermissionTag(
    		operation = Report.OPERATION_EDIT , 
            resourceType = Report.RESOURCE_TYPE_REPORT,
            filter = PermissionFilter4Sort.class)
    @Logable(operateTable="报表", operateType="排序", 
            operateInfo="(ID: ${args[0]})节点移动到了(ID: ${args[1]})节点<#if args[2]=1>之下<#else>之上</#if>")
    void sort(Long startId, Long targetId, int direction);

    @Logable(operateTable="报表", operateType="复制", 
            operateInfo="复制(ID: ${args[0]}) 报表至 (ID: ${args[1]}) 报表组下。"
        )
    List<Report> copy(Long reportId, Long groupId);

    @Logable(operateTable="报表", operateType="移动", 
            operateInfo="移动(ID: ${args[0]}) 报表至 (ID: ${args[1]}) 报表组下。"
        )
    void move(Long reportId, Long groupId);

}
