# Auto Deployment Script with Password
$server = "lighthouse@114.132.201.84"
$publicKey = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIM7TiGlrUXbGBWNZ6QKS1VyIvBgtv3gfWCRDYyNlTAEn github-actions-deploy"

Write-Host "=== Starting Auto Deployment ===" -ForegroundColor Green
Write-Host ""

# Step 1: Add SSH public key
Write-Host "Step 1: Adding SSH public key to server..." -ForegroundColor Yellow
Write-Host "Server: $server"
Write-Host ""

Write-Host "Running SSH command... (enter password when prompted)" -ForegroundColor Cyan

ssh $server "mkdir -p ~/.ssh && echo '$publicKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh && echo 'SUCCESS'"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS: SSH public key added!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Failed - continuing anyway..." -ForegroundColor Yellow
}

# Step 2: Test SSH key
Write-Host ""
Write-Host "Step 2: Testing SSH key..." -ForegroundColor Yellow
ssh -i ~/.ssh/github_deploy -o StrictHostKeyChecking=no $server "echo 'SSH key working!'"

# Display next steps
Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Green
Write-Host ""
Write-Host "1. Configure GitHub Secrets:" -ForegroundColor White
Write-Host "   https://github.com/zhouzijun1111/my-blog/settings/secrets/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Add these secrets:" -ForegroundColor White
Write-Host "   SERVER_HOST = 114.132.201.84" -ForegroundColor White
Write-Host "   SERVER_USER = lighthouse" -ForegroundColor White
Write-Host "   SERVER_PORT = 22" -ForegroundColor White
Write-Host ""
Write-Host "3. Then initialize server:" -ForegroundColor White
Write-Host "   ssh $server" -ForegroundColor Cyan
Write-Host "   curl -fsSL https://raw.githubusercontent.com/zhouzijun1111/my-blog/main/scripts/init-server.sh | bash" -ForegroundColor Cyan
Write-Host ""
