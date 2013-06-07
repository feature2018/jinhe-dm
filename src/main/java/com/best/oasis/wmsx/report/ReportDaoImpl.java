package com.best.oasis.wmsx.report;

import org.springframework.stereotype.Repository;

import com.jinhe.tss.framework.persistence.TreeSupportDao;

@Repository("ReportDao")
public class ReportDaoImpl extends TreeSupportDao<Report> implements ReportDao {

	public ReportDaoImpl() {
        super(Report.class);
    }
	
}