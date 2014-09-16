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


打包注意：
1、更改portal/model下Logo图标（BTR 、WMS）
2、tssUtil.js里 SYSTEM_TITLE 更改
3、#class.name.IdentityGetter = com.jinhe.tss.um.sso.UMIdentityGetter
    class.name.IdentityGetter = com.jinhe.tss.um.sso.othersystem.WmsIdentifyGetter