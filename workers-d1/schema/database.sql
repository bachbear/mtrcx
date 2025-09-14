-- 地铁交路管理系统 D1 数据库表结构
-- 创建时间: 2025-09-13

-- 1. 线路表
CREATE TABLE IF NOT EXISTS cw_line (
    line_id INTEGER PRIMARY KEY,
    line_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 车站表
CREATE TABLE IF NOT EXISTS cw_station (
    station_id INTEGER PRIMARY KEY,
    station_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 座位类型表
CREATE TABLE IF NOT EXISTS cw_seat_type (
    seat_type_id INTEGER PRIMARY KEY,
    seat_type_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 逻辑车站表
CREATE TABLE IF NOT EXISTS cw_logic_station (
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
CREATE TABLE IF NOT EXISTS cw_crossing_road (
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
CREATE TABLE IF NOT EXISTS cw_train_schedule (
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
CREATE TABLE IF NOT EXISTS cw_train_schedule_detail (
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
CREATE TABLE IF NOT EXISTS drive_ticket (
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
CREATE TABLE IF NOT EXISTS drive_ticket_collect (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collect_id INTEGER NOT NULL,
    ticket_chain TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. 交路参数表
CREATE TABLE IF NOT EXISTS drive_ticket_param (
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
CREATE TABLE IF NOT EXISTS drive_ride_ticket (
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

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_crossing_road_line_id ON cw_crossing_road(line_id);
CREATE INDEX IF NOT EXISTS idx_crossing_road_direction ON cw_crossing_road(direction);
CREATE INDEX IF NOT EXISTS idx_train_schedule_line_id ON cw_train_schedule(line_id);
CREATE INDEX IF NOT EXISTS idx_train_schedule_train_name ON cw_train_schedule(train_name);
CREATE INDEX IF NOT EXISTS idx_train_schedule_detail_schedule_id ON cw_train_schedule_detail(train_schedule_id);
CREATE INDEX IF NOT EXISTS idx_drive_ticket_train_name ON drive_ticket(train_name);
CREATE INDEX IF NOT EXISTS idx_drive_ticket_pickup_time ON drive_ticket(pickup_time);
CREATE INDEX IF NOT EXISTS idx_drive_ride_ticket_train_name ON drive_ride_ticket(train_name);
CREATE INDEX IF NOT EXISTS idx_logic_station_line_station ON cw_logic_station(line_id, station_id);

-- 创建触发器以自动更新 updated_at 字段
CREATE TRIGGER IF NOT EXISTS update_cw_line_updated_at 
    AFTER UPDATE ON cw_line
    BEGIN
        UPDATE cw_line SET updated_at = CURRENT_TIMESTAMP WHERE line_id = NEW.line_id;
    END;

CREATE TRIGGER IF NOT EXISTS update_cw_station_updated_at 
    AFTER UPDATE ON cw_station
    BEGIN
        UPDATE cw_station SET updated_at = CURRENT_TIMESTAMP WHERE station_id = NEW.station_id;
    END;

CREATE TRIGGER IF NOT EXISTS update_cw_crossing_road_updated_at 
    AFTER UPDATE ON cw_crossing_road
    BEGIN
        UPDATE cw_crossing_road SET updated_at = CURRENT_TIMESTAMP WHERE crossing_road_id = NEW.crossing_road_id;
    END;

CREATE TRIGGER IF NOT EXISTS update_drive_ticket_param_updated_at 
    AFTER UPDATE ON drive_ticket_param
    BEGIN
        UPDATE drive_ticket_param SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;