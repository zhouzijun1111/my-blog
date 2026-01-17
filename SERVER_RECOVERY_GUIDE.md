# 🚨 服务器重启循环 - 紧急恢复指南

## 问题诊断
服务器无限重启，通常由以下原因导致：
1. systemd 服务配置错误（blog.service）
2. Docker 服务启动失败
3. 系统资源不足（内存/磁盘）
4. 内核错误或驱动问题

---

## 🎯 立即执行步骤

### 步骤 1：通过腾讯云控制台访问服务器

#### 方法 A：使用 VNC 控制台（推荐）
1. 登录 https://console.cloud.tencent.com/
2. 进入 **云服务器 CVM**
3. 选择实例：114.132.201.84
4. 点击 **登录** 按钮
5. 选择 **VNC 登录**（或类似方式）
6. 进入服务器控制台

#### 方法 B：使用腾讯云的 Web Shell
1. 在实例详情页找到 **终端** 或 **Shell** 入口
2. 点击打开 Web Shell

---

### 步骤 2：禁用有问题的服务

进入服务器后，立即执行以下命令：

```bash
# 1. 停止 blog.service（如果它在导致重启循环）
sudo systemctl stop blog.service
sudo systemctl disable blog.service

# 2. 检查系统日志，查看重启原因
sudo journalctl -xe --no-pager | tail -50

# 3. 检查 Docker 服务状态
sudo systemctl status docker

# 4. 检查磁盘空间
df -h

# 5. 检查内存使用
free -h

# 6. 检查最近的系统消息
dmesg | tail -50
```

---

### 步骤 3：修复服务器配置

#### 如果 blog.service 导致问题

```bash
# 删除 blog.service
sudo rm /etc/systemd/system/blog.service
sudo systemctl daemon-reload

# 检查是否还有其他问题服务
sudo systemctl list-units --failed
```

#### 如果 Docker 导致问题

```bash
# 停止 Docker
sudo systemctl stop docker
sudo systemctl disable docker

# 清理 Docker 容器
sudo docker rm -f $(sudo docker ps -aq) 2>/dev/null

# 重新启动 Docker（如果需要）
sudo systemctl start docker
sudo systemctl enable docker
```

#### 查看详细错误日志

```bash
# 查看系统启动日志
sudo journalctl -b -1 --no-pager | tail -100

# 查看内核日志
sudo dmesg -T | tail -100

# 查看 SSH 服务日志
sudo journalctl -u sshd -f
```

---

### 步骤 4：重新配置正确的自动启动

**安全的方式 - 使用 root 的 crontab**

```bash
# 编辑 root 的 crontab
sudo crontab -e

# 添加以下行（开机后 30 秒启动服务）：
@reboot sleep 30 && cd /var/blog && /usr/bin/docker-compose up -d
```

**或者使用 rc.local（Ubuntu 20.04+ 需要手动启用）**

```bash
# 1. 创建 rc.local 文件
sudo nano /etc/rc.local

# 2. 添加以下内容：
#!/bin/bash
sleep 30
cd /var/blog
/usr/bin/docker-compose up -d
exit 0

# 3. 保存后，添加执行权限
sudo chmod +x /etc/rc.local

# 4. 启用 rc.local
sudo systemctl enable rc-local
```

---

### 步骤 5：验证修复

```bash
# 1. 重启服务器测试（谨慎！）
sudo reboot

# 2. 如果问题解决，重新配置服务
cd /var/blog
sudo docker compose ps
sudo docker compose up -d
```

---

## 🔧 如果无法通过控制台访问

### 联系腾讯云技术支持

1. 提交工单：https://console.cloud.tencent.com/ticket
2. 描述问题：服务器重启循环
3. 提供实例 ID：114.132.201.84
4. 请求协助：进入救援模式或重装系统

### 使用腾讯云的救援模式

1. 在控制台选择实例
2. 点击 **更多操作** → **实例设置** → **救援模式**
3. 按照指引进入救援系统
4. 挂载原磁盘并修复配置

---

## 📝 预防措施（问题解决后）

### 不要使用有问题的 systemd 服务

**避免配置**：
```bash
# 不要使用这个服务（可能导致问题）
/etc/systemd/system/blog.service
```

**推荐使用**：
1. **Docker 的 restart 策略**（docker-compose.yml 中已配置）
2. **crontab 的 @reboot**（更安全）
3. **rc.local**（传统方式，但可靠）

---

### 正确的自动启动配置

**docker-compose.yml 已配置了 restart 策略**：
```yaml
services:
  backend:
    restart: unless-stopped  # ✅ Docker 自带的重启策略
  frontend:
    restart: unless-stopped
```

**额外保险 - 使用 crontab**：
```bash
sudo crontab -e
# 添加：
@reboot sleep 30 && cd /var/blog && /usr/bin/docker-compose up -d
```

---

## 🎯 快速恢复流程

1. **通过 VNC 登录服务器**
2. **停止并禁用 blog.service**
3. **检查系统日志找出原因**
4. **修复配置**
5. **使用更安全的自动启动方式**
6. **测试重启**

---

## 📞 需要帮助

如果以上步骤无法解决：
1. 腾讯云技术支持：https://console.cloud.tencent.com/ticket
2. 服务器救援模式
3. 考虑重装系统（最后手段）

---

**重要**：先通过控制台访问服务器，禁用 blog.service，然后找出真正的问题原因。
