package com.best.oasis.wmsx.report;

import java.util.List;

public interface ReportService {

    List<?> getAllReport();

    List<?> getAllReportGroups();

    Report saveReport(Report report);

    void startOrStop(Long reportId, Integer disabled);

    void delete(Long id);

    Report getReport(Long id);

    void sort(Long startId, Long targetId, int direction);

    List<?> copy(Long reportId, Long groupId);

    void move(Long sourceId, Long targetId);

}
