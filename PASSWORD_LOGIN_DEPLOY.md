# 🔐 使用密码登录 - 完整部署指南

## 📊 当前状态

### ✅ 已完成（所有前置步骤）
1. ✅ lighthouse 已添加到 docker 组
2. ✅ GitHub Secrets 已配置完成
3. ✅ SSH 密钥已存在
4. ✅ 代码已推送到 GitHub

### 🔄 待完成
- 连接服务器并更新代码
- 重新构建 Docker 镜像
- 启动服务
- 初始化数据库
- 验证部署

---

## 🎯 立即执行（在腾讯云控制台）

### 步骤 1：通过 VNC 或 Web Shell 登录

1. **登录**：https://console.cloud.tencent.com/
2. **进入**：云服务器 CVM → 选择实例：114.132.132.201.154
3. **点击**：**VNC 登录**
4. **输入密码**：`Zhz2213200`
5. **登录成功后执行以下命令**：

---

## 🚀 完整部署流程（在控制台操作）

### 步骤 2：更新服务器代码

```bash
cd /var/blog

# 更新代码
git fetch
git reset --hard origin/main

# 或者使用 sudo
sudo git fetch
sudo git reset --hard origin/main
```

---

### 步骤 3：重新构建 Docker 镜像（带进度显示）

```bash
docker compose build 2>&1 | tee /tmp/build.log &

# 查看构建进度（另一个终端）
tail -f /tmp/build.log
```

**预计时间**：5-10 分钟

---

### 步骤 4：启动服务

```bash
# 启动服务
docker compose up -d
```

**期望输出**：
```
[+] Running 3/3
 ✔ Network blog-network  Created
 ✔ Container blog-backend  Started
 ✔ Container blog-frontend Started
```

---

### 步骤 5：初始化数据库

```bash
# 生成 Prisma Client
docker compose exec -T backend pnpm db: generate

# 推送数据库
docker compose exec -T backend pnpm db: push
```

---

### 步骤骤 6：验证部署

```bash
# 检查服务状态
docker compose ps
```

---

## 🎉 完成后的验证

### 访问你的博客：http://114.132.132.201.154:3000

**验证清单**：
- [ ] 页面正常加载
- [ ] 可以浏览文章列表
- [ ] 可以查看文章详情
- [ ] 可以评论
- [ ] 后台管理可以访问

---

## 🔧 如果需要重新配置 SSH 密钥

### 重新生成 SSH 密钥对

**在本地执行**：

```powershell
# 生成新的 SSH 密钥对
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# 查看新的私钥（复制到 GitHub Secrets）
cat ~/.ssh/github_deploy

# 查看新的公钥（复制到服务器）
cat ~/.ssh/github_deploy.pub
```

### 添加公钥到服务器（通过控制台）

```bash
# 在控制台执行
mkdir -p ~/.ssh
echo '复制下面的公钥内容' >> ~/.ssh/authorized_keys

# 添加到服务器
ssh-copy-id -i ~/.ssh/github_deploy.pub lighthouse@114.132.201.154
```

---

## 📋 部署完成后的日常使用

### 方案 A：手动部署

```bash
# 在服务器上
cd /var/blog

# 更新代码
git fetch
git reset --hard origin/main

# 重新构建
docker compose build

# 启动服务
docker compose up -d
```

### 方案 B：自动部署（推荐）

**在本地执行**：
```bash
git add .
git commit -m "更新内容"
git push
```

**GitHub Actions 会自动部署**：
- 检查 → 构建 → 部署 → 重启 → 数据库更新

---

## 🎯 执行顺序

**现在立即在控制台执行**：
1. **登录 VNC**（使用密码：Zhz2213200）
2. **更新代码**
3. **重新构建并启动服务**
4. **初始化数据库**
5. **验证部署**

**预计完成时间**：10-15 分钟

---

## 📝 重要提示

### 1. 连接被拒绝的原因
- 服务器可能在处理 Docker 构建
- SSH 服务可能未启动
- 网络问题

**解决方案**：
- 等待 5-10 分钟后重试
- 在腾讯云控制台操作

### 2. 权限问题

如果仍遇到 Docker 权限问题：

```bash
# 使用 sudo 执行命令
sudo docker compose ps
sudo docker compose build
sudo docker compose up -d
```

---

## 🎉 完成后访问你的博客

**地址**：http://114.132.201.154:3000

**博客已配置为使用密码登录**

---

**所有配置都已完成！现在通过控制台执行上面的命令吧！** 🚀
