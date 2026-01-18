# 🚨 Docker 权限拒绝问题 - 完整解决方案

## 📊 问题分析

### 问题根源
```
permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock
```

**原因**：`lighthouse` 用户不在 `docker` 组中，没有 Docker 访问权限

---

## 🎯 立即执行（在腾讯云控制台）

### 方法 1：添加 lighthouse 到 docker 组

**通过 VNC 或 Web Shell 登录服务器后执行**：

```bash
# 1. 将 lighthouse 添加到 docker 组
sudo usermod -aG docker lighthouse

# 2. 验证用户组
groups lighthouse
# 应该看到 docker 在列表中

# 3. 刷新用户组（无需退出登录）
newgrp docker

# 4. 重新登录
exit
ssh lighthouse@114.132.201.154

# 5. 再次尝试
cd /var/blog
docker compose ps
```

---

### 方法 2：使用 sudo（临时方案）

```bash
cd /var/blog

# 使用 sudo 执行所有 docker compose 命令
sudo docker compose ps
sudo docker compose build
sudo docker compose up -d
```

---

### 方法 3：检查并修复 Docker 权限

```bash
# 检查 docker 组
getent group docker

# 检查当前用户组
groups

# 查看 docker socket 权限
ls -la /var/run/docker.sock
```

---

## 🚀 快速部署步骤（腾讯云控制台）

### 步骤 1：添加到 docker 组
```bash
sudo usermod -aG docker lighthouse
newgrp docker
```

### 步骤 2：重新登录
```bash
exit
ssh lighthouse@114.132.201.154
```

### 步骤 3：启动服务
```bash
cd /var/blog
docker compose ps -a
```

### 步骤 4：如果容器已存在，直接启动
```bash
docker compose up -d
```

### 步骤 5：初始化数据库
```bash
docker compose exec -T backend pnpm db:generate
docker compose exec -T backend pnpm db:push
```

---

## 🔧 如果没有后端镜像

### 选项 A：重新构建

```bash
cd /var/blog
docker compose down
docker compose build --no-cache
```

### 选项 B：使用纯前端部署（临时方案）

```bash
# 只启动前端
docker compose up -d frontend
```

---

## 📊 部署进度

### 构建状态（当前）
- 前端：✅ 已成功构建
- 后端：⏳ 需要重新构建

### 构建时间
- 前端：✅ 已完成
- 后端：预计 5-8 分钟

---

## 🎯 推荐操作流程

### 在腾讯云控制台（VNC/Web Shell）

```bash
# 1. 添加用户到 docker 组
sudo usermod -aG docker lighthouse

# 2. 刷新用户组
newgrp docker

# 3. 重新登录
exit
ssh lighthouse@114.132.201.154

# 4. 部署
cd /var/blog
docker compose build
docker compose up -d
docker compose exec -T backend pnpm db:generate && docker compose exec -T backend pnpm db:push
```

---

## ✅ 部署完成后的验证

### 检查服务状态
```bash
docker compose ps
```

### 访问博客
- 前端：http://114.132.201.154:3000
- 后端：http://114.132.201.154:3001

### 查看日志
```bash
docker compose logs -f
```

---

## 🔧 常见问题

### Q1: 权限仍然被拒绝

**解决方案**：
```bash
# 检查 docker 组
getent group docker

# 如果没有 docker 组
sudo groupadd docker

# 再次添加用户
sudo usermod -aG docker lighthouse
```

### Q2: Docker 守护进程异常

**解决方案**：
```bash
# 重启 Docker 服务
sudo systemctl restart docker

# 检查 Docker 状态
sudo systemctl status docker
```

### Q3: 如何查看实时构建进度

**在控制台执行**：
```bash
cd /var/blog
docker compose build
# 实时显示构建进度
```

---

## 🎯 最简单的解决方案

### 如果只是想快速启动服务

```bash
cd /var/blog

# 使用 sudo 启动
sudo docker compose up -d

# 初始化数据库
sudo docker compose exec -T backend pnpm db:generate
sudo docker compose exec -T backend pnpm db:push
```

---

## 📝 下一步操作

**立即执行**（在腾讯云控制台）：

1. **添加到 docker 组**：
   ```bash
   sudo usermod -aG docker lighthouse
   newgrp docker
   exit
   ssh lighthouse@114.132.201.154
   ```

2. **部署服务**：
   ```bash
   cd /var/blog
   docker compose build
   docker compose up -d
   docker compose exec -T backend pnpm db:generate
   docker compose exec -T backend pnpm db:push
   ```

---

**完成后访问**：http://114.132.201.154:3000

---

**重要提示**：
- ✅ 前端 Docker 镜像已经成功构建
- ⚠️ 后端需要重新构建（5-8 分钟）
- 🔧 权限问题：添加 lighthouse 到 docker 组即可
