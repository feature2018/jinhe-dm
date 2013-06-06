package com.best.oasis.wmsx.report;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jinhe.tss.framework.component.param.ParamConstants;

@Service
public class ReportServiceImpl implements ReportService {
    
    @Autowired ReportDao reportDao;
    
    public List<?> getAllReport() {
        return reportDao.getAllReport();
    }
    
    public List<?> getAllReportGroups() {
        return reportDao.getAllReportGroups();
    }

    public Report saveReport(Report report) {
        if ( report.getId() == null ) {
            report.setSeqNo(reportDao.getNextSeqNo(report.getParentId()));
            reportDao.create(report);
        }
        else {
            reportDao.update(report);
        }
        return report;
    }

    public void startOrStop(Long reportId, Integer disabled) {
        List<Report> list = ParamConstants.TRUE.equals(disabled) ? 
                reportDao.getChildrenById(reportId) : reportDao.getParentsById(reportId);
        
        for (Report report : list) {
            report.setDisabled(disabled);
            reportDao.updateWithoutFlush(report);
        }
        reportDao.flush();
    }

    public void delete(Long id) {
        List<Report> list = reportDao.getChildrenById(id); // 一并删除子节点
        for(Report entity : list) {
            reportDao.delete(entity);
        }
    }

    public Report getReport(Long id) {
        Report report = reportDao.getEntity(id);
        reportDao.evict(report);
        return report;
    }

    public void sort(Long startId, Long targetId, int direction) {
        reportDao.sort(startId, targetId, direction);
    }

    public List<?> copy(Long reportId, Long groupId) {
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

    public void move(Long sourceId, Long targetId) {
        List<Report> list  = reportDao.getChildrenById(sourceId);
        Report targetGroup = reportDao.getEntity(targetId);
        for (Report temp : list) {
            if (temp.getId().equals(sourceId)) { // 判断是否是移动节点（即被移动枝的根节点）
                temp.setSeqNo(reportDao.getNextSeqNo(targetId));
                temp.setParentId(targetId);
            }
            
            if (ParamConstants.TRUE.equals(targetGroup.getDisabled())) {
                temp.setDisabled(ParamConstants.TRUE); // 如果目标根节点是停用状态，则所有新复制出来的节点也一律为停用状态
            }
            
            reportDao.update(temp);
        }
    }
}
