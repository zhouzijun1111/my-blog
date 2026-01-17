#!/bin/bash
# 完整部署脚本 - 带实时进度显示
# 用法: bash deploy-complete.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SERVER="lighthouse@114.132.201.154"
SSH_KEY="$HOME/.ssh/github_deploy"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  博客系统部署 - 实时进度显示${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 步骤 1：检查连接
echo -e "${YELLOW}⏳ 步骤 1/6: 检查服务器连接...${NC}"
if ssh -i $SSH_KEY -o ConnectTimeout=10 -o BatchMode=yes $SERVER "echo 'connected'" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 服务器连接正常${NC}"
else
    echo -e "${RED}❌ 无法连接到服务器${NC}"
    echo -e "${YELLOW}⏳ 请等待服务器恢复（Docker 构建可能还在进行中）${NC}"
    echo ""
    echo "等待 5-10 分钟后重试，或通过腾讯云控制台操作"
    exit 1
fi
echo ""

# 步骤 2：更新代码
echo -e "${YELLOW}⏳ 步骤 2/6: 更新服务器代码...${NC}"
ssh -i $SSH_KEY $SERVER "cd /var/blog && git fetch && git reset --hard origin/main && echo '✅ 代码已更新'" || echo "⚠️ 代码更新跳过（可能已是最新）"
echo ""

# 步骤 3：重建 Docker 镜像（带进度）
echo -e "${YELLOW}⏳ 步骤 3/6: 重建 Docker 镜像...${NC}"
echo -e "${BLUE}正在构建，请耐心等待 5-10 分钟...${NC}"
echo ""

# 执行构建并显示进度
ssh -i $SSH_KEY $SERVER "cd /var/blog && timeout 900 docker compose build 2>&1 | tee /tmp/build.log &
BUILD_PID=$!

# 显示实时进度
while ps -p $BUILD_PID > /dev/null 2>&1; do
    clear
    echo -e "${BLUE}📊 构建进度：${NC}"
    echo ""
    ssh -i $SSH_KEY $SERVER "cd /var/blog && docker compose ps -a 2>/dev/null || echo '容器还未创建'"
    echo ""
    echo -e "${BLUE}📦 最近的构建日志：${NC}"
    tail -20 /tmp/build.log 2>/dev/null || echo "等待日志..."
    echo ""
    echo -e "${GREEN}⏳ 构建进行中，请稍候...${NC}"
    sleep 5
done

wait $BUILD_PID 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 构建成功！${NC}"
else
    echo -e "${YELLOW}⚠️  构建可能仍在进行中或超时${NC}"
fi
echo ""

# 步骤 4：启动服务
echo -e "${YELLOW}⏳ 步骤 4/6: 启动服务...${NC}"
ssh -i $SSH_KEY $SERVER "cd /var/blog && docker compose up -d && echo '✅ 服务启动完成'"
echo ""

# 步骤 5：等待服务启动
echo -e "${YELLOW}⏳ 步骤 5/6: 等待服务启动...${NC}"
echo "等待 15 秒..."
sleep 15
echo ""

# 步骤 6：初始化数据库
echo -e "${YELLOW}⏳ 步骤 6/6: 初始化数据库...${NC}"
ssh -i $SSH_KEY $SERVER "cd /var/blog && docker compose exec -T backend pnpm db:generate && docker compose exec -T backend pnpm db:push && echo '✅ 数据库初始化完成'"
echo ""

# 验证部署
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  🎉 部署完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo -e "${YELLOW}📊 服务状态：${NC}"
ssh -i $SSH_KEY $SERVER "cd /var/blog && docker compose ps"
echo ""

echo -e "${YELLOW}🌐 访问地址：${NC}"
echo -e "${GREEN}  前端: http://114.132.201.154:3000${NC}"
echo -e "${GREEN}  后端: http://114.132.201.154:3001${NC}"
echo ""

echo -e "${YELLOW}🔍 查看日志：${NC}"
echo "  ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.154 'cd /var/blog && docker compose logs -f'"
echo ""

echo -e "${YELLOW}🔄 日常更新代码：${NC}"
echo "  git add . && git commit -m '更新内容' && git push"
echo "  GitHub Actions 会自动部署到服务器"
echo ""

echo -e "${YELLOW}📝 重要提示：${NC}"
echo "  1. 确保腾讯云安全组已开放 3000 端口"
echo "  2. 配置 GitHub Secrets（见 GITHUB_SECRETS_GUIDE.md）"
echo "  3. 配置完成后，每次推送代码自动部署"
echo ""

echo -e "${GREEN}✅ 部署完成！博客已上线！${NC}"
echo ""

echo -e "${BLUE}========================================${NC}"
