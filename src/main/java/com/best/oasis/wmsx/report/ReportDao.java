package com.best.oasis.wmsx.report;

import java.util.List;

import com.jinhe.tss.framework.persistence.ITreeSupportDao;
 
public interface ReportDao extends ITreeSupportDao<Report>{

    List<Report> getAllReport();
	
    List<Report> getAllReportGroups();
}
