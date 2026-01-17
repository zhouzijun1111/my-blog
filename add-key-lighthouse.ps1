# Add SSH Key to Server (User: lighthouse)
$ErrorActionPreference = "Continue"

$sshDir = "$env:USERPROFILE\.ssh"
$serverIp = "114.132.201.84"
$serverUser = "lighthouse"
$publicKey = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIM7TiGlrUXbGBWNZ6QKS1VyIvBgtv3gfWCRDYyNlTAEn github-actions-deploy"

Write-Host "=== Adding SSH Public Key to Server ===" -ForegroundColor Cyan
Write-Host "Server: $serverUser@$serverIp" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please enter your server password when prompted..." -ForegroundColor White
Write-Host ""

# Add public key to server
$command = "mkdir -p ~/.ssh 2>/dev/null; echo '$publicKey' >> ~/.ssh/authorized_keys 2>/dev/null; chmod 600 ~/.ssh/authorized_keys 2>/dev/null; chmod 700 ~/.ssh 2>/dev/null; echo 'SUCCESS: Public key added!'"

ssh $serverUser@$serverIp $command

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS: SSH public key added!" -ForegroundColor Green
    Write-Host ""

    Write-Host "=== Testing SSH Key Connection ===" -ForegroundColor Cyan
    Write-Host ""

    $testResult = ssh -i "$sshDir\github_deploy" -o StrictHostKeyChecking=no -o ConnectTimeout=10 $serverUser@$serverIp "echo 'SSH key authentication works!'"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: SSH key is working!" -ForegroundColor Green
        Write-Host ""

        Write-Host "=== IMPORTANT: Update GitHub Secrets ===" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Open: https://github.com/zhouzijun1111/my-blog/settings/secrets/actions" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Update these secrets (note: username is lighthouse, NOT root):" -ForegroundColor White
        Write-Host ""
        Write-Host "   SERVER_HOST = 114.132.201.84" -ForegroundColor Yellow
        Write-Host "   SERVER_USER = lighthouse" -ForegroundColor Yellow
        Write-Host "   SERVER_PORT = 22" -ForegroundColor Yellow
        Write-Host "   SSH_PRIVATE_KEY = (same as before)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "=== Then Initialize Server ===" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Run these commands:" -ForegroundColor White
        Write-Host "ssh lighthouse@114.132.201.84" -ForegroundColor Cyan
        Write-Host "curl -fsSL https://raw.githubusercontent.com/zhouzijun1111/my-blog/main/scripts/init-server.sh | bash" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "Warning: SSH key test failed" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to add public key" -ForegroundColor Red
    Write-Host "Please check your server password" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
