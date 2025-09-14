-- 完整数据导入脚本
-- 从本地JSON文件导入所有数据到D1数据库

-- 1. 导入线路数据 (cw_line.json)
INSERT INTO cw_line (line_id, line_name, line_color, line_type, created_at, updated_at) VALUES
('L001', '1号线', '#E60012', 'metro', datetime('now'), datetime('now')),
('L002', '2号线', '#0066CC', 'metro', datetime('now'), datetime('now')),
('L013', '13号线', '#FFCD00', 'metro', datetime('now'), datetime('now'));

-- 2. 导入车站数据 (cw_station.json)
INSERT INTO cw_station (station_id, station_name, line_id, station_order, latitude, longitude, created_at, updated_at) VALUES
('S001', '苹果园站', 'L001', 1, 39.9156, 116.1853, datetime('now'), datetime('now')),
('S002', '古城站', 'L001', 2, 39.9067, 116.1947, datetime('now'), datetime('now')),
('S003', '八角游乐园站', 'L001', 3, 39.9067, 116.2047, datetime('now'), datetime('now')),
('S004', '八宝山站', 'L001', 4, 39.9067, 116.2147, datetime('now'), datetime('now')),
('S005', '玉泉路站', 'L001', 5, 39.9067, 116.2247, datetime('now'), datetime('now')),
('S006', '五棵松站', 'L001', 6, 39.9067, 116.2347, datetime('now'), datetime('now')),
('S007', '万寿路站', 'L001', 7, 39.9067, 116.2447, datetime('now'), datetime('now')),
('S008', '公主坟站', 'L001', 8, 39.9067, 116.2547, datetime('now'), datetime('now')),
('S009', '军事博物馆站', 'L001', 9, 39.9067, 116.2647, datetime('now'), datetime('now')),
('S010', '木樨地站', 'L001', 10, 39.9067, 116.2747, datetime('now'), datetime('now')),
('S011', '南礼士路站', 'L001', 11, 39.9067, 116.2847, datetime('now'), datetime('now')),
('S012', '复兴门站', 'L001', 12, 39.9067, 116.2947, datetime('now'), datetime('now')),
('S013', '西单站', 'L001', 13, 39.9067, 116.3047, datetime('now'), datetime('now')),
('S014', '天安门西站', 'L001', 14, 39.9067, 116.3147, datetime('now'), datetime('now')),
('S015', '天安门东站', 'L001', 15, 39.9067, 116.3247, datetime('now'), datetime('now')),
('S016', '王府井站', 'L001', 16, 39.9067, 116.3347, datetime('now'), datetime('now')),
('S017', '东单站', 'L001', 17, 39.9067, 116.3447, datetime('now'), datetime('now')),
('S018', '建国门站', 'L001', 18, 39.9067, 116.3547, datetime('now'), datetime('now')),
('S019', '永安里站', 'L001', 19, 39.9067, 116.3647, datetime('now'), datetime('now')),
('S020', '国贸站', 'L001', 20, 39.9067, 116.3747, datetime('now'), datetime('now'));

-- 3. 导入逻辑车站数据 (cw_logic_station.json)
INSERT INTO cw_logic_station (logic_station_id, logic_station_name, station_ids, description, created_at, updated_at) VALUES
('LS001', '苹果园', 'S001', '1号线起点站', datetime('now'), datetime('now')),
('LS002', '古城', 'S002', '1号线第二站', datetime('now'), datetime('now')),
('LS003', '八角游乐园', 'S003', '1号线第三站', datetime('now'), datetime('now')),
('LS004', '八宝山', 'S004', '1号线第四站', datetime('now'), datetime('now')),
('LS005', '玉泉路', 'S005', '1号线第五站', datetime('now'), datetime('now'));

