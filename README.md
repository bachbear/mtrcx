# 地铁交路管理系统

这是一个基于Node.js和Express的轻量级地铁交路管理系统，使用本地JSON文件模拟数据库。

## 项目结构

```
project/
├── backend/           # 后端代码目录
│   └── server.js      # 后端服务器入口文件
├── data/              # JSON数据文件目录
├── public/            # 前端静态文件目录
├── package.json       # 项目配置文件
└── README.md          # 项目说明文档
```

## 安装和运行

1. 确保已安装Node.js
2. 克隆或下载本项目
3. 在项目根目录下运行以下命令安装依赖：
   ```
   npm install
   ```
4. 启动服务器：
   ```
   npm start
   ```
   或在开发模式下启动（支持热重载）：
   ```
   npm run dev
   ```
5. 在浏览器中访问 `http://localhost:3334`

## 功能模块

1. **交路管理** - 管理地铁交路信息
2. **线路管理** - 管理地铁线路信息
3. **列车时刻表管理** - 管理列车时刻表信息

## 数据文件

所有数据都存储在 `data/` 目录下的JSON文件中：
- `cw_crossing_road.json` - 交路数据
- `cw_line.json` - 线路数据
- `cw_train_schedule.json` - 列车时刻表数据
- `cw_seat_type.json` - 座位类型数据
- `cw_station.json` - 车站数据

## 技术栈

- 前端：HTML5 + CSS3 + JavaScript
- 后端：Node.js + Express
- 数据存储：本地JSON文件