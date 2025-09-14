-- 导入交路参数（drive_ticket_param）
-- 以 JSON 为准，按 param_name 幂等导入，不写入 id（自增）
DELETE FROM drive_ticket_param WHERE param_name = '最大开车时间';
INSERT INTO drive_ticket_param (param_name, param_value, param_type, param_desc, is_checked) VALUES ('最大开车时间', '02:00:00', '1', '最大开车时间参数', 1);

DELETE FROM drive_ticket_param WHERE param_name = '早班接车时间';
INSERT INTO drive_ticket_param (param_name, param_value, param_type, param_desc, is_checked) VALUES ('早班接车时间', '04:00:00', '1', '早班接车时间参数', 1);

DELETE FROM drive_ticket_param WHERE param_name = '早班退车时间';
INSERT INTO drive_ticket_param (param_name, param_value, param_type, param_desc, is_checked) VALUES ('早班退车时间', '11:00:00', '1', '早班退车时间参数', 1);

DELETE FROM drive_ticket_param WHERE param_name = '白班接车时间';
INSERT INTO drive_ticket_param (param_name, param_value, param_type, param_desc, is_checked) VALUES ('白班接车时间', '11:00:00', '1', '白班接车时间参数', 1);

DELETE FROM drive_ticket_param WHERE param_name = '白班退车时间';
INSERT INTO drive_ticket_param (param_name, param_value, param_type, param_desc, is_checked) VALUES ('白班退车时间', '16:00:00', '1', '白班退车时间参数', 1);

DELETE FROM drive_ticket_param WHERE param_name = '夜班接车时间';
INSERT INTO drive_ticket_param (param_name, param_value, param_type, param_desc, is_checked) VALUES ('夜班接车时间', '16:00:00', '1', '白班接车时间参数', 1);

DELETE FROM drive_ticket_param WHERE param_name = '夜班退车时间';
INSERT INTO drive_ticket_param (param_name, param_value, param_type, param_desc, is_checked) VALUES ('夜班退车时间', '22:00:00', '1', '白班退车时间参数', 1);

DELETE FROM drive_ticket_param WHERE param_name = '强制回程站点';
INSERT INTO drive_ticket_param (param_name, param_value, param_type, param_desc, is_checked) VALUES ('强制回程站点', '五道口站', '2', '强制回程站点参数', 0);

DELETE FROM drive_ticket_param WHERE param_name = '变更车次间隔时间';
INSERT INTO drive_ticket_param (param_name, param_value, param_type, param_desc, is_checked) VALUES ('变更车次间隔时间', '00:10:00', '1', '变更车次间隔时间参数(默认30分钟)', 1);