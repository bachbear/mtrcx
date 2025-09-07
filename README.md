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
- `cw_train_schedule_detail.json` - 列车时刻表明细数据
- `cw_seat_type.json` - 座位类型数据
- `cw_station.json` - 车站数据
- `cw_logic_station.json` - 逻辑车站数据
- `drive_ticket.json` - 交路票数据
- `drive_ticket_collect.json` - 交路票夹数据
- `drive_ticket_param.json` - 交路参数数据

## Cloudflare Worker数据同步

本项目包含脚本用于将本地JSON数据同步到Cloudflare Worker KV存储中：

1. 使用Wrangler批量上传（推荐）：
   ```
   npx wrangler kv bulk put bulk_upload.json --namespace-id 01b950f1bbeb414c979fd12500f0ffda
   ```

2. 或者使用Node.js脚本上传：
   ```
   npm run upload-data-wrangler
   ```

注意：请确保您已安装Wrangler并具有适当的权限来访问KV命名空间。您需要一个具有适当权限的Cloudflare API令牌。

## 技术栈

- 前端：HTML5 + CSS3 + JavaScript
- 后端：Node.js + Express
- 数据存储：本地JSON文件 / Cloudflare KV