#!/bin/bash
set -e

echo "🚀 开始初始化博客服务器..."
echo "================================"

# 1. 更新系统
echo "📦 更新系统包..."
apt update && apt upgrade -y

# 2. 安装基础工具
echo "🔧 安装基础工具..."
apt install -y curl git vim wget

# 3. 安装 Docker
echo "🐳 安装 Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl start docker
    systemctl enable docker
    echo "✅ Docker 安装完成"
else
    echo "✅ Docker 已安装"
fi

# 4. 安装 Docker Compose
echo "🔗 安装 Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    apt install docker-compose -y
    echo "✅ Docker Compose 安装完成"
else
    echo "✅ Docker Compose 已安装"
fi

# 5. 显示版本信息
echo ""
echo "📋 版本信息："
docker --version
docker-compose --version
echo ""

# 6. 创建项目目录
echo "📁 创建项目目录..."
mkdir -p /var/blog
cd /var/blog

# 7. 克隆仓库（如果不存在）
if [ ! -d ".git" ]; then
    echo "📥 请输入你的 GitHub 仓库 URL"
    echo "例如: https://github.com/username/blog.git 或 git@github.com:username/blog.git"
    read -p "仓库 URL: " repo_url

    if [ -z "$repo_url" ]; then
        echo "❌ 仓库 URL 不能为空"
        exit 1
    fi

    git clone $repo_url .
    echo "✅ 仓库克隆完成"
else
    echo "✅ 仓库已存在，跳过克隆"
fi

# 8. 配置环境变量
echo ""
echo "⚙️  配置环境变量..."
cp .env.production .env

# 生成随机 JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)
sed -i "s/CHANGE_THIS_TO_A_STRONG_RANDOM_KEY_USE_OPENSSL_RAND_BASE64_32/$JWT_SECRET/" .env
echo "✅ JWT_SECRET 已生成"

# 9. 构建并启动服务
echo ""
echo "🏗️  构建 Docker 镜像（这可能需要几分钟）..."
docker-compose build

echo "🚀 启动服务..."
docker-compose up -d

# 10. 等待容器启动
echo "⏳ 等待容器启动（10秒）..."
sleep 10

# 11. 初始化数据库
echo "💾 初始化数据库..."
docker-compose exec -T backend pnpm db:generate
docker-compose exec -T backend pnpm db:push

# 12. 配置开机自启
echo ""
echo "⚡ 配置开机自启..."
cat > /etc/systemd/system/blog.service <<'EOF'
[Unit]
Description=Blog Docker Compose Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/var/blog
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable blog.service

# 13. 显示部署状态
echo ""
echo "================================"
echo "✅ 服务器初始化完成！"
echo "================================"
echo ""
echo "📝 服务状态："
docker-compose ps
echo ""
echo "🌐 访问地址: http://114.132.201.84:3000"
echo ""
echo "🔍 常用命令："
echo "  查看日志: cd /var/blog && docker-compose logs -f"
echo "  重启服务: cd /var/blog && docker-compose restart"
echo "  停止服务: cd /var/blog && docker-compose down"
echo "  更新代码: cd /var/blog && git pull origin main"
echo ""
echo "⚠️  重要提示："
echo "  1. 请在腾讯云控制台开放 3000 端口"
echo "  2. 如果使用 GitHub Actions 自动部署，请配置 SSH 密钥"
echo ""
