#!/bin/bash
# 完成剩余部署步骤的自动化脚本
# 在服务器恢复连接后执行

set -e

echo "=== 检查服务器状态 ==="
echo ""

# 检查 Docker 构建状态
echo "1. 检查 Docker 构建状态..."
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose ps"

echo ""
echo "2. 如果构建完成，启动服务..."
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose up -d"

echo ""
echo "3. 等待服务启动（10秒）..."
sleep 10

echo ""
echo "4. 检查服务状态..."
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose ps"

echo ""
echo "5. 初始化数据库..."
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose exec -T backend pnpm db:generate"
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose exec -T backend pnpm db:push"

echo ""
echo "6. 查看服务日志..."
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose logs --tail=20"

echo ""
echo "=== 部署完成 ==="
echo ""
echo "访问地址："
echo "前端: http://114.132.201.84:3000"
echo "后端: http://114.132.201.84:3001"
echo ""
echo "重要提示："
echo "1. 在腾讯云控制台开放 3000 端口"
echo "2. 配置 GitHub Secrets（见 GITHUB_SECRETS_GUIDE.md）"
echo "3. 访问 http://114.132.201.84:3000 验证部署"
