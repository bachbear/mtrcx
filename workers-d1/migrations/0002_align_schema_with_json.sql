-- Migration: 0002_align_schema_with_json.sql
-- Description: Align table schemas with the local JSON data structure.
-- Created: 2025-09-13

-- Drop existing tables that have incorrect schema
DROP TABLE IF EXISTS cw_train_schedule_detail;
DROP TABLE IF EXISTS cw_train_schedule;

-- Recreate cw_train_schedule with schema matching cw_train_schedule.json
CREATE TABLE cw_train_schedule (
    train_schedule_id INTEGER PRIMARY KEY,
    line_id INTEGER NOT NULL,
    crossing_road_id INTEGER,
    direction INTEGER NOT NULL,
    train_id INTEGER,
    train_name TEXT,
    start_station_id INTEGER,
    end_station_id INTEGER,
    start_time TIME,
    end_time TIME,
    status INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (line_id) REFERENCES cw_line(line_id),
    FOREIGN KEY (crossing_road_id) REFERENCES cw_crossing_road(crossing_road_id),
    FOREIGN KEY (start_station_id) REFERENCES cw_station(station_id),
    FOREIGN KEY (end_station_id) REFERENCES cw_station(station_id)
);

-- Recreate cw_train_schedule_detail with schema matching cw_train_schedule_detail.json
CREATE TABLE cw_train_schedule_detail (
    train_schedule_detail_id INTEGER PRIMARY KEY,
    line_id INTEGER NOT NULL,
    train_schedule_id INTEGER NOT NULL,
    station_id INTEGER NOT NULL,
    arrive_time TIME,
    depart_time TIME,
    stop_time INTEGER,
    run_time INTEGER,
    stop_type INTEGER,
    direction INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (line_id) REFERENCES cw_line(line_id),
    FOREIGN KEY (train_schedule_id) REFERENCES cw_train_schedule(train_schedule_id),
    FOREIGN KEY (station_id) REFERENCES cw_station(station_id)
);

-- Re-add indexes for the new tables
CREATE INDEX idx_train_schedule_line_2 ON cw_train_schedule(line_id);
CREATE INDEX idx_train_schedule_train_2 ON cw_train_schedule(train_id);
CREATE INDEX idx_train_schedule_time_2 ON cw_train_schedule(start_time, end_time);

CREATE INDEX idx_train_schedule_detail_schedule_2 ON cw_train_schedule_detail(train_schedule_id);
CREATE INDEX idx_train_schedule_detail_station_2 ON cw_train_schedule_detail(station_id);