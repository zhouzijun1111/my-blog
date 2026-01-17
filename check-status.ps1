# 服务器状态检查脚本
# 用于检查服务器 Docker 构建状态

$server = "lighthouse@114.132.201.84"
$sshKey = "$env:USERPROFILE\.ssh\github_deploy"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  服务器状态检查" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "正在连接到服务器 $server ..." -ForegroundColor Yellow
Write-Host ""

try {
    # 测试连接
    $result = ssh -i $sshKey -o ConnectTimeout=10 -o BatchMode=yes $server "echo 'connected'" 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 服务器连接成功！" -ForegroundColor Green
        Write-Host ""

        # 检查 Docker 状态
        Write-Host "检查 Docker 容器状态..." -ForegroundColor Yellow
        ssh -i $sshKey $server "cd /var/blog && docker compose ps"
        Write-Host ""

        # 检查磁盘空间
        Write-Host "检查磁盘空间..." -ForegroundColor Yellow
        ssh -i $sshKey $server "df -h | grep -E '(Filesystem|/dev/)'"
        Write-Host ""

        # 检查内存使用
        Write-Host "检查内存使用..." -ForegroundColor Yellow
        ssh -i $sshKey $server "free -h"
        Write-Host ""

    } else {
        Write-Host "❌ 无法连接到服务器" -ForegroundColor Red
        Write-Host ""
        Write-Host "可能的原因：" -ForegroundColor Yellow
        Write-Host "  1. Docker 仍在构建中（服务器资源占用高）" -ForegroundColor White
        Write-Host "  2. SSH 服务未响应" -ForegroundColor White
        Write-Host "  3. 网络连接问题" -ForegroundColor White
        Write-Host ""
        Write-Host "建议操作：" -ForegroundColor Yellow
        Write-Host "  1. 等待 5-10 分钟后重试" -ForegroundColor White
        Write-Host "  2. 在腾讯云控制台检查服务器状态" -ForegroundColor White
        Write-Host "  3. 运行 .\finish-deployment.ps1 完成部署" -ForegroundColor White
        Write-Host ""
    }

} catch {
    Write-Host "❌ 连接错误: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
