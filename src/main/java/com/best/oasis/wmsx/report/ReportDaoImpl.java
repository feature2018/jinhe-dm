package com.best.oasis.wmsx.report;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.jinhe.tss.framework.persistence.TreeSupportDao;

@Repository
@SuppressWarnings("unchecked")
public class ReportDaoImpl extends TreeSupportDao<Report> implements ReportDao {

	public ReportDaoImpl() {
        super(Report.class);
    }
	
	
    public List<Report> getAllReport() {
		return (List<Report>)getEntities("from Report o where o.deleted <> 1 order by o.decode");
	}
 
	public List<Report> getAllReportGroups() {
		return (List<Report>) getEntities("from Report o where o.type = ? and o.deleted <> 1 order by o.decode", Report.TYPE0);
	}
}