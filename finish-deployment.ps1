# 一键完成部署脚本 - PowerShell 版本
# 等待服务器 Docker 构建完成后执行

$server = "lighthouse@114.132.201.84"
$sshKey = "$env:USERPROFILE\.ssh\github_deploy"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  一键完成部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 步骤 1：等待服务器恢复
Write-Host "步骤 1: 等待 60 秒..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# 步骤 2：检查 Docker 状态
Write-Host ""
Write-Host "步骤 2: 检查 Docker 状态..." -ForegroundColor Yellow
ssh -i $sshKey $server "cd /var/blog && docker compose ps"

# 步骤 3：启动服务
Write-Host ""
Write-Host "步骤 3: 启动 Docker 服务..." -ForegroundColor Yellow
ssh -i $sshKey $server "cd /var/blog && docker compose up -d"

# 步骤 4：等待服务启动
Write-Host ""
Write-Host "步骤 4: 等待服务启动（10秒）..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 步骤 5：初始化数据库
Write-Host ""
Write-Host "步骤 5: 初始化数据库..." -ForegroundColor Yellow
ssh -i $sshKey $server "cd /var/blog && docker compose exec -T backend pnpm db:generate && docker compose exec -T backend pnpm db:push"

# 步骤 6：验证服务状态
Write-Host ""
Write-Host "步骤 6: 验证服务状态..." -ForegroundColor Yellow
ssh -i $sshKey $server "cd /var/blog && docker compose ps"

# 步骤 7：查看日志
Write-Host ""
Write-Host "步骤 7: 查看服务日志..." -ForegroundColor Yellow
ssh -i $sshKey $server "cd /var/blog && docker compose logs --tail=20"

# 完成
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  部署完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "访问地址：" -ForegroundColor White
Write-Host "  前端: http://114.132.201.84:3000" -ForegroundColor Cyan
Write-Host "  后端: http://114.132.201.84:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "重要提示：" -ForegroundColor Yellow
Write-Host "  1. 确保腾讯云安全组已开放 3000 端口" -ForegroundColor White
Write-Host "  2. 配置 GitHub Secrets（见 GITHUB_SECRETS_GUIDE.md）" -ForegroundColor White
Write-Host "  3. 在浏览器访问 http://114.132.201.84:3000" -ForegroundColor White
Write-Host ""

# 显示常用命令
Write-Host "常用管理命令：" -ForegroundColor Yellow
Write-Host "  查看日志: ssh -i $sshKey $server 'cd /var/blog && docker compose logs -f'" -ForegroundColor White
Write-Host "  重启服务: ssh -i $sshKey $server 'cd /var/blog && docker compose restart'" -ForegroundColor White
Write-Host "  停止服务: ssh -i $sshKey $server 'cd /var/blog && docker compose down'" -ForegroundColor White
Write-Host ""
