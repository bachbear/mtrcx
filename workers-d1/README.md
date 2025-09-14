# 地铁交路管理系统 - Cloudflare Workers + D1版本

这是从本地Node.js + JSON文件架构迁移到Cloudflare Workers + D1数据库的地铁交路管理系统。

## 项目结构

```
workers-d1/
├── src/
│   └── index.js          # Cloudflare Workers主入口
├── migrations/
│   ├── 0001_initial_schema.sql    # 数据库表结构
│   ├── 0002_insert_data.sql       # 基础数据插入
│   └── 0003_migrate_data.sql      # 从JSON迁移的数据
├── scripts/
│   ├── migrate-data.js   # 数据迁移脚本
│   └── test-api.js       # API测试脚本
├── wrangler.toml         # Cloudflare Workers配置
├── package.json
└── README.md
```

## 功能特性

### 已迁移的API端点

- **GET /api/lines** - 获取线路信息
- **GET /api/stations** - 获取车站信息
- **GET /api/seat-types** - 获取座位类型信息
- **GET /api/logic-stations** - 获取逻辑车站信息
- **GET /api/crossing-roads** - 获取交路信息
- **PUT /api/crossing-roads** - 更新交路信息
- **GET /api/train-schedules** - 获取列车时刻表
- **GET /api/train-schedule-details** - 获取列车时刻表明细
- **GET /api/drive-tickets** - 获取交路票信息
- **GET /api/drive-ticket-collect** - 获取交路票夹信息
- **GET /api/drive-ticket-params** - 获取交路参数信息
- **PUT /api/drive-ticket-params** - 更新交路参数信息
- **GET /api/ride-tickets** - 获取便乘票信息
- **POST /api/generate-drive-tickets** - 生成交路票
- **POST /api/generate-drive-ticket-collect** - 生成交路票夹
- **POST /api/generate-ride-tickets** - 生成便乘票

### 数据库表结构

1. **cw_line** - 线路表
2. **cw_station** - 车站表
3. **cw_seat_type** - 座位类型表
4. **cw_logic_station** - 逻辑车站表
5. **cw_crossing_road** - 交路表
6. **cw_train_schedule** - 列车时刻表
7. **cw_train_schedule_detail** - 列车时刻表明细
8. **drive_ticket** - 交路票表
9. **drive_ticket_collect** - 交路票夹表
10. **drive_ticket_param** - 交路参数表
11. **drive_ride_ticket** - 便乘票表

## 部署指南

### 1. 环境准备

```bash
# 安装Wrangler CLI
npm install -g wrangler

# 登录Cloudflare
wrangler auth login
```

### 2. 创建D1数据库

```bash
cd workers-d1
wrangler d1 create subway-management-db
```

复制返回的数据库ID到 `wrangler.toml` 文件中的 `database_id` 字段。

### 3. 运行数据库迁移

```bash
# 生成数据迁移SQL
npm run generate-migration

# 应用数据库迁移（本地测试）
npm run migrate:local

# 应用数据库迁移（生产环境）
npm run migrate:remote
```

### 4. 本地开发

```bash
# 启动本地开发服务器
npm run dev
```

访问 http://localhost:8787 测试API

### 5. 部署到生产环境

```bash
npm run deploy
```

## 测试

### 运行API测试

```bash
# 确保本地开发服务器正在运行
npm run dev

# 在另一个终端运行测试
npm test
```

### 手动测试API

```bash
# 测试获取线路信息
curl http://localhost:8787/api/lines

# 测试获取车站信息
curl http://localhost:8787/api/stations

# 测试生成交路票
curl -X POST http://localhost:8787/api/generate-drive-tickets
```

## 迁移说明

### 从原系统迁移的数据

- ✅ 线路数据 (cw_line.json)
- ✅ 车站数据 (cw_station.json)
- ✅ 座位类型数据 (cw_seat_type.json)
- ✅ 交路数据 (cw_crossing_road.json)
- ✅ 列车时刻表数据 (cw_train_schedule.json)
- ✅ 交路票数据 (drive_ticket.json)
- ✅ 交路票夹数据 (drive_ticket_collect.json)
- ✅ 便乘票数据 (drive_ride_ticket.json)
- ✅ 列车时刻表明细数据 (cw_train_schedule_detail.json)

### 待实现的功能

- 🔄 交路票生成算法迁移
- 🔄 交路票夹生成算法迁移
- 🔄 便乘票生成算法迁移
- 🔄 复杂业务逻辑迁移

## 性能优化

- 数据库索引已优化
- CORS支持已配置
- 错误处理已完善
- 响应格式统一

## 注意事项

1. **数据库ID配置**: 确保在 `wrangler.toml` 中正确配置数据库ID
2. **环境变量**: 根据需要在Cloudflare Workers控制台配置环境变量
3. **域名绑定**: 生产环境可以绑定自定义域名
4. **监控**: 建议配置Cloudflare Analytics监控API使用情况

## 故障排除

### 常见问题

1. **数据库连接失败**: 检查 `wrangler.toml` 中的数据库配置
2. **迁移失败**: 确保数据库已创建且迁移文件格式正确
3. **API返回404**: 检查路由配置和部署状态
4. **CORS错误**: 已配置CORS头，如有问题检查请求格式

### 调试命令

```bash
# 查看数据库信息
wrangler d1 info subway-management-db

# 查看部署日志
wrangler tail

# 本地调试
wrangler dev --local