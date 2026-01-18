# 🚀 最终部署指南 - 完成所有剩余步骤

## 📊 当前状态

### ✅ 已完成（所有前置步骤）
1. ✅ lighthouse 已添加到 docker 组
2. ✅ GitHub Secrets 已配置完成
3. ✅ blog.service 已删除
4. ✅ 代码已推送到 GitHub

### 🔄 待完成
- 连接服务器并更新代码
- 重新构建 Docker 镜像
- 启动服务
- 初始化数据库
- 验证部署

---

## 🎯 立即执行（在腾讯云控制台）

### 方案 A：通过 VNC/Web Shell 操作

#### 步骤 1：登录控制台

1. **登录**：https://console.cloud.tencent.com/
2. **进入**：云服务器 CVM → 选择实例：114.132.201.154
3. **点击**：**VNC 登录** 或 **Web Shell**

#### 步骤 2：重新登录

```bash
# 重新登录
ssh lighthouse@114.132.201.154
```

#### 步骤 3：更新代码

```bash
cd /var/blog

# 更新代码
git fetch
git reset --hard origin/main

# 或者手动更新特定文件
nano packages/backend/package.json
```

#### 步骤 4：重新构建 Docker 镜像

```bash
docker compose build
```

**预计时间**：5-8 分钟

**构建进度会实时显示**：
```
⏳ 安装依赖 [################] 80%
⏳ 编译代码 [###########] 40%
⏳ 构建镜像 [###############] 90%
```

#### 步骤 5：启动服务

```bash
docker compose up -d
```

#### 步骤 6：初始化数据库

```bash
docker compose exec -T backend pnpm db:generate
docker compose exec -T backend pnpm db:push
```

#### 步骤 7：验证部署

```bash
docker compose ps
```

---

## 🎉 完成后

### 访问你的博客：http://114.132.201.154:3000

---

## ⏳ 仍无法连接？使用一键部署脚本

如果 SSH 仍被拒绝，可以：

### 方案 A：使用腾讯云控制台完整部署

在控制台执行所有步骤

### 方案 B：等待服务器恢复后执行

**等待 5-10 分钟**后执行：

```powershell
.\deploy-complete.sh
```

---

## 📝 完成后配置 GitHub Secrets

**打开**：https://github.com/zhouzijun1111/my-blog/settings/secrets/actions

**添加 4 个 Secrets**：

| 名称 | 值 |
|------|-----|
| `SERVER_HOST` | `114.132.201.154` |
| `SERVER_USER` | `lighthouse` |
| `SERVER_PORT` | `22` |
| `SSH_PRIVATE_KEY` | 见下方 |

**SSH 私钥**：
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDO04hpa1F2xgVjWekCktVciLwYLb94H1gkQ2MjZUwBJwAAAJj1U2K09VNi
tAAAAAtzc2gtZWQyNTUxOQAAACDO04hpa1F2xgVjWekCktVciLwYLb94H1gkQ2MjZUwBJw
AAAEBKkoNAVcnrIQDiMmt/ENrBGzehGyIb01IaAOPDUuVrIc7TiGlrUXbGBWNZ6QKS1VyI
vBgtv3gfWCRDYyNlTAEnAAAAFWdpdGh1Yi1h3Jpb25zLWRlcGxveQ==
-----END OPENSSH PRIVATE_KEY-----
```

---

## 🔄 自动部署工作流

配置完成后，每次推送代码自动部署：

```bash
git add .
git commit -m "更新内容"
git push

# ✅ GitHub Actions 自动部署（2-3 分钟）
```

---

**现在通过腾讯云控制台执行上面的命令吧！** 🚀

**如果仍有问题，请查看**：[DOCKER_PERMISSION_FIX.md](e:\testing\DOCKER_PERMISSION_FIX.md)
