# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个基于Cloudflare Workers和D1数据库的现代化地铁交路管理系统，实现了从传统Node.js + JSON文件架构到Serverless架构的完整迁移。系统核心业务是地铁交路管理、便乘票生成算法和列车时刻表管理。

## 技术栈

- **运行时**: Cloudflare Workers (ES6+ modules)
- **数据库**: Cloudflare D1 (SQLite-based)
- **部署**: Wrangler CLI
- **架构**: RESTful API + 嵌入式前端界面

## 开发命令

```bash
# 本地开发
npm run dev                    # 启动本地开发服务器 (localhost:8787)
wrangler d1 execute subway-management-db --local --file=/path/to/file.sql  # 执行SQL

# 数据库管理
npm run db:create              # 创建D1数据库
npm run migrate:local         # 应用本地数据库迁移
npm run migrate:remote        # 应用远程数据库迁移
npm run db:info               # 查看数据库信息

# 数据迁移
npm run generate-migration    # 从JSON文件生成迁移数据

# 测试
npm test                      # 运行API测试套件
node scripts/test-api.js      # 手动API测试

# 部署
npm run deploy                # 部署到生产环境
```

## 核心业务架构

### 数据库架构
系统基于11个核心业务表，完整实现了地铁交通管理的复杂数据模型：

**基础数据表**: `cw_line`, `cw_station`, `cw_logic_station`, `cw_seat_type`
**交路管理**: `cw_crossing_road`, `drive_ticket`, `drive_ticket_collect`, `drive_ticket_param`
**列车时刻**: `cw_train_schedule`, `cw_train_schedule_detail`
**便乘票系统**: `drive_ride_ticket`

### 核心算法
**便乘票生成算法**: 位于 `src/logic/ride_tickets_correct.js`，严格按照交路生成逻辑设计文档第4部分实现：
- 出勤便乘票：从出勤站点到接车站点或终点站
- 退勤便乘票：从出勤站点或起点站到退勤站点
- 智能站点类型识别：station_type (1=出勤站, 2=退勤站, 3=接车站, 4=送车站)

### API设计
采用RESTful设计模式，所有API端点位于 `/api/` 路径下：
- **读取操作**: GET `/api/*` 获取各类数据
- **写入操作**: PUT `/api/crossing-roads`, PUT `/api/drive-ticket-params`
- **生成操作**: POST `/api/generate-*` 触发业务逻辑生成
- **调试操作**: POST `/api/debug-*`, POST `/api/fix-missing-data`

## 项目结构

```
workers-d1/
├── src/
│   ├── index.js                     # Workers主入口，包含完整的前端界面
│   ├── logic/                       # 业务逻辑模块
│   │   ├── ride_tickets_correct.js  # ✅ 核心便乘票生成算法
│   │   ├── drive_tickets.js         # 交路票生成逻辑
│   │   └── drive_ticket_collect.js  # 交路票夹生成逻辑
│   ├── utils/                       # 工具函数
│   └── missing_data.js             # 数据修复脚本
├── scripts/
│   ├── migrate-data.js             # JSON到D1数据迁移脚本
│   └── test-api.js                # 完整API测试套件
├── migrations/
│   ├── 0001_initial_schema.sql     # 初始数据库架构
│   └── 0002_align_schema_with_json.sql # 与JSON数据对齐的架构
├── public/                         # 静态资源
├── wrangler.toml                   # Cloudflare配置
└── package.json
```

## 关键开发注意事项

### 数据库迁移
- 使用 `wrangler d1 migrations apply` 执行迁移
- 数据迁移从 `../data/*.json` 文件读取
- 迁移脚本位于 `scripts/migrate-data.js`

### 便乘票生成算法
- **核心文件**: `src/logic/ride_tickets_correct.js`
- **实现标准**: 严格按照"交路生成逻辑设计.md"第4部分
- **输入数据**: 列车时刻表、逻辑车站、站点信息
- **输出**: 便乘票记录 (drive_ride_ticket表)

### 前端界面
- **嵌入式实现**: 完整的前端界面直接内嵌在 `src/index.js` 中
- **单页应用**: 使用原生JavaScript实现标签页切换
- **实时数据**: 通过API调用获取实时数据展示

### CORS配置
- 所有API端点都配置了完整的CORS头
- 支持跨域请求，便于前端调用

### 调试功能
- `/api/debug-ride-tickets`: 详细便乘票生成过程日志
- `/api/fix-missing-data`: 自动修复缺失的列车时刻表明细数据

## 开发工作流

1. **修改代码**: 编辑 `src/` 下的相应文件
2. **本地测试**: `npm run dev` 启动开发服务器
3. **API测试**: `npm test` 或手动调用API端点
4. **数据库更改**: 如需schema变更，创建新的migration文件
5. **部署**: `npm run deploy` 部署到Cloudflare Workers

## 性能优化

- **数据库索引**: 所有常用查询字段都已创建索引
- **批量操作**: 使用 `DB.batch()` 进行批量数据库操作
- **边缘计算**: 利用Cloudflare Workers全球分布特性
- **静态资源**: 通过 `public/` 目录提供静态文件服务

## 故障排除

- **数据库连接失败**: 检查 `wrangler.toml` 中的 `database_id`
- **API返回404**: 确认路径正确，检查 `src/index.js` 中的路由配置
- **便乘票生成失败**: 使用 `/api/debug-ride-tickets` 查看详细日志
- **迁移失败**: 检查SQL语法，重新执行迁移命令

## 部署配置

- **Workers名称**: `subway-system-dt`
- **数据库名称**: `subway-management-db`
- **自定义域名**: `dt.xiaov.co`
- **兼容性日期**: `2023-10-30`