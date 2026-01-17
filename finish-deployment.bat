@echo off
echo ========================================
echo   一键完成部署脚本
echo ========================================
echo.
echo 等待服务器 Docker 构建完成后执行...
echo.

SET SERVER=lighthouse@114.132.201.84
SET IDLE_TIME=60

echo 步骤 1: 等待 %IDLE_TIME% 秒...
timeout %IDLE_TIME%

echo.
echo 步骤 2: 检查 Docker 状态...
ssh -i %USERPROFILE%\.ssh\github_deploy %SERVER% "cd /var/blog && docker compose ps"

echo.
echo 步骤 3: 启动 Docker 服务...
ssh -i %USERPROFILE%\.ssh\github_deploy %SERVER% "cd /var/blog && docker compose up -d"

echo.
echo 步骤 4: 等待服务启动（10秒）...
timeout 10

echo.
echo 步骤 5: 初始化数据库...
ssh -i %USERPROFILE%\.ssh\github_deploy %SERVER% "cd /var/blog && docker compose exec -T backend pnpm db:generate && docker compose exec -T backend pnpm db:push"

echo.
echo 步骤 6: 验证服务状态...
ssh -i %USERPROFILE%\.ssh\github_deploy %SERVER% "cd /var/blog && docker compose ps"

echo.
echo 步骤 7: 查看日志（最后 20 行）...
ssh -i %USERPROFILE%\.ssh\github_deploy %SERVER% "cd /var/blog && docker compose logs --tail=20"

echo.
echo ========================================
echo   部署完成！
echo ========================================
echo.
echo 访问地址：
echo   前端: http://114.132.201.84:3000
echo   后端: http://114.132.201.84:3001
echo.
echo 重要提示：
echo   1. 确保腾讯云安全组已开放 3000 端口
echo   2. 配置 GitHub Secrets（见 GITHUB_SECRETS_GUIDE.md）
echo.
pause
