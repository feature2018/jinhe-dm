drop table view_report_resources;
CREATE VIEW view_report_resources AS
SELECT 0 as id, 'root' as name, -1 as parentId, 1 as seqNo, 1 AS levelNo, '00001' as decode FROM dual
UNION
SELECT id, name, parentId, seqNo, levelNo, decode FROM dm_report;