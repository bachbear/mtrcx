-- Migration: 0001_initial_schema.sql
-- Description: 创建地铁交路管理系统的初始数据库表结构 (从本地JSON数据迁移)
-- Created: 2025-09-13

-- 1. 线路表
CREATE TABLE cw_line (
    line_id INTEGER PRIMARY KEY,
    line_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 车站表
CREATE TABLE cw_station (
    station_id INTEGER PRIMARY KEY,
    station_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 座位类型表
CREATE TABLE cw_seat_type (
    seat_type_id INTEGER PRIMARY KEY,
    seat_type_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 逻辑车站表
CREATE TABLE cw_logic_station (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_id INTEGER NOT NULL,
    line_id INTEGER NOT NULL,
    station_type INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES cw_station(station_id),
    FOREIGN KEY (line_id) REFERENCES cw_line(line_id)
);

-- 5. 交路表
CREATE TABLE cw_crossing_road (
    crossing_road_id INTEGER PRIMARY KEY,
    crossing_road_name TEXT NOT NULL,
    line_id INTEGER NOT NULL,
    direction INTEGER NOT NULL,
    begin_station_id INTEGER NOT NULL,
    end_station_id INTEGER NOT NULL,
    begin_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (line_id) REFERENCES cw_line(line_id),
    FOREIGN KEY (begin_station_id) REFERENCES cw_station(station_id),
    FOREIGN KEY (end_station_id) REFERENCES cw_station(station_id)
);

-- 6. 列车时刻表
CREATE TABLE cw_train_schedule (
    train_schedule_id INTEGER PRIMARY KEY,
    line_id INTEGER NOT NULL,
    train_id INTEGER NOT NULL,
    train_name TEXT NOT NULL,
    service_num TEXT,
    direction INTEGER NOT NULL,
    begin_time TIME NOT NULL,
    end_time TIME NOT NULL,
    station_from TEXT NOT NULL,
    station_to TEXT NOT NULL,
    service_sequence INTEGER,
    kilometers REAL,
    work_hours REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (line_id) REFERENCES cw_line(line_id)
);

-- 7. 列车时刻表明细
CREATE TABLE cw_train_schedule_detail (
    detail_id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_schedule_id INTEGER NOT NULL,
    station_id INTEGER NOT NULL,
    arrival_time TIME,
    departure_time TIME,
    stop_time INTEGER DEFAULT 0,
    distance REAL DEFAULT 0,
    sequence_order INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (train_schedule_id) REFERENCES cw_train_schedule(train_schedule_id),
    FOREIGN KEY (station_id) REFERENCES cw_station(station_id)
);

-- 8. 交路票表
CREATE TABLE drive_ticket (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_id INTEGER NOT NULL,
    train_name TEXT NOT NULL,
    start_station TEXT NOT NULL,
    end_station TEXT NOT NULL,
    pickup_time TIME NOT NULL,
    dropoff_time TIME NOT NULL,
    is_sold BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. 交路票夹表
CREATE TABLE drive_ticket_collect (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collect_id INTEGER NOT NULL,
    ticket_chain TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. 交路参数表
CREATE TABLE drive_ticket_param (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    param_name TEXT NOT NULL,
    param_value TEXT NOT NULL,
    param_type TEXT NOT NULL,
    param_desc TEXT,
    is_checked BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. 便乘票表
CREATE TABLE drive_ride_ticket (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ride_id INTEGER NOT NULL,
    train_name TEXT NOT NULL,
    start_station TEXT NOT NULL,
    end_station TEXT NOT NULL,
    pickup_time TIME NOT NULL,
    dropoff_time TIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 12. 用户表
CREATE TABLE cw_user (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    status INTEGER DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 13. 用户会话表
CREATE TABLE cw_user_session (
    session_id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES cw_user(user_id)
);

-- 14. 系统配置表
CREATE TABLE cw_system_config (
    config_id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key TEXT NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    config_desc TEXT,
    config_type TEXT DEFAULT 'string',
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 15. 操作日志表
CREATE TABLE cw_operation_log (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    operation_type TEXT NOT NULL,
    operation_desc TEXT,
    table_name TEXT,
    record_id INTEGER,
    old_data TEXT,
    new_data TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES cw_user(user_id)
);

-- 16. 列车信息表
CREATE TABLE cw_train (
    train_id INTEGER PRIMARY KEY,
    train_number TEXT NOT NULL UNIQUE,
    train_type TEXT NOT NULL,
    capacity INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    manufacturer TEXT,
    manufacture_date DATE,
    last_maintenance DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 17. 车厢信息表
CREATE TABLE cw_carriage (
    carriage_id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_id INTEGER NOT NULL,
    carriage_number INTEGER NOT NULL,
    carriage_type TEXT NOT NULL,
    seat_count INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (train_id) REFERENCES cw_train(train_id),
    UNIQUE(train_id, carriage_number)
);

-- 18. 座位信息表
CREATE TABLE cw_seat (
    seat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    carriage_id INTEGER NOT NULL,
    seat_number TEXT NOT NULL,
    seat_type_id INTEGER NOT NULL,
    row_number INTEGER,
    column_number INTEGER,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (carriage_id) REFERENCES cw_carriage(carriage_id),
    FOREIGN KEY (seat_type_id) REFERENCES cw_seat_type(seat_type_id),
    UNIQUE(carriage_id, seat_number)
);

-- 19. 线路站点关联表
CREATE TABLE cw_line_station (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    line_id INTEGER NOT NULL,
    station_id INTEGER NOT NULL,
    sequence_order INTEGER NOT NULL,
    distance_from_start REAL DEFAULT 0,
    travel_time INTEGER DEFAULT 0,
    is_terminal BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (line_id) REFERENCES cw_line(line_id),
    FOREIGN KEY (station_id) REFERENCES cw_station(station_id),
    UNIQUE(line_id, station_id),
    UNIQUE(line_id, sequence_order)
);

-- 20. 票价表
CREATE TABLE cw_fare (
    fare_id INTEGER PRIMARY KEY AUTOINCREMENT,
    line_id INTEGER NOT NULL,
    from_station_id INTEGER NOT NULL,
    to_station_id INTEGER NOT NULL,
    distance REAL NOT NULL,
    base_fare DECIMAL(10,2) NOT NULL,
    peak_fare DECIMAL(10,2),
    off_peak_fare DECIMAL(10,2),
    effective_date DATE NOT NULL,
    expiry_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (line_id) REFERENCES cw_line(line_id),
    FOREIGN KEY (from_station_id) REFERENCES cw_station(station_id),
    FOREIGN KEY (to_station_id) REFERENCES cw_station(station_id)
);

-- 创建索引以提升查询性能
-- 逻辑车站表索引
CREATE INDEX idx_logic_station_line ON cw_logic_station(line_id);
CREATE INDEX idx_logic_station_station ON cw_logic_station(station_id);

-- 交路表索引
CREATE INDEX idx_crossing_road_line ON cw_crossing_road(line_id);
CREATE INDEX idx_crossing_road_status ON cw_crossing_road(status);
CREATE INDEX idx_crossing_road_time ON cw_crossing_road(begin_time, end_time);

-- 列车时刻表索引
CREATE INDEX idx_train_schedule_line ON cw_train_schedule(line_id);
CREATE INDEX idx_train_schedule_train ON cw_train_schedule(train_id);
CREATE INDEX idx_train_schedule_time ON cw_train_schedule(begin_time, end_time);

-- 列车时刻表明细索引
CREATE INDEX idx_train_schedule_detail_schedule ON cw_train_schedule_detail(train_schedule_id);
CREATE INDEX idx_train_schedule_detail_station ON cw_train_schedule_detail(station_id);
CREATE INDEX idx_train_schedule_detail_sequence ON cw_train_schedule_detail(sequence_order);

-- 交路票表索引
CREATE INDEX idx_drive_ticket_train ON drive_ticket(train_name);
CREATE INDEX idx_drive_ticket_time ON drive_ticket(pickup_time, dropoff_time);
CREATE INDEX idx_drive_ticket_sold ON drive_ticket(is_sold);

-- 用户表索引
CREATE INDEX idx_user_username ON cw_user(username);
CREATE INDEX idx_user_email ON cw_user(email);
CREATE INDEX idx_user_status ON cw_user(status);

-- 用户会话表索引
CREATE INDEX idx_user_session_user ON cw_user_session(user_id);
CREATE INDEX idx_user_session_expires ON cw_user_session(expires_at);

-- 操作日志表索引
CREATE INDEX idx_operation_log_user ON cw_operation_log(user_id);
CREATE INDEX idx_operation_log_type ON cw_operation_log(operation_type);
CREATE INDEX idx_operation_log_table ON cw_operation_log(table_name);
CREATE INDEX idx_operation_log_time ON cw_operation_log(created_at);

-- 列车信息表索引
CREATE INDEX idx_train_number ON cw_train(train_number);
CREATE INDEX idx_train_status ON cw_train(status);

-- 车厢信息表索引
CREATE INDEX idx_carriage_train ON cw_carriage(train_id);
CREATE INDEX idx_carriage_status ON cw_carriage(status);

-- 座位信息表索引
CREATE INDEX idx_seat_carriage ON cw_seat(carriage_id);
CREATE INDEX idx_seat_type ON cw_seat(seat_type_id);
CREATE INDEX idx_seat_status ON cw_seat(status);

-- 线路站点关联表索引
CREATE INDEX idx_line_station_line ON cw_line_station(line_id);
CREATE INDEX idx_line_station_station ON cw_line_station(station_id);
CREATE INDEX idx_line_station_sequence ON cw_line_station(line_id, sequence_order);

-- 票价表索引
CREATE INDEX idx_fare_line ON cw_fare(line_id);
CREATE INDEX idx_fare_stations ON cw_fare(from_station_id, to_station_id);
CREATE INDEX idx_fare_effective ON cw_fare(effective_date, expiry_date);

-- 插入基础数据
-- 座位类型基础数据
INSERT INTO cw_seat_type (seat_type_id, seat_type_name) VALUES
(1, '普通座'),
(2, '商务座'),
(3, '一等座'),
(4, '二等座'),
(5, '站立区');

-- 系统配置基础数据
INSERT INTO cw_system_config (config_key, config_value, config_desc, config_type) VALUES
('system_name', '地铁交路管理系统', '系统名称', 'string'),
('version', '1.0.0', '系统版本', 'string'),
('max_login_attempts', '5', '最大登录尝试次数', 'integer'),
('session_timeout', '3600', '会话超时时间(秒)', 'integer'),
('default_page_size', '20', '默认分页大小', 'integer'),
('maintenance_mode', 'false', '维护模式', 'boolean');

-- 默认管理员用户 (密码: admin123，实际使用时应该使用加密后的密码)
INSERT INTO cw_user (username, password_hash, email, role, status) VALUES
('admin', '$2b$10$example_hash_here', 'admin@metro.com', 'admin', 1);