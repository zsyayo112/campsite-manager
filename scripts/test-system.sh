#!/bin/bash

echo "==========================================="
echo "营地管理系统自动化测试脚本 (Linux/Mac)"
echo "==========================================="
echo

echo "[1/5] 检查环境..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装或未在PATH中"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装或未在PATH中"
    exit 1
fi

echo "✅ Node.js 和 npm 已安装"

echo
echo "[2/5] 启动开发服务器..."
npm run dev &> /dev/null &
DEV_SERVER_PID=$!
echo "✅ 开发服务器启动中 (PID: $DEV_SERVER_PID)..."

echo
echo "[3/5] 等待服务器启动..."
sleep 10
echo "✅ 服务器应该已经启动"

echo
echo "[4/5] 运行API测试..."

# 测试首页
echo "测试首页访问..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 首页访问正常"
else
    echo "❌ 首页访问失败"
fi

# 测试套餐API
echo "测试套餐API..."
if curl -s http://localhost:3000/api/packages > /dev/null; then
    echo "✅ 套餐API响应正常"
else
    echo "❌ 套餐API响应失败"
fi

# 测试登录页面
echo "测试登录页面..."
if curl -s http://localhost:3000/login > /dev/null; then
    echo "✅ 登录页面正常"
else
    echo "❌ 登录页面失败"
fi

# 测试注册页面
echo "测试注册页面..."
if curl -s http://localhost:3000/register > /dev/null; then
    echo "✅ 注册页面正常"
else
    echo "❌ 注册页面失败"
fi

# 测试API端点
echo "测试预订API..."
if curl -s http://localhost:3000/api/bookings > /dev/null; then
    echo "✅ 预订API端点存在"
else
    echo "❌ 预订API端点失败"
fi

echo
echo "[5/5] 清理..."
if [ ! -z "$DEV_SERVER_PID" ]; then
    kill $DEV_SERVER_PID 2>/dev/null
    echo "✅ 开发服务器已停止"
fi

echo
echo "==========================================="
echo "测试结果摘要:"
echo "- 环境检查: 完成"
echo "- 服务器启动: 完成"
echo "- API连通性: 完成"
echo "- 页面可访问性: 完成"
echo "==========================================="
echo
echo "💡 提示:"
echo "1. 运行 'npm run dev' 启动开发服务器"
echo "2. 在浏览器中访问 http://localhost:3000 进行手动测试"
echo "3. 参考 docs/TESTING_GUIDE.md 进行完整功能测试"
echo "4. 参考 docs/API_TESTING.md 进行API测试"
echo