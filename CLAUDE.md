# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a subway route management system designed to manage subway routes, lines, and train schedules. The project uses a web frontend with a lightweight backend that reads from local JSON files simulating database structures.

## Project Structure

```
project/
├── backend/           # 后端代码目录
│   └── server.js      # 后端服务器入口文件
├── data/              # JSON数据文件目录
│   ├── cw_crossing_road.json      # 交路数据
│   ├── cw_line.json               # 线路数据
│   ├── cw_train_schedule.json     # 列车时刻表数据
│   ├── cw_train_schedule_detail.json  # 列车时刻表明细数据
│   ├── cw_seat_type.json          # 座位类型数据
│   ├── cw_station.json            # 车站数据
│   ├── cw_logic_station.json      # 逻辑车站数据
│   ├── drive_ticket.json          # 交路票数据
│   └── drive_ticket_param.json    # 交路参数数据
├── public/            # 前端静态文件目录
│   └── index.html     # 主页面文件
├── generate_drive_tickets.js  # 交路票生成脚本
├── package.json       # 项目配置文件
└── README.md          # 项目说明文档
```

## Development Commands

- `npm install` - 安装项目依赖
- `npm start` - 启动服务器 (端口3335)
- `npm run dev` - 开发模式启动服务器（支持热重载）
- `node generate_drive_tickets.js` - 手动生成交路票数据
- `node generate_drive_ticket_collect.js` - 手动生成交路票夹数据

## Database Structure

The system consists of several key modules:

1. **Route Management Module**:
   - `cw_crossing_road`: Main route table
   - `cw_crossing_road_detail`: Route details table
   - `cw_seat_type`: Seat type table (for distinguishing route types: driving position, riding position)
   - `drive_ticket`: Drive ticket table (generated route tickets)
   - `drive_ticket_param`: Drive ticket parameters table

2. **Line Management Module**:
   - `cw_line`: Line table
   - `cw_station`: Station table
   - `cw_logic_station`: Logical station table (station types: receiving station, returning station, attendance station, off-duty station)

3. **Train Schedule Module**:
   - `cw_train_schedule`: Train schedule table
   - `cw_train_schedule_detail`: Train schedule details table

## Project Design Goals

1. Implement three main functions: route management, line management, and train schedule management
2. Route management: Automatically generate route data through backend business logic and display information on web pages
3. Line management: Display line-related information from local JSON files on web pages
4. Train schedule management: Display train schedule information from local JSON files on web pages

## Development Approach

- Web frontend implementation
- Lightweight backend business logic
- Local JSON files simulate database structure and records
- Backend reads and processes data from JSON files
- Data displayed on web frontend pages
- 本目录的项目请用中文作为工作语言，文档编写也用中文注释。

## API Endpoints

- GET `/api/crossing-roads` - 获取所有交路信息
- PUT `/api/crossing-roads` - 更新所有交路信息
- GET `/api/lines` - 获取所有线路信息
- GET `/api/train-schedules` - 获取所有列车时刻表信息
- GET `/api/train-schedule-details` - 获取所有列车时刻表明细信息
- GET `/api/seat-types` - 获取所有座位类型信息
- GET `/api/stations` - 获取所有车站信息
- GET `/api/logic-stations` - 获取所有逻辑车站信息
- GET `/api/drive-tickets` - 获取所有交路票信息
- GET `/api/drive-ticket-params` - 获取所有交路参数信息
- PUT `/api/drive-ticket-params` - 更新所有交路参数信息
- POST `/api/generate-drive-tickets` - 生成和更新交路票记录

## Core Business Logic

The system implements a "drive ticket" algorithm that segments train routes based on station properties (currently only considering duty stations where drivers work and start/end their shifts). Each segment represents a drive ticket, which records a driver's journey on a specific train route between two duty stations.

Key components:
1. Drive Ticket Generation: Creates tickets by segmenting train routes at duty stations
2. Drive Ticket Pool: Collection of all generated drive tickets
3. Drive Ticket Chain: Business logic for selecting groups of tickets based on scheduling rules