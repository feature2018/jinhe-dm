package com.jinhe.dm.report;

import java.util.List;
import java.util.Map;

import com.jinhe.dm.Constants;
import com.jinhe.dm.data.sqlquery.SQLExcutor;
import com.jinhe.tss.framework.component.cache.CacheLife;
import com.jinhe.tss.framework.component.cache.Cached;
import com.jinhe.tss.framework.component.log.Logable;
import com.jinhe.tss.um.permission.filter.PermissionFilter4Create;
import com.jinhe.tss.um.permission.filter.PermissionFilter4Sort;
import com.jinhe.tss.um.permission.filter.PermissionTag;

public interface ReportService {

    Report getReport(Long id);
    
    Long getReportIdByName(String name);
    
    @PermissionTag(
    		application = Constants.APPLICATION_CODE,
    		resourceType = Report.RESOURCE_TYPE_REPORT,
	        operation = Report.OPERATION_VIEW
	)
    List<Report> getAllReport();

    @PermissionTag(
    		application = Constants.APPLICATION_CODE,
    		resourceType = Report.RESOURCE_TYPE_REPORT,
	        operation = Report.OPERATION_VIEW
	)
    List<Report> getAllReportGroups();

    @PermissionTag(
    		application = Constants.APPLICATION_CODE,
            resourceType = Report.RESOURCE_TYPE_REPORT,
            operation = Report.OPERATION_EDIT , 
            filter = PermissionFilter4Create.class)
    @Logable(operateObject="报表",  operateInfo="新增/更新了：${args[0]?default(\"\")}")
    Report saveReport(Report report);
    
    @Logable(operateObject="报表", operateInfo="删除了：${returnVal?default(\"\")}")
    Report delete(Long id);

    @Logable(operateObject="报表", operateInfo="<#if args[1]=1>停用<#else>启用</#if>了报表(ID = ${args[0]?default(\"\")}) ")
    void startOrStop(Long reportId, Integer disabled);

    @PermissionTag(
    		application = Constants.APPLICATION_CODE,
            resourceType = Report.RESOURCE_TYPE_REPORT,
            operation = Report.OPERATION_EDIT, 
            filter = PermissionFilter4Sort.class)
    @Logable(operateObject="报表", operateInfo="(ID: ${args[0]})节点移动到了(ID: ${args[1]})节点<#if args[2]=1>之下<#else>之上</#if>")
    void sort(Long startId, Long targetId, int direction);

    @Logable(operateObject="报表", operateInfo="复制(ID: ${args[0]}) 报表至 (ID: ${args[1]}) 报表组下。")
    List<Report> copy(Long reportId, Long groupId);

    @Logable(operateObject="报表", operateInfo="移动(ID: ${args[0]}) 报表至 (ID: ${args[1]}) 报表组下。")
    void move(Long reportId, Long groupId);

    /**
     * 传入 loginUserId 目的是防止不同用户使用同一份缓存数据，因用户权限不同，各自看到的数据多少也不同，所以需要分开来缓存。
     */
    @Cached(cyclelife = CacheLife.SHORTER)
    SQLExcutor queryReport(Long reportId, Map<String, String> requestMap, int page, int pagesize, Object loginUserId);
}
