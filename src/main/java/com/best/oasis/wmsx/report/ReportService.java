package com.best.oasis.wmsx.report;

import java.util.List;

public interface ReportService {

    Report getReport(Long id);
    
    List<Report> getAllReport();

    List<Report> getAllReportGroups();

    Report saveReport(Report report);
    
    void delete(Long id);

    void startOrStop(Long reportId, Integer disabled);

    void sort(Long startId, Long targetId, int direction);

    List<Report> copy(Long reportId, Long groupId);

    void move(Long sourceId, Long targetId);

}
