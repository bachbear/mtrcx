#!/bin/bash

# 地铁交路管理系统部署脚本
# 从本地Node.js迁移到Cloudflare Workers + D1

echo "🚇 地铁交路管理系统 - Cloudflare Workers部署脚本"
echo "================================================"

# 检查wrangler是否安装
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI未安装，请先安装："
    echo "npm install -g wrangler"
    exit 1
fi

# 检查是否已登录
echo "🔐 检查Cloudflare登录状态..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ 未登录Cloudflare，请先登录："
    echo "wrangler auth login"
    exit 1
fi

echo "✅ Cloudflare登录状态正常"

# 创建D1数据库（如果不存在）
echo "📊 检查D1数据库..."
DB_INFO=$(wrangler d1 info subway-management-db 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "🆕 创建新的D1数据库..."
    wrangler d1 create subway-management-db
    echo ""
    echo "⚠️  请将返回的database_id复制到wrangler.toml文件中的database_id字段"
    echo "然后重新运行此脚本"
    exit 1
else
    echo "✅ D1数据库已存在"
fi

# 运行数据库迁移
echo "🔄 运行数据库迁移..."
echo "应用基础表结构..."
wrangler d1 migrations apply subway-management-db --remote

if [ $? -eq 0 ]; then
    echo "✅ 数据库迁移完成"
else
    echo "❌ 数据库迁移失败"
    exit 1
fi

# 部署Workers
echo "🚀 部署Cloudflare Workers..."
wrangler deploy

if [ $? -eq 0 ]; then
    echo "✅ Workers部署成功"
    
    # 获取部署的URL
    WORKER_URL=$(wrangler whoami 2>/dev/null | grep -o 'https://.*\.workers\.dev' | head -1)
    if [ -z "$WORKER_URL" ]; then
        WORKER_URL="https://workers-d1-subway-system.your-subdomain.workers.dev"
    fi
    
    echo ""
    echo "🎉 部署完成！"
    echo "📍 API地址: $WORKER_URL"
    echo ""
    echo "🧪 测试API端点："
    echo "curl $WORKER_URL/api/lines"
    echo "curl $WORKER_URL/api/stations"
    echo "curl $WORKER_URL/api/crossing-roads"
    echo ""
    echo "📚 查看完整API文档: README.md"
    
else
    echo "❌ Workers部署失败"
    exit 1
fi

echo ""
echo "🔧 后续步骤："
echo "1. 在Cloudflare控制台配置自定义域名（可选）"
echo "2. 配置环境变量（如需要）"
echo "3. 设置监控和告警"
echo "4. 测试所有API功能"