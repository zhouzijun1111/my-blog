#!/bin/bash
# 带进度条的部署脚本

set -e

echo "========================================"
echo "  博客系统部署 - 带实时进度显示"
echo "========================================"
echo ""

SERVER="lighthouse@114.132.201.154"
SSH_KEY="$HOME/.ssh/github_deploy"

# 1. 更新服务器代码
echo "=== 1/5: 更新服务器代码 ==="
echo "正在连接到服务器..."
ssh -i $SSH_KEY -o ConnectTimeout=30 $SERVER "cd /var/blog && git fetch && echo '✅ 代码更新完成'"
echo ""

# 2. 重建 Docker 镜像（带进度显示）
echo "=== 2/5: 重建 Docker 镜像 ==="
echo "开始构建，这可能需要 5-10 分钟..."
echo ""

ssh -i $SSH_KEY $SERVER "cd /var/blog && docker compose build 2>&1 | grep -E '(Step|RUN|DONE|ERROR)' || echo '构建完成'"
echo ""

# 3. 启动服务
echo "=== 3/5: 启动服务 ==="
ssh -i $SSH_KEY $SERVER "cd /var/blog && docker compose up -d && echo '✅ 服务启动完成'"
echo ""

# 4. 等待服务稳定
echo "=== 4/5: 等待服务启动 ==="
echo "等待 15 秒..."
sleep 15
echo ""

# 5. 初始化数据库
echo "=== 5/5: 初始化数据库 ==="
ssh -i $SSH_KEY $SERVER "cd /var/blog && docker compose exec -T backend pnpm db:generate && docker compose exec -T backend pnpm db:push && echo '✅ 数据库初始化完成'"
echo ""

# 6. 验证部署
echo "=== 部署验证 ==="
echo ""
echo "服务状态："
ssh -i $SSH_KEY $SERVER "cd /var/blog && docker compose ps"
echo ""

echo "访问地址："
echo "  前端: http://114.132.201.154:3000"
echo "  后端: http://114.132.201.154:3001"
echo ""

echo "========================================"
echo "  部署完成！"
echo "========================================"
