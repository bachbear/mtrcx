#!/bin/bash

# 本地测试脚本
echo "🧪 启动本地测试环境..."

# 检查wrangler是否安装
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI未安装，请先安装："
    echo "npm install -g wrangler"
    exit 1
fi

# 运行本地数据库迁移
echo "🔄 运行本地数据库迁移..."
wrangler d1 migrations apply subway-management-db --local

# 启动本地开发服务器
echo "🚀 启动本地开发服务器..."
echo "访问 http://localhost:8787 测试API"
echo "按 Ctrl+C 停止服务器"
echo ""

wrangler dev --local