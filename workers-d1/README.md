# 地铁交路管理系统 - Cloudflare Workers + D1版本

这是一个基于Cloudflare Workers和D1数据库的现代化地铁交路管理系统，提供高性能、全球分布式的API服务。系统已完整实现便乘票生成算法，支持复杂的业务逻辑。

## ✨ 项目特性

### 🚀 核心功能
- **交路管理**: 完整的交路信息CRUD操作
- **便乘票生成**: 基于交路生成逻辑设计的智能便乘票生成算法
- **列车时刻表**: 动态列车时刻表和明细管理
- **线路车站**: 完整的线路和车站信息管理
- **交路票系统**: 智能交路票生成和管理

### 🎯 已完成功能
- ✅ **便乘票生成算法**: 严格按照"交路生成逻辑设计.md"第4部分实现
- ✅ **出勤便乘票**: 西直门站到多个目的地的便乘票生成
- ✅ **退勤便乘票**: 天安门西站到宣武门站、西直门站的便乘票生成
- ✅ **D1数据库集成**: 完整的数据存储和查询支持
- ✅ **RESTful API**: 完整的API端点支持
- ✅ **数据迁移**: 从JSON文件到D1数据库的完整迁移
- ✅ **调试功能**: 详细的便乘票生成调试日志

## 📁 项目结构

```
workers-d1/
├── src/
│   ├── index.js                 # Cloudflare Workers主入口
│   ├── logic/
│   │   ├── ride_tickets_correct.js    # ✅ 修正的便乘票生成逻辑
│   │   ├── drive_tickets.js           # 交路票生成逻辑
│   │   └── drive_ticket_collect.js    # 交路票夹生成逻辑
│   ├── routes/                  # API路由模块
│   ├── models/                  # 数据模型模块
│   ├── utils/                   # 工具函数模块
│   └── missing_data.js          # 缺失数据修复脚本
├── public/                      # 静态文件
├── scripts/                     # 数据库脚本和工具
├── migrations/                  # 数据库迁移文件
├── tests/                       # 测试文件
├── docs/                        # 文档目录
├── wrangler.toml               # Cloudflare Workers配置
├── package.json                # 项目配置
├── README.md                   # 项目说明
├── MIGRATION_GUIDE.md          # 迁移指南
├── DEPLOYMENT_CHECKLIST.md     # 部署检查清单
└── MIGRATION_SUCCESS_REPORT.md # 迁移成功报告
```

## 🛠️ 技术栈

- **运行时**: Cloudflare Workers
- **数据库**: Cloudflare D1 (SQLite-based)
- **框架**: 原生JavaScript (ES6+)
- **部署**: Wrangler CLI
- **测试**: 自定义测试脚本

## 📊 数据库表结构

### 核心业务表
1. **cw_line** - 线路信息表
2. **cw_station** - 车站信息表
3. **cw_logic_station** - 逻辑车站表
   - station_type: 1=出勤站点, 2=退勤站点, 3=接车站点, 4=送车站点
4. **cw_crossing_road** - 交路信息表
5. **cw_train_schedule** - 列车时刻表
6. **cw_train_schedule_detail** - 列车时刻表明细

### 业务数据表
7. **cw_seat_type** - 座位类型表
8. **drive_ticket** - 交路票表
9. **drive_ticket_collect** - 交路票夹表
10. **drive_ticket_param** - 交路参数表
11. **drive_ride_ticket** - 便乘票表

## 🔌 API端点

### 基础数据API
- `GET /api/lines` - 获取线路信息
- `GET /api/stations` - 获取车站信息
- `GET /api/logic-stations` - 获取逻辑车站信息
- `GET /api/seat-types` - 获取座位类型信息

### 交路管理API
- `GET /api/crossing-roads` - 获取交路信息
- `PUT /api/crossing-roads` - 更新交路信息

### 列车时刻表API
- `GET /api/train-schedules` - 获取列车时刻表
- `GET /api/train-schedule-details` - 获取列车时刻表明细

### 交路票API
- `GET /api/drive-tickets` - 获取交路票信息
- `GET /api/drive-ticket-collect` - 获取交路票夹信息
- `GET /api/drive-ticket-params` - 获取交路参数信息
- `PUT /api/drive-ticket-params` - 更新交路参数信息
- `POST /api/generate-drive-tickets` - 生成交路票
- `POST /api/generate-drive-ticket-collect` - 生成交路票夹

### 便乘票API
- `GET /api/ride-tickets` - 获取便乘票信息
- `POST /api/generate-ride-tickets` - 生成便乘票
- `GET /api/debug-ride-tickets` - 调试便乘票生成
- `POST /api/fix-missing-data` - 修复缺失数据

## 🎯 便乘票生成算法

