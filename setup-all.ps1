# 一键配置脚本 - PowerShell 版本
# 添加 SSH 公钥到服务器并配置 GitHub Secrets

$ErrorActionPreference = "Stop"

$SERVER_IP = "114.132.201.84"
$PUBLIC_KEY = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIM7TiGlrUXbGBWNZ6QKS1VyIvBgtv3gfWCRDYyNlTAEn github-actions-deploy"
$PRIVATE_KEY_CONTENT = @"
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDO04hpa1F2xgVjWekCktVciLwYLb94H1gkQ2MjZUwBJwAAAJj1U2K09VNi
tAAAAAtzc2gtZWQyNTUxOQAAACDO04hpa1F2xgVjWekCktVciLwYLb94H1gkQ2MjZUwBJw
AAAEBKkoNAVcnrIQDiMmt/ENrBGzehGyIb01IaAOPDUuVrIc7TiGlrUXbGBWNZ6QKS1VyI
vBgtv3gfWCRDYyNlTAEnAAAAFWdpdGh1Yi1hY3Rpb25zLWRlcGxveQ==
-----END OPENSSH PRIVATE KEY-----
"@

Write-Host "🚀 开始一键配置..." -ForegroundColor Green
Write-Host ""

# 步骤 1：添加公钥到服务器
Write-Host "步骤 1/3：添加 SSH 公钥到服务器" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "正在连接到服务器 $SERVER_IP ..." -ForegroundColor White
Write-Host ""

$SSH_COMMAND = "mkdir -p ~/.ssh && echo '$PUBLIC_KEY' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo '✅ 公钥已添加'"

ssh root@$SERVER_IP $SSH_COMMAND

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 公钥成功添加到服务器！" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ 添加公钥失败，请检查服务器密码" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 步骤 2：测试 SSH 连接
Write-Host "步骤 2/3：测试 SSH 密钥连接" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "正在测试 SSH 密钥认证..." -ForegroundColor White

ssh -i ~/.ssh/github_deploy -o StrictHostKeyChecking=no root@$SERVER_IP "echo '✅ SSH 密钥认证成功！'"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ SSH 密钥配置成功！" -ForegroundColor Green
} else {
    Write-Host "❌ SSH 密钥认证失败" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 步骤 3：显示配置信息
Write-Host "步骤 3/3：配置 GitHub Secrets" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "现在需要在 GitHub 仓库中配置 Secrets：" -ForegroundColor White
Write-Host ""
Write-Host "1. 访问：https://github.com/zhouzijun1111/my-blog/settings/secrets/actions" -ForegroundColor Cyan
Write-Host "2. 点击 'New repository secret' 添加以下 4 个密钥：" -ForegroundColor White
Write-Host ""

Write-Host "密钥 1: SERVER_HOST" -ForegroundColor Yellow
Write-Host "  值: 114.132.201.84" -ForegroundColor White
Write-Host ""

Write-Host "密钥 2: SERVER_USER" -ForegroundColor Yellow
Write-Host "  值: root" -ForegroundColor White
Write-Host ""

Write-Host "密钥 3: SERVER_PORT" -ForegroundColor Yellow
Write-Host "  值: 22" -ForegroundColor White
Write-Host ""

Write-Host "密钥 4: SSH_PRIVATE_KEY" -ForegroundColor Yellow
Write-Host "  值 (复制以下全部内容):" -ForegroundColor White
Write-Host $PRIVATE_KEY -ForegroundColor Cyan
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "✅ 配置完成！" -ForegroundColor Green
Write-Host ""
Write-Host "下一步：" -ForegroundColor Yellow
Write-Host "1. 配置 GitHub Secrets（上方说明）" -ForegroundColor White
Write-Host "2. 运行服务器初始化脚本：" -ForegroundColor White
Write-Host "   ssh root@114.132.201.84" -ForegroundColor Cyan
Write-Host "   curl -fsSL https://raw.githubusercontent.com/zhouzijun1111/my-blog/main/scripts/init-server.sh | bash" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. 配置腾讯云安全组开放 3000 端口" -ForegroundColor White
Write-Host ""
