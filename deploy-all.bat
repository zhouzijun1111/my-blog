@echo off
setlocal enabledelayedexpansion

set SERVER=lighthouse@114.132.201.84
set PASSWORD=Zhz2213200
set PUBLIC_KEY=ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIM7TiGlrUXbGBWNZ6QKS1VyIvBgtv3gfWCRDYyNlTAEn github-actions-deploy

echo ========================================
echo   Auto Deployment Script
echo ========================================
echo.
echo Server: %SERVER%
echo.

echo === Step 1: Adding SSH Key ===
echo.

REM Try using plink from PuTTY if available
where plink.exe >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using plink...
    plink.exe -ssh -pw %PASSWORD% %SERVER% "mkdir -p ~/.ssh && echo '%PUBLIC_KEY%' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh && echo 'SUCCESS'"
    goto :test_ssh
)

REM Try using sshpass if available
where sshpass >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using sshpass...
    sshpass -p %PASSWORD% ssh -o StrictHostKeyChecking=no %SERVER% "mkdir -p ~/.ssh && echo '%PUBLIC_KEY%' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && chmod 700 ~/.ssh && echo 'SUCCESS'"
    goto :test_ssh
)

REM Manual method - show instructions
echo plink.exe or sshpass not found.
echo.
echo Please run this command manually in PowerShell:
echo.
echo ssh %SERVER%
echo.
echo Then paste this command:
echo mkdir -p ~/.ssh ^&^& echo '%PUBLIC_KEY%' ^>^> ~/.ssh/authorized_keys ^&^& chmod 600 ~/.ssh/authorized_keys ^&^& chmod 700 ~/.ssh
echo.
goto :end

:test_ssh
echo.
echo === Step 2: Testing SSH Key ===
echo.

ssh -i %USERPROFILE%\.ssh\github_deploy -o StrictHostKeyChecking=no -o ConnectTimeout=10 %SERVER% "echo 'SSH key authentication successful!'"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS: SSH key is working!
    echo.
    goto :secrets
) else (
    echo.
    echo SSH key test failed. Please check manually.
    goto :end
)

:secrets
echo === Step 3: GitHub Secrets ===
echo.
echo Open this URL in your browser:
echo https://github.com/zhouzijun1111/my-blog/settings/secrets/actions
echo.
echo Add these 4 secrets:
echo.
echo   SERVER_HOST = 114.132.201.84
echo   SERVER_USER = lighthouse
echo   SERVER_PORT = 22
echo   SSH_PRIVATE_KEY = (see 2-CONFIGURE-GITHUB.txt)
echo.

:end
pause