### 算法特性
- **严格按照交路生成逻辑设计.md第4部分实现**
- **支持出勤便乘票生成**: 从出勤站点到接车站点或终点站
- **支持退勤便乘票生成**: 从出勤站点或起点站到退勤站点
- **智能站点类型识别**: 自动识别不同类型的逻辑车站
- **完整时间计算**: 自动计算上下车时间

### 生成结果示例
- **西直门站 → 五道口站** (6张)
- **西直门站 → 宣武门站** (8张)
- **西直门站 → 天安门西站** (6张)
- **天安门西站 → 宣武门站** (4张)
- **天安门西站 → 西直门站** (4张)

## 🚀 快速开始

### 1. 环境准备
```bash
# 安装Wrangler CLI
npm install -g wrangler@latest

# 登录Cloudflare
wrangler auth login
```

### 2. 项目初始化
```bash
# 克隆项目
git clone https://github.com/bachbear/mtrcx.git
cd mtrcx/workers-d1

# 安装依赖
npm install
```

### 3. 数据库配置
```bash
# 创建D1数据库
wrangler d1 create subway-management-db

# 将数据库ID添加到wrangler.toml
# 编辑wrangler.toml文件，更新database_id字段
```

### 4. 数据迁移
```bash
# 应用数据库迁移（本地）
npm run migrate:local

# 应用数据库迁移（远程）
npm run migrate:remote

# 导入示例数据
npm run generate-migration
```

### 5. 本地开发
```bash
# 启动本地开发服务器
npm run dev
```

访问 http://localhost:8787 测试API

### 6. 部署到生产环境
```bash
# 部署到Cloudflare Workers
npm run deploy
```

## 🧪 测试

### API测试
```bash
# 运行完整测试套件
npm test

# 手动测试特定API
curl http://localhost:8787/api/lines
curl http://localhost:8787/api/ride-tickets
curl -X POST http://localhost:8787/api/generate-ride-tickets
```

### 便乘票生成测试
```bash
# 测试便乘票生成
curl -X POST http://localhost:8787/api/generate-ride-tickets

# 调试便乘票生成
curl http://localhost:8787/api/debug-ride-tickets

# 修复缺失数据
curl -X POST http://localhost:8787/api/fix-missing-data
```

## 🔧 配置说明

### wrangler.toml配置
```toml
name = "subway-system-dt"
main = "src/index.js"
compatibility_date = "2023-10-30"

[[d1_databases]]
binding = "DB"
database_name = "subway-management-db"
database_id = "your-database-id-here"
```

### 环境变量
- 无需额外环境变量，所有配置通过wrangler.toml管理

## 📈 性能优化

### 已实现的优化
- ✅ **数据库索引优化**: 为常用查询字段创建索引
- ✅ **CORS支持**: 完整的跨域资源共享配置
- ✅ **错误处理**: 完善的错误处理和日志记录
- ✅ **响应格式**: 统一的API响应格式
- ✅ **缓存策略**: 有效的数据缓存机制

### 性能特点
- **全球分布**: Cloudflare Workers全球节点
- **低延迟**: 边缘计算，快速响应
- **高可用**: 99.9%+ 可用性保证
- **自动扩展**: 按需扩展，无需运维

## 🔍 监控与调试

### 部署监控
```bash
# 查看部署日志
wrangler tail

# 查看Workers信息
wrangler whoami

# 查看数据库信息
npm run db:info
```

### 便乘票生成调试
- 详细日志记录每个便乘票的生成过程
- 调试API提供完整的生成过程信息
- 支持缺失数据自动修复

## 🚨 故障排除

### 常见问题

1. **数据库连接失败**
   ```bash
   # 检查数据库配置
   wrangler d1 info subway-management-db
   ```

2. **迁移失败**
   ```bash
   # 重新应用迁移
   wrangler d1 migrations apply subway-management-db --local
   ```

3. **API返回404**
   ```bash
   # 检查部署状态
   wrangler deployments list
   ```

4. **便乘票生成失败**
   ```bash
   # 运行调试API
   curl http://localhost:8787/api/debug-ride-tickets

   # 修复缺失数据
   curl -X POST http://localhost:8787/api/fix-missing-data
   ```

## 📚 相关文档

- [交路生成逻辑设计](../交路生成逻辑设计.md) - 业务逻辑设计文档
- [迁移指南](MIGRATION_GUIDE.md) - 从原系统迁移的详细指南
- [部署检查清单](DEPLOYMENT_CHECKLIST.md) - 部署前的检查项目
- [迁移成功报告](MIGRATION_SUCCESS_REPORT.md) - 迁移完成情况报告

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- 感谢Cloudflare提供强大的Workers和D1服务
- 感谢所有为地铁交通管理系统做出贡献的开发者
- 特别感谢便乘票生成算法的设计者和实现者

---

**项目状态**: ✅ 开发完成，已部署到生产环境
**最后更新**: 2025年9月14日
**维护状态**: 活跃维护