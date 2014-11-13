-- 变更applicationId为dms
UPDATE um_application t SET t.`applicationId` = 'dms' WHERE t.`applicationId`='dm';
UPDATE um_resourcetype t SET t.`applicationId` = 'dms' WHERE t.`applicationId`='dm';
UPDATE um_resourcetype_root t SET t.`applicationId` = 'dms' WHERE t.`applicationId`='dm';
UPDATE um_operation t SET t.`applicationId` = 'dms' WHERE t.`applicationId`='dm';

UPDATE um_user t SET t.`authMethod` = 'com.jinhe.tss.um.sso.UMPasswordIdentifier';



-- SELECT t.`param` FROM dm_report t WHERE t.param  LIKE '%jsonUrl%';
UPDATE dm_report t SET t.param = REPLACE( t.param, '../display/json/', '../../display/json/');
UPDATE dm_report t SET t.param = REPLACE( t.param, '../service/', '../../service/');

UPDATE dm_report t SET t.displayUri = REPLACE( t.displayUri, '../common/ichart.html', 'ichart.html');
UPDATE dm_report t SET t.displayUri = REPLACE( t.displayUri, '../wms/kanban', '../../wms/kanban');



补丁1：报表授权，root全勾，授权后发现子节点没勾上
update dm_report t SET t.decode=CONCAT('00001', t.decode);



