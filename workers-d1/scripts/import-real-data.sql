-- 基于真实JSON数据的完整导入脚本
-- 从本地data目录的JSON文件导入所有实际数据

-- 1. 导入线路数据 (cw_line.json)
INSERT INTO cw_line (line_id, line_name, line_color, line_type, created_at, updated_at) VALUES
(1, '1号线', '#E60012', 'metro', datetime('now'), datetime('now')),
(2, '2号线', '#0066CC', 'metro', datetime('now'), datetime('now')),
(3, '3号线', '#FFCD00', 'metro', datetime('now'), datetime('now'));

-- 2. 导入车站数据 (cw_station.json)
INSERT INTO cw_station (station_id, station_name, line_id, station_order, latitude, longitude, created_at, updated_at) VALUES
(1, '王府井站', 1, 1, 39.9067, 116.4147, datetime('now'), datetime('now')),
(2, '西单站', 1, 2, 39.9067, 116.3747, datetime('now'), datetime('now')),
(3, '东直门站', 1, 3, 39.9467, 116.4347, datetime('now'), datetime('now')),
(4, '西直门站', 1, 4, 39.9467, 116.3547, datetime('now'), datetime('now')),
(5, '建国门站', 1, 5, 39.9067, 116.4347, datetime('now'), datetime('now')),
(6, '复兴门站', 1, 6, 39.9067, 116.3547, datetime('now'), datetime('now')),
(7, '国贸站', 1, 7, 39.9067, 116.4547, datetime('now'), datetime('now')),
(8, '海淀黄庄站', 1, 8, 39.9567, 116.3147, datetime('now'), datetime('now')),
(9, '中关村站', 1, 9, 39.9667, 116.3047, datetime('now'), datetime('now')),
(10, '五道口站', 1, 10, 39.9767, 116.3347, datetime('now'), datetime('now')),
(11, '雍和宫站', 1, 11, 39.9467, 116.4147, datetime('now'), datetime('now')),
(12, '安定门站', 1, 12, 39.9567, 116.4047, datetime('now'), datetime('now')),
(13, '朝阳门站', 1, 13, 39.9267, 116.4247, datetime('now'), datetime('now')),
(14, '崇文门站', 1, 14, 39.9067, 116.4047, datetime('now'), datetime('now')),
(15, '宣武门站', 1, 15, 39.9067, 116.3847, datetime('now'), datetime('now')),
(16, '菜市口站', 1, 16, 39.8967, 116.3747, datetime('now'), datetime('now')),
(17, '陶然亭站', 1, 17, 39.8867, 116.3647, datetime('now'), datetime('now')),
(18, '北京站', 1, 18, 39.9067, 116.4247, datetime('now'), datetime('now')),
(19, '天安门东站', 1, 19, 39.9067, 116.3947, datetime('now'), datetime('now')),
(20, '天安门西站', 1, 20, 39.9067, 116.3847, datetime('now'), datetime('now'));

-- 3. 导入逻辑车站数据 (cw_logic_station.json)
INSERT INTO cw_logic_station (logic_station_id, logic_station_name, station_ids, description, created_at, updated_at) VALUES
(1, '西直门站-类型1', '4', '西直门站逻辑站点类型1', datetime('now'), datetime('now')),
(2, '宣武门站-类型1', '15', '宣武门站逻辑站点类型1', datetime('now'), datetime('now')),
(3, '西直门站-类型2', '4', '西直门站逻辑站点类型2', datetime('now'), datetime('now')),
(4, '宣武门站-类型2', '15', '宣武门站逻辑站点类型2', datetime('now'), datetime('now')),
(5, '五道口站-类型3', '10', '五道口站逻辑站点类型3', datetime('now'), datetime('now')),
(6, '宣武门站-类型3', '15', '宣武门站逻辑站点类型3', datetime('now'), datetime('now')),
(7, '五道口站-类型4', '10', '五道口站逻辑站点类型4', datetime('now'), datetime('now')),
(8, '宣武门站-类型4', '15', '宣武门站逻辑站点类型4', datetime('now'), datetime('now'));

-- 4. 导入交路数据 (cw_crossing_road.json)
INSERT INTO cw_crossing_road (crossing_road_id, crossing_road_name, line_id, start_station_id, end_station_id, direction, distance_km, travel_time_minutes, created_at, updated_at) VALUES
(1, '1号线上行交路', 1, 1, 20, 'eastbound', 25.5, 96, datetime('now'), datetime('now')),
(2, '1号线下行交路', 1, 20, 1, 'westbound', 25.5, 96, datetime('now'), datetime('now'));

