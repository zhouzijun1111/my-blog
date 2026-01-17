#!/bin/bash
# 一键配置脚本 - 添加 SSH 公钥到服务器

set -e

echo "🚀 开始配置服务器 SSH 公钥..."
echo ""

SERVER_IP="114.132.201.84"
PUBLIC_KEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIM7TiGlrUXbGBWNZ6QKS1VyIvBgtv3gfWCRDYyNlTAEn github-actions-deploy"

echo "📡 正在连接到服务器 $SERVER_IP ..."
echo ""

# 添加公钥到服务器
ssh root@$SERVER_IP "mkdir -p ~/.ssh && echo '$PUBLIC_KEY' >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys && echo '✅ 公钥已成功添加到服务器！' && echo '' && echo '🔑 公钥内容：' && cat ~/.ssh/authorized_keys"

echo ""
echo "✅ 配置完成！"
echo ""
echo "现在你可以使用以下命令测试 SSH 连接："
echo "ssh -i ~/.ssh/github_deploy root@$SERVER_IP"
