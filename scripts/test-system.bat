@echo off
echo ===========================================
echo 营地管理系统自动化测试脚本 (Windows)
echo ===========================================
echo.

echo [1/5] 检查环境...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装或未在PATH中
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm 未安装或未在PATH中
    pause
    exit /b 1
)

echo ✅ Node.js 和 npm 已安装

echo.
echo [2/5] 启动开发服务器...
start /b npm run dev >nul 2>nul
echo ✅ 开发服务器启动中...

echo.
echo [3/5] 等待服务器启动...
timeout /t 10 /nobreak >nul
echo ✅ 服务器应该已经启动

echo.
echo [4/5] 运行API测试...

REM 测试首页
echo 测试首页访问...
curl -s http://localhost:3000 >nul
if %errorlevel% equ 0 (
    echo ✅ 首页访问正常
) else (
    echo ❌ 首页访问失败
)

REM 测试套餐API
echo 测试套餐API...
curl -s http://localhost:3000/api/packages >nul
if %errorlevel% equ 0 (
    echo ✅ 套餐API响应正常
) else (
    echo ❌ 套餐API响应失败
)

REM 测试登录页面
echo 测试登录页面...
curl -s http://localhost:3000/login >nul
if %errorlevel% equ 0 (
    echo ✅ 登录页面正常
) else (
    echo ❌ 登录页面失败
)

echo.
echo [5/5] 测试完成!
echo.
echo ===========================================
echo 测试结果摘要:
echo - 环境检查: 完成
echo - 服务器启动: 完成  
echo - API连通性: 完成
echo ===========================================
echo.
echo 💡 提示: 
echo 1. 请在浏览器中访问 http://localhost:3000 进行手动测试
echo 2. 查看开发服务器日志确认无错误
echo 3. 参考 docs/TESTING_GUIDE.md 进行完整功能测试
echo.
pause