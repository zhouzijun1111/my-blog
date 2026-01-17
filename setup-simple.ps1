# One-click Setup Script
$ErrorActionPreference = "Stop"

$SERVER_IP = "114.132.201.84"
$PUBLIC_KEY = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIM7TiGlrUXbGBWNZ6QKS1VyIvBgtv3gfWCRDYyNlTAEn github-actions-deploy"

Write-Host "=== Step 1/3: Add SSH Public Key to Server ===" -ForegroundColor Cyan
Write-Host "Connecting to $SERVER_IP ..." -ForegroundColor Yellow

$SSH_COMMAND = "mkdir -p ~/.ssh && echo '$PUBLIC_KEY' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo 'SUCCESS'"
ssh root@$SERVER_IP $SSH_COMMAND

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to add public key. Please check server password." -ForegroundColor Red
    Write-Host "You can manually run this command:" -ForegroundColor Yellow
    Write-Host "ssh root@114.132.201.84" -ForegroundColor White
    Write-Host "Then run: mkdir -p ~/.ssh && echo '$PUBLIC_KEY' >> ~/.ssh/authorized_keys" -ForegroundColor White
    exit 1
}

Write-Host "SUCCESS: Public key added to server!" -ForegroundColor Green
Write-Host ""

Write-Host "=== Step 2/3: Test SSH Key Connection ===" -ForegroundColor Cyan
ssh -i ~/.ssh/github_deploy -o StrictHostKeyChecking=no root@$SERVER_IP "echo 'SSH key auth successful!'"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: SSH key authentication failed" -ForegroundColor Red
    exit 1
}

Write-Host "SUCCESS: SSH key configured!" -ForegroundColor Green
Write-Host ""

Write-Host "=== Step 3/3: GitHub Secrets Configuration ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configure GitHub Secrets at:" -ForegroundColor Yellow
Write-Host "https://github.com/zhouzijun1111/my-blog/settings/secrets/actions" -ForegroundColor White
Write-Host ""
Write-Host "Add these 4 secrets:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. SERVER_HOST = 114.132.201.84" -ForegroundColor White
Write-Host "2. SERVER_USER = root" -ForegroundColor White
Write-Host "3. SERVER_PORT = 22" -ForegroundColor White
Write-Host "4. SSH_PRIVATE_KEY (see below):" -ForegroundColor White
Write-Host ""

Write-Host "-----BEGIN OPENSSH PRIVATE KEY-----" -ForegroundColor Cyan
Write-Host "b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW" -ForegroundColor Cyan
Write-Host "QyNTUxOQAAACDO04hpa1F2xgVjWekCktVciLwYLb94H1gkQ2MjZUwBJwAAAJj1U2K09VNi" -ForegroundColor Cyan
Write-Host "tAAAAAtzc2gtZWQyNTUxOQAAACDO04hpa1F2xgVjWekCktVciLwYLb94H1gkQ2MjZUwBJw" -ForegroundColor Cyan
Write-Host "AAAEBKkoNAVcnrIQDiMmt/ENrBGzehGyIb01IaAOPDUuVrIc7TiGlrUXbGBWNZ6QKS1VyI" -ForegroundColor Cyan
Write-Host "vBgtv3gfWCRDYyNlTAEnAAAAFWdpdGh1Yi1hY3Rpb25zLWRlcGxveQ==" -ForegroundColor Cyan
Write-Host "-----END OPENSSH PRIVATE KEY-----" -ForegroundColor Cyan
Write-Host ""

Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Add the 4 GitHub Secrets (above)" -ForegroundColor White
Write-Host "2. Run server init script:" -ForegroundColor White
Write-Host "   ssh root@114.132.201.84" -ForegroundColor Cyan
Write-Host "   curl -fsSL https://raw.githubusercontent.com/zhouzijun1111/my-blog/main/scripts/init-server.sh | bash" -ForegroundColor Cyan
Write-Host "3. Open port 3000 in Tencent Cloud security group" -ForegroundColor White
Write-Host ""