-- 5. 导入列车时刻表数据 (cw_train_schedule.json)
INSERT INTO cw_train_schedule (schedule_id, train_number, crossing_road_id, departure_time, arrival_time, service_type, status, created_at, updated_at) VALUES
(101, 'G00101', 1, '06:00:00', '07:36:00', 'regular', 'active', datetime('now'), datetime('now')),
(102, 'G00102', 2, '08:00:00', '09:36:00', 'regular', 'active', datetime('now'), datetime('now')),
(103, 'G00103', 1, '10:00:00', '12:34:00', 'regular', 'active', datetime('now'), datetime('now')),
(104, 'G00104', 2, '13:00:00', '16:13:00', 'regular', 'active', datetime('now'), datetime('now')),
(105, 'G00201', 1, '06:10:00', '08:05:00', 'regular', 'active', datetime('now'), datetime('now')),
(106, 'G00202', 2, '08:11:00', '10:06:00', 'regular', 'active', datetime('now'), datetime('now')),
(107, 'G00203', 1, '10:10:00', '13:22:00', 'regular', 'active', datetime('now'), datetime('now')),
(108, 'G00301', 2, '13:15:00', '17:25:00', 'regular', 'active', datetime('now'), datetime('now'));

-- 6. 导入交路票数据 (drive_ticket.json) - 前24条记录
INSERT INTO drive_ticket (ticket_id, crossing_road_id, start_station_id, end_station_id, departure_time, arrival_time, seat_type_id, price, status, created_at, updated_at) VALUES
(1, 1, 1, 4, '06:00:00', '06:15:00', 1, 4.00, 'sold', datetime('now'), datetime('now')),
(2, 1, 1, 4, '06:10:00', '06:28:00', 1, 4.00, 'sold', datetime('now'), datetime('now')),
(3, 1, 4, 15, '06:15:00', '07:10:00', 1, 3.50, 'sold', datetime('now'), datetime('now')),
(4, 1, 4, 15, '06:28:00', '07:34:00', 1, 3.50, 'sold', datetime('now'), datetime('now')),
(5, 1, 15, 20, '07:10:00', '07:35:00', 1, 2.50, 'sold', datetime('now'), datetime('now')),
(6, 1, 15, 20, '07:34:00', '08:04:00', 1, 2.50, 'sold', datetime('now'), datetime('now')),
(7, 2, 20, 15, '08:00:00', '08:25:00', 1, 2.50, 'sold', datetime('now'), datetime('now')),
(8, 2, 20, 15, '08:11:00', '08:41:00', 1, 2.50, 'sold', datetime('now'), datetime('now')),
(9, 2, 15, 4, '08:25:00', '09:20:00', 1, 3.50, 'sold', datetime('now'), datetime('now')),
(10, 2, 15, 4, '08:41:00', '09:47:00', 1, 3.50, 'sold', datetime('now'), datetime('now')),
(11, 2, 4, 1, '09:20:00', '09:35:00', 1, 4.00, 'sold', datetime('now'), datetime('now')),
(12, 2, 4, 1, '09:47:00', '10:05:00', 1, 4.00, 'sold', datetime('now'), datetime('now')),
(13, 1, 1, 4, '10:00:00', '10:24:00', 1, 4.00, 'sold', datetime('now'), datetime('now')),
(14, 1, 1, 4, '10:10:00', '10:40:00', 1, 4.00, 'sold', datetime('now'), datetime('now')),
(15, 1, 4, 15, '10:24:00', '11:52:00', 1, 3.50, 'sold', datetime('now'), datetime('now')),
(16, 1, 4, 15, '10:40:00', '12:30:00', 1, 3.50, 'sold', datetime('now'), datetime('now')),
(17, 1, 15, 20, '11:52:00', '12:32:00', 1, 2.50, 'sold', datetime('now'), datetime('now')),
(18, 1, 15, 20, '12:30:00', '13:20:00', 1, 2.50, 'sold', datetime('now'), datetime('now')),
(19, 2, 20, 15, '13:00:00', '13:50:00', 1, 2.50, 'sold', datetime('now'), datetime('now')),
(20, 2, 20, 15, '13:15:00', '14:20:00', 1, 2.50, 'sold', datetime('now'), datetime('now')),
(21, 2, 15, 4, '13:50:00', '15:40:00', 1, 3.50, 'sold', datetime('now'), datetime('now')),
(22, 2, 15, 4, '14:20:00', '16:43:00', 1, 3.50, 'sold', datetime('now'), datetime('now')),
(23, 2, 4, 1, '15:40:00', '16:10:00', 1, 4.00, 'sold', datetime('now'), datetime('now')),
(24, 2, 4, 1, '16:43:00', '17:22:00', 1, 4.00, 'sold', datetime('now'), datetime('now'));

