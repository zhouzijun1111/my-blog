@echo off
echo ========================================
echo   Step 1/3: Add SSH Key to Server
echo ========================================
echo.
echo Please enter your server password when prompted.
echo.
pause

ssh root@114.132.201.84 "mkdir -p ~/.ssh && echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIM7TiGlrUXbGBWNZ6QKS1VyIvBgtv3gfWCRDYyNlTAEn github-actions-deploy' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo '' && echo 'SUCCESS! SSH key added to server.' && echo ''"

echo.
echo ========================================
echo   Step 2/3: Test SSH Connection
echo ========================================
echo.

ssh -i %USERPROFILE%\.ssh\github_deploy -o StrictHostKeyChecking=no root@114.132.201.84 "echo 'SUCCESS! SSH key authentication is working!'"

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Configure GitHub Secrets at:
echo    https://github.com/zhouzijun1111/my-blog/settings/secrets/actions
echo.
echo 2. Add these 4 secrets:
echo.
echo    SERVER_HOST = 114.132.201.84
echo    SERVER_USER = root
echo    SERVER_PORT = 22
echo    SSH_PRIVATE_KEY = See below
echo.
echo    -----BEGIN OPENSSH PRIVATE KEY-----
echo    b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
echo    QyNTUxOQAAACDO04hpa1F2xgVjWekCktVciLwYLb94H1gkQ2MjZUwBJwAAAJj1U2K09VNi
echo    tAAAAAtzc2gtZWQyNTUxOQAAACDO04hpa1F2xgVjWekCktVciLwYLb94H1gkQ2MjZUwBJw
echo    AAAEBKkoNAVcnrIQDiMmt/ENrBGzehGyIb01IaAOPDUuVrIc7TiGlrUXbGBWNZ6QKS1VyI
echo    vBgtv3gfWCRDYyNlTAEnAAAAFWdpdGh1Yi1hY3Rpb25zLWRlcGxveQ==
echo    -----END OPENSSH PRIVATE KEY-----
echo.
echo 3. Run server init script:
echo    ssh root@114.132.201.84
echo    curl -fsSL https://raw.githubusercontent.com/zhouzijun1111/my-blog/main/scripts/init-server.sh ^| bash
echo.
echo 4. Open port 3000 in Tencent Cloud security group
echo.
pause