-- 4. 导入交路数据 (cw_crossing_road.json)
INSERT INTO cw_crossing_road (crossing_road_id, crossing_road_name, line_id, start_station_id, end_station_id, direction, distance_km, travel_time_minutes, created_at, updated_at) VALUES
('CR001', '苹果园-国贸', 'L001', 'S001', 'S020', 'eastbound', 32.1, 52, datetime('now'), datetime('now')),
('CR002', '国贸-苹果园', 'L001', 'S020', 'S001', 'westbound', 32.1, 52, datetime('now'), datetime('now'));

-- 5. 导入列车时刻表数据 (cw_train_schedule.json)
INSERT INTO cw_train_schedule (schedule_id, train_number, crossing_road_id, departure_time, arrival_time, service_type, status, created_at, updated_at) VALUES
('TS001', 'T001', 'CR001', '05:30:00', '06:22:00', 'regular', 'active', datetime('now'), datetime('now')),
('TS002', 'T002', 'CR001', '06:00:00', '06:52:00', 'regular', 'active', datetime('now'), datetime('now')),
('TS003', 'T003', 'CR001', '06:30:00', '07:22:00', 'regular', 'active', datetime('now'), datetime('now')),
('TS004', 'T004', 'CR001', '07:00:00', '07:52:00', 'regular', 'active', datetime('now'), datetime('now')),
('TS005', 'T001R', 'CR002', '06:30:00', '07:22:00', 'regular', 'active', datetime('now'), datetime('now')),
('TS006', 'T002R', 'CR002', '07:00:00', '07:52:00', 'regular', 'active', datetime('now'), datetime('now')),
('TS007', 'T003R', 'CR002', '07:30:00', '08:22:00', 'regular', 'active', datetime('now'), datetime('now')),
('TS008', 'T004R', 'CR002', '08:00:00', '08:52:00', 'regular', 'active', datetime('now'), datetime('now'));

-- 6. 导入交路票数据 (drive_ticket.json)
INSERT INTO drive_ticket (ticket_id, crossing_road_id, start_station_id, end_station_id, departure_time, arrival_time, seat_type_id, price, status, created_at, updated_at) VALUES
('DT001', 'CR001', 'S001', 'S020', '05:30:00', '06:22:00', 1, 6.00, 'available', datetime('now'), datetime('now')),
('DT002', 'CR001', 'S001', 'S019', '05:30:00', '06:20:00', 1, 5.50, 'available', datetime('now'), datetime('now')),
('DT003', 'CR001', 'S001', 'S018', '05:30:00', '06:18:00', 1, 5.00, 'available', datetime('now'), datetime('now')),
('DT004', 'CR001', 'S001', 'S017', '05:30:00', '06:16:00', 1, 4.50, 'available', datetime('now'), datetime('now')),
('DT005', 'CR001', 'S001', 'S016', '05:30:00', '06:14:00', 1, 4.00, 'available', datetime('now'), datetime('now')),
('DT006', 'CR001', 'S001', 'S015', '05:30:00', '06:12:00', 1, 3.50, 'available', datetime('now'), datetime('now')),
('DT007', 'CR001', 'S001', 'S014', '05:30:00', '06:10:00', 1, 3.00, 'available', datetime('now'), datetime('now')),
('DT008', 'CR001', 'S001', 'S013', '05:30:00', '06:08:00', 1, 2.50, 'available', datetime('now'), datetime('now')),
('DT009', 'CR001', 'S002', 'S020', '05:32:00', '06:22:00', 1, 5.50, 'available', datetime('now'), datetime('now')),
('DT010', 'CR001', 'S002', 'S019', '05:32:00', '06:20:00', 1, 5.00, 'available', datetime('now'), datetime('now')),
('DT011', 'CR001', 'S002', 'S018', '05:32:00', '06:18:00', 1, 4.50, 'available', datetime('now'), datetime('now')),
('DT012', 'CR001', 'S002', 'S017', '05:32:00', '06:16:00', 1, 4.00, 'available', datetime('now'), datetime('now')),
('DT013', 'CR001', 'S003', 'S020', '05:34:00', '06:22:00', 1, 5.00, 'available', datetime('now'), datetime('now')),
('DT014', 'CR001', 'S003', 'S019', '05:34:00', '06:20:00', 1, 4.50, 'available', datetime('now'), datetime('now')),
('DT015', 'CR001', 'S003', 'S018', '05:34:00', '06:18:00', 1, 4.00, 'available', datetime('now'), datetime('now')),
('DT016', 'CR001', 'S004', 'S020', '05:36:00', '06:22:00', 1, 4.50, 'available', datetime('now'), datetime('now')),
('DT017', 'CR001', 'S004', 'S019', '05:36:00', '06:20:00', 1, 4.00, 'available', datetime('now'), datetime('now')),
('DT018', 'CR001', 'S005', 'S020', '05:38:00', '06:22:00', 1, 4.00, 'available', datetime('now'), datetime('now')),
('DT019', 'CR002', 'S020', 'S001', '06:30:00', '07:22:00', 1, 6.00, 'available', datetime('now'), datetime('now')),
('DT020', 'CR002', 'S019', 'S001', '06:32:00', '07:22:00', 1, 5.50, 'available', datetime('now'), datetime('now')),
('DT021', 'CR002', 'S018', 'S001', '06:34:00', '07:22:00', 1, 5.00, 'available', datetime('now'), datetime('now')),
('DT022', 'CR002', 'S017', 'S001', '06:36:00', '07:22:00', 1, 4.50, 'available', datetime('now'), datetime('now')),
('DT023', 'CR002', 'S016', 'S001', '06:38:00', '07:22:00', 1, 4.00, 'available', datetime('now'), datetime('now')),
('DT024', 'CR002', 'S015', 'S001', '06:40:00', '07:22:00', 1, 3.50, 'available', datetime('now'), datetime('now'));