-- 7. 导入交路票夹数据 (drive_ticket_collect.json)
INSERT INTO drive_ticket_collect (collect_id, collect_name, ticket_ids, total_price, discount_rate, valid_from, valid_to, status, created_at, updated_at) VALUES
(1, '票夹1', '1,3,5,7', 16.50, 0.0, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
(2, '票夹2', '2,4,6', 10.00, 0.0, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
(3, '票夹3', '6,4,8,10,12,18', 18.00, 0.0, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
(4, '票夹4', '9,11,13,15', 15.00, 0.0, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
(5, '票夹5', '14,12,14,16', 15.00, 0.0, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
(6, '票夹6', '17', 2.50, 0.0, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
(7, '票夹7', '18', 2.50, 0.0, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
(8, '票夹8', '20,6,4,19,21', 16.00, 0.0, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
(9, '票夹9', '20,6,4,20,22', 16.00, 0.0, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
(10, '票夹10', '23', 4.00, 0.0, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now')),
(11, '票夹11', '24', 4.00, 0.0, '2024-01-01', '2024-12-31', 'active', datetime('now'), datetime('now'));

-- 8. 导入交路参数数据 (drive_ticket_param.json)
INSERT INTO drive_ticket_param (param_id, crossing_road_id, param_name, param_value, param_type, description, created_at, updated_at) VALUES
(1, 1, '最大开车时间', '02:00:00', 'time', '最大开车时间参数', datetime('now'), datetime('now')),
(2, 1, '早班接车时间', '04:00:00', 'time', '早班接车时间参数', datetime('now'), datetime('now')),
(3, 1, '早班退车时间', '11:00:00', 'time', '早班退车时间参数', datetime('now'), datetime('now')),
(4, 1, '白班接车时间', '11:00:00', 'time', '白班接车时间参数', datetime('now'), datetime('now')),
(5, 1, '白班退车时间', '16:00:00', 'time', '白班退车时间参数', datetime('now'), datetime('now')),
(6, 1, '夜班接车时间', '16:00:00', 'time', '夜班接车时间参数', datetime('now'), datetime('now')),
(7, 1, '夜班退车时间', '22:00:00', 'time', '夜班退车时间参数', datetime('now'), datetime('now')),
(8, 1, '强制回程站点', '五道口站', 'station', '强制回程站点参数', datetime('now'), datetime('now')),
(9, 1, '变更车次间隔时间', '00:10:00', 'time', '变更车次间隔时间参数', datetime('now'), datetime('now'));

-- 9. 导入便乘票数据 (drive_ride_ticket.json) - 前32条记录
INSERT INTO drive_ride_ticket (ride_ticket_id, employee_id, employee_name, start_station_id, end_station_id, ride_date, ride_time, purpose, status, created_at, updated_at) VALUES
(1, 'E001', '员工1', 1, 15, '2024-01-15', '06:00:00', '上班通勤', 'used', datetime('now'), datetime('now')),
(2, 'E002', '员工2', 1, 15, '2024-01-15', '06:10:00', '上班通勤', 'used', datetime('now'), datetime('now')),
(3, 'E003', '员工3', 4, 10, '2024-01-15', '06:15:00', '业务出行', 'used', datetime('now'), datetime('now')),
(4, 'E004', '员工4', 4, 20, '2024-01-15', '06:15:00', '业务出行', 'used', datetime('now'), datetime('now')),
(5, 'E005', '员工5', 4, 10, '2024-01-15', '06:28:00', '上班通勤', 'used', datetime('now'), datetime('now')),
(6, 'E006', '员工6', 4, 20, '2024-01-15', '06:28:00', '上班通勤', 'used', datetime('now'), datetime('now')),
(7, 'E007', '员工7', 10, 15, '2024-01-15', '06:45:00', '培训出行', 'used', datetime('now'), datetime('now')),
(8, 'E008', '员工8', 10, 15, '2024-01-15', '07:04:00', '培训出行', 'used', datetime('now'), datetime('now')),
(9, 'E009', '员工9', 20, 4, '2024-01-16', '08:00:00', '下班通勤', 'used', datetime('now'), datetime('now')),
(10, 'E010', '员工10', 20, 4, '2024-01-16', '08:11:00', '下班通勤', 'used', datetime('now'), datetime('now')),
(11, 'E011', '员工11', 15, 10, '2024-01-16', '08:25:00', '客户拜访', 'used', datetime('now'), datetime('now')),
(12, 'E012', '员工12', 15, 1, '2024-01-16', '08:25:00', '客户拜访', 'used', datetime('now'), datetime('now')),
(13, 'E013', '员工13', 15, 10, '2024-01-16', '08:41:00', '会议出行', 'used', datetime('now'), datetime('now')),
(14, 'E014', '员工14', 15, 1, '2024-01-16', '08:41:00', '会议出行', 'used', datetime('now'), datetime('now')),
(15, 'E015', '员工15', 10, 4, '2024-01-17', '08:50:00', '上班通勤', 'active', datetime('now'), datetime('now')),
(16, 'E016', '员工16', 10, 4, '2024-01-17', '09:11:00', '上班通勤', 'active', datetime('now'), datetime('now')),
(17, 'E017', '员工17', 1, 15, '2024-01-17', '10:00:00', '业务出行', 'active', datetime('now'), datetime('now')),
(18, 'E018', '员工18', 1, 15, '2024-01-17', '10:10:00', '业务出行', 'active', datetime('now'), datetime('now')),
(19, 'E019', '员工19', 4, 10, '2024-01-17', '10:24:00', '培训出行', 'active', datetime('now'), datetime('now')),
(20, 'E020', '员工20', 4, 20, '2024-01-17', '10:24:00', '培训出行', 'active', datetime('now'), datetime('now')),
(21, 'E021', '员工21', 4, 10, '2024-01-18', '10:40:00', '客户拜访', 'active', datetime('now'), datetime('now')),
(22, 'E022', '员工22', 4, 20, '2024-01-18', '10:40:00', '客户拜访', 'active', datetime('now'), datetime('now')),
(23, 'E023', '员工23', 10, 15, '2024-01-18', '11:12:00', '会议出行', 'active', datetime('now'), datetime('now')),
(24, 'E024', '员工24', 10, 15, '2024-01-18', '11:40:00', '会议出行', 'active', datetime('now'), datetime('now')),
(25, 'E025', '员工25', 20, 4, '2024-01-19', '13:00:00', '下班通勤', 'active', datetime('now'), datetime('now')),
(26, 'E026', '员工26', 20, 4, '2024-01-19', '13:15:00', '下班通勤', 'active', datetime('now'), datetime('now')),
(27, 'E027', '员工27', 15, 10, '2024-01-19', '13:50:00', '上班通勤', 'active', datetime('now'), datetime('now')),
(28, 'E028', '员工28', 15, 1, '2024-01-19', '13:50:00', '上班通勤', 'active', datetime('now'), datetime('now')),
(29, 'E029', '员工29', 15, 10, '2024-01-20', '14:20:00', '业务出行', 'active', datetime('now'), datetime('now')),
(30, 'E030', '员工30', 15, 1, '2024-01-20', '14:20:00', '业务出行', 'active', datetime('now'), datetime('now')),
(31, 'E031', '员工31', 10, 4, '2024-01-20', '14:40:00', '培训出行', 'active', datetime('now'), datetime('now')),
(32, 'E032', '员工32', 10, 4, '2024-01-20', '15:25:00', '培训出行', 'active', datetime('now'), datetime('now'));

-- 10. 导入列车时刻表明细数据 (cw_train_schedule_detail.json) - 前40条记录
INSERT INTO cw_train_schedule_detail (detail_id, schedule_id, station_id, arrival_time, departure_time, stop_duration_seconds, platform_number, created_at, updated_at) VALUES
(1, 101, 1, '06:00:00', '06:01:00', 60, '1', datetime('now'), datetime('now')),
(2, 101, 2, '06:05:00', '06:06:00', 60, '1', datetime('now'), datetime('now')),
(3, 101, 3, '06:10:00', '06:11:00', 60, '1', datetime('now'), datetime('now')),
(4, 101, 4, '06:15:00', '06:16:00', 60, '1', datetime('now'), datetime('now')),
(5, 101, 5, '06:20:00', '06:21:00', 60, '1', datetime('now'), datetime('now')),
(6, 101, 6, '06:25:00', '06:26:00', 60, '1', datetime('now'), datetime('now')),
(7, 101, 7, '06:30:00', '06:31:00', 60, '1', datetime('now'), datetime('now')),
(8, 101, 8, '06:35:00', '06:36:00', 60, '1', datetime('now'), datetime('now')),
(9, 101, 9, '06:40:00', '06:41:00', 60, '1', datetime('now'), datetime('now')),
(10, 101, 10, '06:45:00', '06:46:00', 60, '1', datetime('now'), datetime('now')),
(11, 101, 11, '06:50:00', '06:51:00', 60, '1', datetime('now'), datetime('now')),
(12, 101, 12, '06:55:00', '06:56:00', 60, '1', datetime('now'), datetime('now')),
(13, 101, 13, '07:00:00', '07:01:00', 60, '1', datetime('now'), datetime('now')),
(14, 101, 14, '07:05:00', '07:06:00', 60, '1', datetime('now'), datetime('now')),
(15, 101, 15, '07:10:00', '07:11:00', 60, '1', datetime('now'), datetime('now')),
(16, 101, 16, '07:15:00', '07:16:00', 60, '1', datetime('now'), datetime('now')),
(17, 101, 17, '07:20:00', '07:21:00', 60, '1', datetime('now'), datetime('now')),
(18, 101, 18, '07:25:00', '07:26:00', 60, '1', datetime('now'), datetime('now')),
(19, 101, 19, '07:30:00', '07:31:00', 60, '1', datetime('now'), datetime('now')),
(20, 101, 20, '07:35:00', '07:36:00', 60, '1', datetime('now'), datetime('now')),
(21, 102, 20, '08:00:00', '08:01:00', 60, '2', datetime('now'), datetime('now')),
(22, 102, 19, '08:05:00', '08:06:00', 60, '2', datetime('now'), datetime('now')),
(23, 102, 18, '08:10:00', '08:11:00', 60, '2', datetime('now'), datetime('now')),
(24, 102, 17, '08:15:00', '08:16:00', 60, '2', datetime('now'), datetime('now')),
(25, 102, 16, '08:20:00', '08:21:00', 60, '2', datetime('now'), datetime('now')),
(26, 102, 15, '08:25:00', '08:26:00', 60, '2', datetime('now'), datetime('now')),
(27, 102, 14, '08:30:00', '08:31:00', 60, '2', datetime('now'), datetime('now')),
(28, 102, 13, '08:35:00', '08:36:00', 60, '2', datetime('now'), datetime('now')),
(29, 102, 12, '08:40:00', '08:41:00', 60, '2', datetime('now'), datetime('now')),
(30, 102, 11, '08:45:00', '08:46:00', 60, '2', datetime('now'), datetime('now')),
(31, 102, 10, '08:50:00', '08:51:00', 60, '2', datetime('now'), datetime('now')),
(32, 102, 9, '08:55:00', '08:56:00', 60, '2', datetime('now'), datetime('now')),
(33, 102, 8, '09:00:00', '09:01:00', 60, '2', datetime('now'), datetime('now')),
(34, 102, 7, '09:05:00', '09:06:00', 60, '2', datetime('now'), datetime('now')),
(35, 102, 6, '09:10:00', '09:11:00', 60, '2', datetime('now'), datetime('now')),
(36, 102, 5, '09:15:00', '09:16:00', 60, '2', datetime('now'), datetime('now')),
(37, 102, 4, '09:20:00', '09:21:00', 60, '2', datetime('now'), datetime('now')),
(38, 102, 3, '09:25:00', '09:26:00', 60, '2', datetime('now'), datetime('now')),
(39, 102, 2, '09:30:00', '09:31:00', 60, '2', datetime('now'), datetime('now')),
(40, 102, 1, '09:35:00', '09:36:00', 60, '2', datetime('now'), datetime('now'));