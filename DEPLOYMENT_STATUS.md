# 部署状态 - 自动化工作流

## ✅ 已完成的步骤

### 1. ✅ SSH 密钥配置
- SSH 公钥已成功添加到服务器 114.132.201.84
- 用户名：lighthouse
- 认证方式：密钥认证（无需密码）

### 2. ✅ 代码已推送到 GitHub
- 仓库地址：https://github.com/zhouzijun1111/my-blog
- 分支：main
- 最新提交：fix: Update Dockerfiles for monorepo structure

### 3. ✅ 服务器环境准备
- Docker 已安装（v29.1.5）
- Docker Compose 已安装（v2.22.0）
- 代码已克隆到 /var/blog
- .env 配置文件已创建
- JWT_SECRET 已自动生成

### 4. ✅ Dockerfile 已更新
- 后端 Dockerfile 已更新为 monorepo 结构
- 前端 Dockerfile 已更新为 monorepo 结构
- docker-compose.yml 已更新

---

## 🔄 正在进行的步骤

### 5. 🔄 Docker 镜像构建
当前状态：**正在构建中**

预计时间：5-10 分钟（首次构建需要下载依赖）

**监控构建进度**：
```bash
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose ps"
```

---

## ⏳ 待完成的步骤

### 6. ⏳ 启动 Docker 服务
构建完成后执行：
```bash
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose up -d"
```

### 7. ⏳ 初始化数据库
```bash
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose exec -T backend pnpm db:generate && docker compose exec -T backend pnpm db:push"
```

### 8. ⏳ 配置腾讯云安全组
开放端口 3000

### 9. ⏳ 配置 GitHub Secrets（用于自动部署）
访问：https://github.com/zhouzijun1111/my-blog/settings/secrets/actions

需要添加 4 个 Secrets：
1. `SERVER_HOST` = `114.132.201.84`
2. `SERVER_USER` = `lighthouse`
3. `SERVER_PORT` = `22`
4. `SSH_PRIVATE_KEY` = 见下方

---

## 🔑 SSH 私钥（用于 GitHub Secrets）

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDO04hpa1F2xgVjWekCktVciLwYLb94H1gkQ2MjZUwBJwAAAJj1U2K09VNi
tAAAAAtzc2gtZWQyNTUxOQAAACDO04hpa1F2xgVjWekCktVciLwYLb94H1gkQ2MjZUwBJw
AAAEBKkoNAVcnrIQDiMmt/ENrBGzehGyIb01IaAOPDUuVrIc7TiGlrUXbGBWNZ6QKS1VyI
vBgtv3gfWCRDYyNlTAEnAAAAFWdpdGh1Yi1hY3Rpb25zLWRlcGxveQ==
-----END OPENSSH PRIVATE KEY-----
```

---

## 📋 快速命令清单

### 检查构建状态
```bash
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose ps"
```

### 查看构建日志
```bash
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose logs -f"
```

### 手动启动服务（如果构建完成）
```bash
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose up -d"
```

### 重启服务
```bash
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose restart"
```

### 停止服务
```bash
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose down"
```

---

## 🎯 完成后的验证

1. **访问前端**：http://114.132.201.84:3000
2. **访问后端 API**：http://114.132.201.84:3001/api/health
3. **检查容器状态**：
   ```bash
   ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose ps"
   ```

---

## 🔄 日常开发流程

以后修改代码后：

```bash
# 本地提交
git add .
git commit -m "更新内容"
git push

# ✅ GitHub Actions 会自动部署到服务器（2-3分钟）
```

查看部署进度：https://github.com/zhouzijun1111/my-blog/actions

---

## 📞 需要帮助？

- **构建卡住**：检查服务器日志 `ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose logs -f"`
- **无法访问**：检查腾讯云安全组是否开放 3000 端口
- **GitHub Actions 失败**：检查 GitHub Secrets 是否正确配置

---

**当前状态**：Docker 镜像构建中... (预计还需 3-5 分钟)

**下一步**：等待构建完成后启动服务
