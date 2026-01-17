# 部署完成指南 - 执行剩余步骤

## 📊 当前状态

### ✅ 已完成
1. ✅ SSH 密钥配置（lighthouse@114.132.201.84）
2. ✅ 代码推送到 GitHub
3. ✅ Dockerfile 已更新（monorepo 结构）
4. ✅ 环境变量已配置（JWT_SECRET 已生成）

### 🔄 进行中
5. 🔄 **Docker 镜像构建** - 正在服务器上构建（预计还需 5-10 分钟）
   - 服务器当前资源占用高，SSH 暂时无法连接

---

## 🚀 部署完成后的执行步骤

### 步骤 1：等待并检查 Docker 构建（约 5-10 分钟）

**等待 Docker 构建完成后，在本地 PowerShell 执行**：

```powershell
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose ps"
```

**期望输出**：
- 如果显示 2 个服务（blog-backend, blog-frontend）且状态为 "running"，说明构建成功
- 如果显示 "restarting" 或为空，继续等待

---

### 步骤 2：启动 Docker 服务

如果构建完成但服务未启动，执行：

```powershell
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose up -d"
```

**期望输出**：
```
[+] Running 3/3
 ✔ Network blog-network  Created
 ✔ Container blog-backend  Started
 ✔ Container blog-frontend Started
```

---

### 步骤 3：初始化数据库

```powershell
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose exec -T backend pnpm db:generate && docker compose exec -T backend pnpm db:push"
```

**期望输出**：
```
Generating Prisma Client...
✅ Database schema pushed successfully
```

---

### 步骤 4：验证服务状态

```powershell
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose ps && echo '' && docker compose logs --tail=10"
```

**验证清单**：
- [ ] blog-backend 状态为 "running"
- [ ] blog-frontend 状态为 "running"
- [ ] 日志中没有错误信息

---

### 步骤 5：配置腾讯云安全组（重要！）

1. **登录腾讯云控制台**：https://console.cloud.tencent.com/
2. **进入云服务器 CVM**
3. **选择实例**：114.132.201.84
4. **点击安全组 → 配置规则 → 添加规则**
5. **添加入站规则**：
   - **类型**：自定义
   - **来源**：0.0.0.0/0
   - **协议端口**：TCP:3000
   - **策略**：允许
6. **点击保存**

---

### 步骤 6：配置 GitHub Secrets（自动化部署）

**打开配置页面**：https://github.com/zhouzijun1111/my-blog/settings/secrets/actions

点击 "New repository secret"，添加以下 4 个密钥：

#### Secret #1: SERVER_HOST
- **Name**: `SERVER_HOST`
- **Value**: `114.132.201.84`

#### Secret #2: SERVER_USER
- **Name**: `SERVER_USER`
- **Value**: `lighthouse` ⚠️ 注意：不是 root

#### Secret #3: SERVER_PORT
- **Name**: `SERVER_PORT`
- **Value**: `22`

#### Secret #4: SSH_PRIVATE_KEY
- **Name**: `SSH_PRIVATE_KEY`
- **Value**（复制以下全部内容）：
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

## 🎉 验证部署

完成所有步骤后，在浏览器访问：

**前端**：http://114.132.201.84:3000
**后端 API**：http://114.132.201.84:3001/api/health

**验证清单**：
- [ ] 页面正常加载
- [ ] 可以浏览文章列表
- [ ] 可以查看文章详情
- [ ] 后台管理可以访问（http://114.132.201.84:3000/login）

---

## 🔄 日常开发流程

配置完成后，你只需要：

```bash
# 1. 修改代码
# ... 在 VSCode 中编辑文件 ...

# 2. 提交到 GitHub
git add .
git commit -m "更新内容"
git push

# ✅ GitHub Actions 会自动部署到服务器（2-3 分钟）
```

**查看部署进度**：https://github.com/zhouzijun1111/my-blog/actions

---

## 🔧 常用管理命令

```powershell
# 查看服务状态
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose ps"

# 查看日志
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose logs -f"

# 重启服务
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && docker compose restart"

# 手动更新代码
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.84 "cd /var/blog && git pull && docker compose up -d"
```

---

## 📝 快速参考

### GitHub Secrets 配置
👉 **完整指南**：[GITHUB_SECRETS_GUIDE.md](e:\testing\GITHUB_SECRETS_GUIDE.md)

### 部署状态文档
👉 **查看状态**：[DEPLOYMENT_STATUS.md](e:\testing\DEPLOYMENT_STATUS.md)

### 完成部署脚本
👉 **自动执行**：[complete-deployment.sh](e:\testing\complete-deployment.sh)

---

## ⚠️ 重要提示

1. **服务器当前忙于构建**，SSH 可能暂时无法连接
2. **预计构建时间**：首次构建约 10-15 分钟
3. **构建完成后**：服务器会恢复正常响应
4. **安全组配置**：必须开放 3000 端口，否则无法访问
5. **GitHub Secrets**：必须配置才能实现自动部署

---

## 🆘 需要帮助？

- **构建超时**：等待更长时间或重启服务器
- **无法访问**：检查腾讯云安全组是否开放 3000 端口
- **容器启动失败**：检查日志 `docker compose logs -f`
- **GitHub Actions 失败**：检查 GitHub Secrets 是否正确配置

---

**下一步**：等待 10 分钟后执行"步骤 1：检查 Docker 构建"