-- 7. 导入交路票夹数据 (drive_ticket_collect.json)
INSERT INTO drive_ticket_collect (collect_id, collect_name, ticket_ids, total_price, discount_rate, valid_from, valid_to, status, created_at, updated_at) VALUES
('DTC001', '早高峰套票1', 'DT001,DT002,DT003', 16.50, 0.1, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
('DTC002', '早高峰套票2', 'DT004,DT005,DT006', 12.00, 0.1, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
('DTC003', '晚高峰套票1', 'DT019,DT020,DT021', 16.50, 0.1, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
('DTC004', '晚高峰套票2', 'DT022,DT023,DT024', 12.00, 0.1, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
('DTC005', '全日通票', 'DT001,DT019', 12.00, 0.2, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
('DTC006', '周末套票', 'DT002,DT020', 11.00, 0.15, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
('DTC007', '学生套票', 'DT003,DT021', 10.00, 0.25, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
('DTC008', '老人套票', 'DT004,DT022', 9.00, 0.3, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
('DTC009', '商务套票', 'DT005,DT023', 8.00, 0.2, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
('DTC010', '旅游套票', 'DT006,DT024', 7.00, 0.25, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
('DTC011', '夜间套票', 'DT007,DT008', 5.50, 0.15, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now'));

-- 8. 导入交路参数数据 (drive_ticket_param.json)
INSERT INTO drive_ticket_param (param_id, crossing_road_id, param_name, param_value, param_type, description, created_at, updated_at) VALUES
('DTP001', 'CR001', 'base_price', '2.00', 'decimal', '基础票价', datetime('now'), datetime('now')),
('DTP002', 'CR001', 'distance_rate', '0.15', 'decimal', '距离费率(元/公里)', datetime('now'), datetime('now')),
('DTP003', 'CR001', 'peak_multiplier', '1.2', 'decimal', '高峰时段倍数', datetime('now'), datetime('now')),
('DTP004', 'CR001', 'off_peak_discount', '0.9', 'decimal', '非高峰折扣', datetime('now'), datetime('now')),
('DTP005', 'CR002', 'base_price', '2.00', 'decimal', '基础票价', datetime('now'), datetime('now')),
('DTP006', 'CR002', 'distance_rate', '0.15', 'decimal', '距离费率(元/公里)', datetime('now'), datetime('now')),
('DTP007', 'CR002', 'peak_multiplier', '1.2', 'decimal', '高峰时段倍数', datetime('now'), datetime('now')),
('DTP008', 'CR002', 'off_peak_discount', '0.9', 'decimal', '非高峰折扣', datetime('now'), datetime('now')),
('DTP009', 'CR001', 'max_capacity', '1200', 'integer', '最大载客量', datetime('now'), datetime('now'));

-- 9. 导入便乘票数据 (drive_ride_ticket.json)
INSERT INTO drive_ride_ticket (ride_ticket_id, employee_id, employee_name, start_station_id, end_station_id, ride_date, ride_time, purpose, status, created_at, updated_at) VALUES
('DRT001', 'E001', '张三', 'S001', 'S020', '2024-01-15', '08:30:00', '上班通勤', 'used', datetime('now'), datetime('now')),
('DRT002', 'E002', '李四', 'S020', 'S001', '2024-01-15', '18:30:00', '下班通勤', 'used', datetime('now'), datetime('now')),
('DRT003', 'E003', '王五', 'S005', 'S015', '2024-01-15', '09:00:00', '业务出行', 'used', datetime('now'), datetime('now')),
('DRT004', 'E004', '赵六', 'S010', 'S018', '2024-01-15', '14:30:00', '会议出行', 'used', datetime('now'), datetime('now')),
('DRT005', 'E005', '钱七', 'S002', 'S019', '2024-01-16', '07:45:00', '上班通勤', 'used', datetime('now'), datetime('now')),
('DRT006', 'E006', '孙八', 'S019', 'S002', '2024-01-16', '17:45:00', '下班通勤', 'used', datetime('now'), datetime('now')),
('DRT007', 'E007', '周九', 'S003', 'S017', '2024-01-16', '10:15:00', '培训出行', 'used', datetime('now'), datetime('now')),
('DRT008', 'E008', '吴十', 'S008', 'S016', '2024-01-16', '13:20:00', '客户拜访', 'used', datetime('now'), datetime('now')),
('DRT009', 'E009', '郑一', 'S004', 'S014', '2024-01-17', '08:00:00', '上班通勤', 'active', datetime('now'), datetime('now')),
('DRT010', 'E010', '王二', 'S014', 'S004', '2024-01-17', '18:00:00', '下班通勤', 'active', datetime('now'), datetime('now')),
('DRT011', 'E011', '李三', 'S006', 'S013', '2024-01-17', '09:30:00', '业务出行', 'active', datetime('now'), datetime('now')),
('DRT012', 'E012', '张四', 'S012', 'S020', '2024-01-17', '15:45:00', '会议出行', 'active', datetime('now'), datetime('now')),
('DRT013', 'E013', '赵五', 'S007', 'S018', '2024-01-18', '07:30:00', '上班通勤', 'active', datetime('now'), datetime('now')),
('DRT014', 'E014', '钱六', 'S018', 'S007', '2024-01-18', '17:30:00', '下班通勤', 'active', datetime('now'), datetime('now')),
('DRT015', 'E015', '孙七', 'S009', 'S016', '2024-01-18', '11:00:00', '培训出行', 'active', datetime('now'), datetime('now')),
('DRT016', 'E016', '周八', 'S011', 'S015', '2024-01-18', '14:15:00', '客户拜访', 'active', datetime('now'), datetime('now')),
('DRT017', 'E017', '吴九', 'S001', 'S010', '2024-01-19', '08:15:00', '上班通勤', 'active', datetime('now'), datetime('now')),
('DRT018', 'E018', '郑十', 'S010', 'S001', '2024-01-19', '18:15:00', '下班通勤', 'active', datetime('now'), datetime('now')),
('DRT019', 'E019', '王一', 'S005', 'S020', '2024-01-19', '09:45:00', '业务出行', 'active', datetime('now'), datetime('now')),
('DRT020', 'E020', '李二', 'S020', 'S005', '2024-01-19', '16:30:00', '会议出行', 'active', datetime('now'), datetime('now')),
('DRT021', 'E021', '张三', 'S003', 'S018', '2024-01-20', '07:00:00', '上班通勤', 'active', datetime('now'), datetime('now')),
('DRT022', 'E022', '赵四', 'S018', 'S003', '2024-01-20', '19:00:00', '下班通勤', 'active', datetime('now'), datetime('now')),
('DRT023', 'E023', '钱五', 'S008', 'S017', '2024-01-20', '10:30:00', '培训出行', 'active', datetime('now'), datetime('now')),
('DRT024', 'E024', '孙六', 'S013', 'S019', '2024-01-20', '13:45:00', '客户拜访', 'active', datetime('now'), datetime('now')),
('DRT025', 'E025', '周七', 'S002', 'S016', '2024-01-21', '08:45:00', '上班通勤', 'active', datetime('now'), datetime('now')),
('DRT026', 'E026', '吴八', 'S016', 'S002', '2024-01-21', '17:15:00', '下班通勤', 'active', datetime('now'), datetime('now')),
('DRT027', 'E027', '郑九', 'S006', 'S014', '2024-01-21', '11:15:00', '业务出行', 'active', datetime('now'), datetime('now')),
('DRT028', 'E028', '王十', 'S012', 'S008', '2024-01-21', '15:00:00', '会议出行', 'active', datetime('now'), datetime('now')),
('DRT029', 'E029', '李一', 'S004', 'S020', '2024-01-22', '07:15:00', '上班通勤', 'active', datetime('now'), datetime('now')),
('DRT030', 'E030', '张二', 'S020', 'S004', '2024-01-22', '18:45:00', '下班通勤', 'active', datetime('now'), datetime('now')),
('DRT031', 'E031', '赵三', 'S009', 'S015', '2024-01-22', '12:00:00', '培训出行', 'active', datetime('now'), datetime('now')),
('DRT032', 'E032', '钱四', 'S011', 'S017', '2024-01-22', '16:45:00', '客户拜访', 'active', datetime('now'), datetime('now'));

-- 10. 导入列车时刻表明细数据 (cw_train_schedule_detail.json)
INSERT INTO cw_train_schedule_detail (detail_id, schedule_id, station_id, arrival_time, departure_time, stop_duration_seconds, platform_number, created_at, updated_at) VALUES
('TSD001', 'TS001', 'S001', NULL, '05:30:00', 0, '1', datetime('now'), datetime('now')),
('TSD002', 'TS001', 'S002', '05:32:00', '05:32:30', 30, '1', datetime('now'), datetime('now')),
('TSD003', 'TS001', 'S003', '05:34:00', '05:34:30', 30, '1', datetime('now'), datetime('now')),
('TSD004', 'TS001', 'S004', '05:36:00', '05:36:30', 30, '1', datetime('now'), datetime('now')),
('TSD005', 'TS001', 'S005', '05:38:00', '05:38:30', 30, '1', datetime('now'), datetime('now')),
('TSD006', 'TS001', 'S006', '05:40:00', '05:40:30', 30, '1', datetime('now'), datetime('now')),
('TSD007', 'TS001', 'S007', '05:42:00', '05:42:30', 30, '1', datetime('now'), datetime('now')),
('TSD008', 'TS001', 'S008', '05:44:00', '05:44:30', 30, '1', datetime('now'), datetime('now')),
('TSD009', 'TS001', 'S009', '05:46:00', '05:46:30', 30, '1', datetime('now'), datetime('now')),
('TSD010', 'TS001', 'S010', '05:48:00', '05:48:30', 30, '1', datetime('now'), datetime('now')),
('TSD011', 'TS001', 'S011', '05:50:00', '05:50:30', 30, '1', datetime('now'), datetime('now')),
('TSD012', 'TS001', 'S012', '05:52:00', '05:52:30', 30, '1', datetime('now'), datetime('now')),
('TSD013', 'TS001', 'S013', '05:54:00', '05:54:30', 30, '1', datetime('now'), datetime('now')),
('TSD014', 'TS001', 'S014', '05:56:00', '05:56:30', 30, '1', datetime('now'), datetime('now')),
('TSD015', 'TS001', 'S015', '05:58:00', '05:58:30', 30, '1', datetime('now'), datetime('now')),
('TSD016', 'TS001', 'S016', '06:00:00', '06:00:30', 30, '1', datetime('now'), datetime('now')),
('TSD017', 'TS001', 'S017', '06:02:00', '06:02:30', 30, '1', datetime('now'), datetime('now')),
('TSD018', 'TS001', 'S018', '06:04:00', '06:04:30', 30, '1', datetime('now'), datetime('now')),
('TSD019', 'TS001', 'S019', '06:06:00', '06:06:30', 30, '1', datetime('now'), datetime('now')),
('TSD020', 'TS001', 'S020', '06:22:00', NULL, 0, '1', datetime('now'), datetime('now')),
('TSD021', 'TS005', 'S020', NULL, '06:30:00', 0, '2', datetime('now'), datetime('now')),
('TSD022', 'TS005', 'S019', '06:32:00', '06:32:30', 30, '2', datetime('now'), datetime('now')),
('TSD023', 'TS005', 'S018', '06:34:00', '06:34:30', 30, '2', datetime('now'), datetime('now')),
('TSD024', 'TS005', 'S017', '06:36:00', '06:36:30', 30, '2', datetime('now'), datetime('now')),
('TSD025', 'TS005', 'S016', '06:38:00', '06:38:30', 30, '2', datetime('now'), datetime('now')),
('TSD026', 'TS005', 'S015', '06:40:00', '06:40:30', 30, '2', datetime('now'), datetime('now')),
('TSD027', 'TS005', 'S014', '06:42:00', '06:42:30', 30, '2', datetime('now'), datetime('now')),
('TSD028', 'TS005', 'S013', '06:44:00', '06:44:30', 30, '2', datetime('now'), datetime('now')),
('TSD029', 'TS005', 'S012', '06:46:00', '06:46:30', 30, '2', datetime('now'), datetime('now')),
('TSD030', 'TS005', 'S011', '06:48:00', '06:48:30', 30, '2', datetime('now'), datetime('now')),
('TSD031', 'TS005', 'S010', '06:50:00', '06:50:30', 30, '2', datetime('now'), datetime('now')),
('TSD032', 'TS005', 'S009', '06:52:00', '06:52:30', 30, '2', datetime('now'), datetime('now')),
('TSD033', 'TS005', 'S008', '06:54:00', '06:54:30', 30, '2', datetime('now'), datetime('now')),
('TSD034', 'TS005', 'S007', '06:56:00', '06:56:30', 30, '2', datetime('now'), datetime('now')),
('TSD035', 'TS005', 'S006', '06:58:00', '06:58:30', 30, '2', datetime('now'), datetime('now')),
('TSD036', 'TS005', 'S005', '07:00:00', '07:00:30', 30, '2', datetime('now'), datetime('now')),
('TSD037', 'TS005', 'S004', '07:02:00', '07:02:30', 30, '2', datetime('now'), datetime('now')),
('TSD038', 'TS005', 'S003', '07:04:00', '07:04:30', 30, '2', datetime('now'), datetime('now')),
('TSD039', 'TS005', 'S002', '07:06:00', '07:06:30', 30, '2', datetime('now'), datetime('now')),
('TSD040', 'TS005', 'S001', '07:22:00', NULL, 0, '2', datetime('now'), datetime('now'));