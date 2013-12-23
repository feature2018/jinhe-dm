package com.jinhe.dm.report;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.jinhe.tss.framework.persistence.TreeSupportDao;

@Repository("ReportDao")
public class ReportDaoImpl extends TreeSupportDao<Report> implements ReportDao {

	public ReportDaoImpl() {
        super(Report.class);
    }

	public List<Report> getChildrenById(Long id, String operationId) {
		return getChildrenById(id);
	}
}