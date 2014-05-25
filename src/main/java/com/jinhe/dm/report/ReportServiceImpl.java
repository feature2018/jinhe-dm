package com.jinhe.dm.report;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jinhe.tss.framework.component.param.ParamConstants;
import com.jinhe.tss.framework.exception.BusinessException;
import com.jinhe.tss.util.EasyUtils;

@Service("ReportService")
public class ReportServiceImpl implements ReportService {
    
    @Autowired ReportDao reportDao;
    
    public Report getReport(Long id) {
        Report report = reportDao.getEntity(id);
        reportDao.evict(report);
        return report;
    }
    
	public Long getReportIdByName(String name) {
		String hql = "select o.id from Report o where o.name = ? order by o.decode";
		List<?> list = reportDao.getEntities(hql, name); 
		if(EasyUtils.isNullOrEmpty(list)) {
			return null;
		}
		return (Long) list.get(0);
	}
    
    @SuppressWarnings("unchecked")
    public List<Report> getAllReport() {
        return (List<Report>) reportDao.getEntities("from Report o order by o.decode");
    }
    
    @SuppressWarnings("unchecked")
    public List<Report> getAllReportGroups() {
        return (List<Report>) reportDao.getEntities("from Report o where o.type = ? order by o.decode", Report.TYPE0);
    }

    public Report saveReport(Report report) {
        if ( report.getId() == null ) {
            report.setSeqNo(reportDao.getNextSeqNo(report.getParentId()));
            reportDao.create(report);
        }
        else {
        	reportDao.refreshReport(report);
        }
        return report;
    }
    
    public Report delete(Long id) {
    	 Report report = getReport(id);
         List<Report> list1 = reportDao.getChildrenById(id, Report.OPERATION_DELETE); // 一并删除子节点
         List<Report> list2 = reportDao.getChildrenById(id);
         
         if(list1.size() < list2.size()) {
         	throw new BusinessException("你的权限不足，无法删除整个枝。");
         }
         return reportDao.deleteReport(report);
    }

    public void startOrStop(Long reportId, Integer disabled) {
        List<Report> list = ParamConstants.TRUE.equals(disabled) ? 
                reportDao.getChildrenById(reportId, Report.OPERATION_DISABLE) : reportDao.getParentsById(reportId);
        
        for (Report report : list) {
            report.setDisabled(disabled);
            reportDao.updateWithoutFlush(report);
        }
        reportDao.flush();
    }

    public void sort(Long startId, Long targetId, int direction) {
        reportDao.sort(startId, targetId, direction);
    }

    public List<Report> copy(Long reportId, Long groupId) {
        Report report = getReport(reportId);
        Report group  = getReport(groupId);
        
        reportDao.evict(report);
        report.setId(null);
        report.setParentId(groupId);
        report.setSeqNo(reportDao.getNextSeqNo(groupId));
 
        if (ParamConstants.TRUE.equals(group.getDisabled())) {
            report.setDisabled(ParamConstants.TRUE); // 如果目标根节点是停用状态，则新复制出来的节点也为停用状态
        }
        
        report = reportDao.create(report);
        List<Report> list = new ArrayList<Report>();
        list.add(report);
        
        return list;
    }

    public void move(Long reportId, Long groupId) {
        List<Report> list  = reportDao.getChildrenById(reportId);
        Report targetGroup = reportDao.getEntity(groupId);
        for (Report temp : list) {
            if (temp.getId().equals(reportId)) { // 判断是否是移动节点（即被移动枝的根节点）
                temp.setSeqNo(reportDao.getNextSeqNo(groupId));
                temp.setParentId(groupId);
            }
            
            if (ParamConstants.TRUE.equals(targetGroup.getDisabled())) {
                temp.setDisabled(ParamConstants.TRUE); // 如果目标根节点是停用状态，则所有新复制出来的节点也一律为停用状态
            }
            
            reportDao.update(temp);
        }
    }
}
