# Fix SSH permissions and add public key to server
$ErrorActionPreference = "Continue"

$sshDir = "$env:USERPROFILE\.ssh"
$serverIp = "114.132.201.84"
$publicKey = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIM7TiGlrUXbGBWNZ6QKS1VyIvBgtv3gfWCRDYyNlTAEn github-actions-deploy"

Write-Host "=== Fixing SSH Permissions ===" -ForegroundColor Cyan
Write-Host ""

# Fix .ssh directory permissions
$acl = Get-Acl $sshDir
$inheritanceFlag = [System.Security.AccessControl.InheritanceFlags]::ContainerInherit -bor [System.Security.AccessControl.InheritanceFlags]::ObjectInherit
$propagationFlag = [System.Security.AccessControl.PropagationFlags]::None
$user = New-Object System.Security.Principal.NTAccount("$env:USERNAME")
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule($user, "FullControl", $inheritanceFlag, $propagationFlag, "Allow")
$acl.SetAccessRule($accessRule)
Set-Acl $sshDir $acl

Write-Host "Permissions fixed for .ssh directory" -ForegroundColor Green
Write-Host ""

Write-Host "=== Adding SSH Public Key to Server ===" -ForegroundColor Cyan
Write-Host "Server: $serverIp" -ForegroundColor Yellow
Write-Host ""
Write-Host "Please enter your server password when prompted..." -ForegroundColor White
Write-Host ""

# Add public key to server
$command = "mkdir -p ~/.ssh 2>/dev/null; echo '$publicKey' >> ~/.ssh/authorized_keys 2>/dev/null; chmod 600 ~/.ssh/authorized_keys 2>/dev/null; chmod 700 ~/.ssh 2>/dev/null; echo 'SUCCESS: Public key added to server!'"

ssh root@$serverIp $command

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS: SSH public key added!" -ForegroundColor Green
    Write-Host ""

    Write-Host "=== Testing SSH Key Connection ===" -ForegroundColor Cyan
    Write-Host ""

    $testResult = ssh -i "$sshDir\github_deploy" -o StrictHostKeyChecking=no -o ConnectTimeout=10 root@$serverIp "echo 'SSH key authentication works!'"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: SSH key is working!" -ForegroundColor Green
        Write-Host ""
        Write-Host "=== Next Step: Configure GitHub Secrets ===" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Open: https://github.com/zhouzijun1111/my-blog/settings/secrets/actions" -ForegroundColor White
        Write-Host "2. Add these 4 secrets:" -ForegroundColor White
        Write-Host ""
        Write-Host "   SERVER_HOST = 114.132.201.84" -ForegroundColor Yellow
        Write-Host "   SERVER_USER = root" -ForegroundColor Yellow
        Write-Host "   SERVER_PORT = 22" -ForegroundColor Yellow
        Write-Host "   SSH_PRIVATE_KEY =" -ForegroundColor Yellow
        Write-Host "   (copy from 2-CONFIGURE-GITHUB.txt)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "3. Then run server init:" -ForegroundColor White
        Write-Host "   ssh root@114.132.201.84" -ForegroundColor Cyan
        Write-Host "   curl -fsSL https://raw.githubusercontent.com/zhouzijun1111/my-blog/main/scripts/init-server.sh | bash" -ForegroundColor Cyan
    } else {
        Write-Host "Warning: SSH key test failed, but key was added." -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "ERROR: Failed to add public key" -ForegroundColor Red
    Write-Host ""
    Write-Host "You can manually add it by running:" -ForegroundColor Yellow
    Write-Host "ssh root@114.132.201.84" -ForegroundColor White
    Write-Host "Then paste this:" -ForegroundColor White
    Write-Host "mkdir -p ~/.ssh && echo '$publicKey' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
