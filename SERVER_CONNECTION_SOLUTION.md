# 🚨 服务器连接问题 - 解决方案

## 📊 当前状态

### ✅ 已完成
1. ✅ 代码已推送到 GitHub
2. ✅ 本地 package.json 已修复（移除 vue-tsc）
3. ✅ tsconfig.json 已优化
4. ✅ blog.service 已删除（不再导致重启循环）

### 🔄 问题
- **SSH 连接被拒绝** - 服务器可能仍在 Docker 构建中，或网络问题

---

## 🎯 立即执行的解决方案

### 方案 A：等待服务器恢复（推荐）

**等待 10-15 分钟后**（Docker 构建通常需要这么长时间）：

```powershell
# 1. 检查连接
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.154 "uptime"

# 2. 如果连接成功，执行部署
.\deploy-with-progress.sh
```

---

### 方案 B：通过腾讯云控制台操作

1. **登录腾讯云控制台**：https://console.cloud.tencent.com/

2. **进入云服务器 CVM**

3. **选择实例**：114.132.201.154

4. **点击 VNC 登录**

5. **打开终端**，执行：

```bash
cd /var/blog

# 如果需要更新代码
sudo git fetch
sudo git reset --hard origin/main

# 重建 Docker 镜像
sudo docker compose build

# 启动服务
sudo docker compose up -d

# 初始化数据库
sudo docker compose exec -T backend pnpm db:generate
sudo docker compose exec -T backend pnpm db:push
```

---

### 方案 C：重启服务器（最后手段）

**在腾讯云控制台**：
1. 停止服务器
2. 重新启动服务器
3. 等待启动完成后，SSH 连接并执行部署

---

## 📊 构建进度显示

当构建进行中时，你将看到：

```
✅ 安装依赖
⏳ 下载包 [################------] 80%
⏳ 编译代码 [###########] 40%
⏳ 构建镜像 [############] 95%
```

**预计构建时间**：
- 首次构建：10-15 分钟
- 更新构建：5-10 分钟

---

## 🔧 一键部署脚本

我已为你创建：**[deploy-with-progress.sh](e:\testing\deploy-with-progress.sh)**

使用方法：
```powershell
.\deploy-with-progress.sh
```

这个脚本会：
- ✅ 显示每个步骤的进度
- ✅ 显示构建进度
- ✅ 完成所有部署步骤
- ✅ 显示最终访问地址

---

## 📝 配置 GitHub Secrets（现在可以执行）

**打开**：https://github.com/zhouzijun1111/my-blog/settings/secrets/actions

**添加 4 个 Secrets**：

### Secret #1: SERVER_HOST
- Name: `SERVER_HOST`
- Value: `114.132.201.154`

### Secret #2: SERVER_USER
- Name: `SERVER_USER`
- Value: `lighthouse`

### Secret #3: SERVER_PORT
- Name: `SERVER_PORT`
- Value: `22`

### Secret #4: SSH_PRIVATE_KEY
- Value:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDO04hpa1F2xgVjWekCktVciLwYLb94H1gkQ2MjZUwBJwAAAJj1U2K09VNi
tAAAAAtzc2gtZWQyNTUxOQAAACDO04hpa1F2xgVjWekCktVciLwYLb94H1gkQ2MjZUwBJw
AAAEBKkoNAVcnrIQDiMmt/ENrBGzehGyIb01IaAOPDUuVrIc7TiGlrUXbGBWNZ6QKS1VyI
vBgtv3gfWCRDYyNlTAEnAAAAFWdpdGh1Yi1hY3Jpb25zLWRlcGxveQ==
-----END OPENSSH PRIVATE_KEY-----
```

---

## 🎯 现在可以做的事情

### 1. 配置 GitHub Secrets（5 分钟）

**立即执行**，无需等待服务器：
1. 打开：https://github.com/zhouzijun1111/my-blog/settings/secrets/actions
2. 添加上面 4 个 Secrets
3. 完成！

### 2. 配置腾讯云安全组（3 分钟）

**立即执行**，无需等待服务器：
1. 登录：https://console.cloud.tencent.com/
2. 云服务器 CVM → 选择实例 114.132.201.154
3. 安全组 → 添加规则 → 开放 3000 端口

### 3. 等待服务器恢复连接（10-15 分钟）

**等待 Docker 构建完成后**：
```powershell
# 检查连接
ssh -i ~/.ssh/github_deploy lighthouse@114.132.201.154 "uptime"

# 如果连接成功，执行部署
.\deploy-with-progress.sh
```

---

## 📈 构建进度可视化

当 `docker compose build` 运行时，我会显示：

```
[################......] 100% 完成

✅ 下载依赖包
✅ 编译代码
✅ 构建镜像
✅ 启动服务
```

**预计完成时间**：
- 首次构建：10-15 分钟
- 后续构建：5-10 分钟

---

## ✅ 验证部署完成

执行完 `deploy-with-progress.sh` 后，在浏览器访问：

**http://114.132.201.154:3000**

检查清单：
- [ ] 页面正常加载
- [ ] 可以浏览文章
- [ ] 可以查看文章详情
- [ ] 后台管理可以访问

---

**下一步**：等待 10 分钟后运行 `.\deploy-with-progress.sh` 完成部署！
