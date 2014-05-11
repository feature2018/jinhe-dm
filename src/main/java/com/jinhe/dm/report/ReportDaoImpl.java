package com.jinhe.dm.report;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.jinhe.tss.framework.persistence.TreeSupportDao;

@Repository("ReportDao")
public class ReportDaoImpl extends TreeSupportDao<Report> implements ReportDao {

	public ReportDaoImpl() {
        super(Report.class);
    }
	
	public Report refreshReport(Report report) {
    	super.update(report);
        return report;
    }
    
	public Report deleteReport(Report report) {
		Long id = report.getId();
        List<Report> list = getChildrenById(id);
        for(Report entity : list) {
            delete(entity);
        }
        return report;
	}

	public List<Report> getChildrenById(Long id, String operationId) {
		return getChildrenById(id);
	}
}