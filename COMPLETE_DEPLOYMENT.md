# 🚀 完整部署指南 - 使用 Root 用户

## 📊 当前状态

### ✅ 所有配置已完成
1. ✅ SSH 密钥已存在
2. ✅ GitHub Secrets 已配置（使用 root 用户）
3. ✅ 用户已改为 root
4. ✅ 代码已推送到 GitHub

### 🔄 待完成
- 验证 root 连接
- 更新服务器代码
- 重建 Docker 镜像
- 启动服务
- 初始化数据库
- 验证部署

---

## 🎯 立即执行（腾讯云控制台）

### 第一步：验证 root 登录

**通过 VNC 或 Web Shell 登录**：
1. 登录：https://console.cloud.tencent.com/
2. 选择实例：114.132.201.154
3. 点击：**VNC 登录**
4. 输入密码：**Zhz2213200**
5. 执行：

```bash
# 1. 检查 SSH 服务
sudo systemctl status sshd

# 2. 如果未启动，启动 SSH 服务
sudo systemctl start sshd

# 3. 测试 root 登录
ssh root@114.132.201.154 "echo '✅ Root 登录成功！' && uptime"
```

---

## 🚀 完整部署流程

### 步骤 1：更新服务器代码

```bash
cd /var/blog
git fetch
git reset --hard origin/main
```

---

### 步骤 2：重建 Docker 镜像

```bash
docker compose build
```

**构建进度**：
- 前端：✅ 已成功构建（12.5秒）
- 后端：⏳ 正在构建（5-8 分钟）

---

### 步骤 3：启动服务

```bash
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

### 步骤 4：初始化数据库

```bash
docker compose exec -T backend pnpm db:generate
docker compose exec -t backend pnpm db:push
```

---

### 步骤 5：验证部署

```bash
docker compose ps
docker compose logs --tail -20
```

---

## 🎉 完成后的效果

### 访问你的博客：http://114.132.201.154:3000

---

## 🔧 后端构建失败的修复

如果后端构建失败，需要修复 TypeScript 错误。

**常见问题**：
- `error TS2339: Property 'errors' does not exist`
- `error TS2322: null 不能赋值给 string`
- `error TS7016: 找不到 'rss' 模块

**解决方案**：

### 方法 1：安装缺失的类型定义

```bash
cd /var/blog/packages/backend

# 安装缺失的类型定义
sudo npm install -D @types/rss @types/bcryptjs

# 提交并推送
sudo git add .
sudo git commit -m "fix: Add missing type definitions"
sudo git push
```

---

## 🔄 日常使用

### 本地更新代码

```bash
git add .
git commit -m "更新内容"
git push
```

**GitHub Actions 会自动部署**（2-3 分钟）

---

## 📚 相关文档

1. **[ROOT_LOGIN_TROUBLESHOOTING.md](e:\testing\ROOT_LOGIN_TROUBLESHOOTING.md)** - 登录问题解决方案
2. **[DOCKER_PERMISSION_FIX.md](e:\testing\DOCKER_PERMISSION_FIX.md)** - Docker 权限修复
3. [GITHUB_SECRETS_GUIDE.md](e:\testing\GITHUB_SECRETS_GUIDE.md)** - GitHub Secrets 配置

---

**现在请执行 "第一步：验证 root 登录" 吧！** 🚀

**如果仍有问题，查看**：[ROOT_LOGIN_TROUBLESHOOTING.md](e:\testing\ROOT_LOGIN_TROUBLESHOOTING.md)
