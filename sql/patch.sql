-- 变更applicationId为dms
UPDATE um_application t SET t.`applicationId` = 'dms' WHERE t.`applicationId`='dm';
UPDATE um_resourcetype t SET t.`applicationId` = 'dms' WHERE t.`applicationId`='dm';
UPDATE um_resourcetype_root t SET t.`applicationId` = 'dms' WHERE t.`applicationId`='dm';
UPDATE um_operation t SET t.`applicationId` = 'dms' WHERE t.`applicationId`='dm';


UPDATE dm_report t SET t.param = REPLACE( t.param, '../display/json/', '../../display/json/');
UPDATE dm_report t SET t.param = REPLACE( t.param, '../service/', '../../service/');
-- SELECT t.`param` FROM dm_report t WHERE t.param  LIKE '%jsonUrl%';

UPDATE dm_report t SET t.displayUri = REPLACE( t.`displayUri`, '../common/ichart.html', 'ichart.html');


UPDATE um_user t SET t.`authMethod` = 'com.jinhe.tss.um.sso.UMPasswordIdentifier';