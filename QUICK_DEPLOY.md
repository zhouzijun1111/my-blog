# 快速部署指南 - 腾讯云服务器

## 服务器信息
- **IP 地址**: 114.132.201.84
- **访问地址**: http://114.132.201.84:3000
- **部署方式**: GitHub Actions 自动部署

---

## 第一部分：推送到 GitHub（3 分钟）

### 1. 创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名称：例如 `my-blog` 或 `blog-system`
3. **重要**：不要勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

### 2. 推送代码到 GitHub

在 VSCode 终端或 PowerShell 中执行：

```bash
cd e:\testing

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/zhouzijun1111/my-blog.git

# 推送代码
git branch -M main
git push -u origin main
```

**推送成功后，你的代码就上传到 GitHub 了！**

---

## 第二部分：配置 GitHub Secrets（5 分钟）

### 3. 生成 SSH 密钥对

在本地 PowerShell 执行：

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# 查看私钥（复制整个输出，包括 BEGIN 和 END 行）
cat ~/.ssh/github_deploy

# 查看公钥（复制整个输出）
cat ~/.ssh/github_deploy.pub
```

### 4. 添加公钥到服务器

```bash
# 方法 1：自动添加（推荐）
ssh-copy-id -i ~/.ssh/github_deploy.pub root@114.132.201.84

# 方法 2：手动添加
ssh root@114.132.201.84
mkdir -p ~/.ssh
echo "粘贴你的公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

### 5. 配置 GitHub Secrets

1. 进入 GitHub 仓库页面
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**，添加以下 4 个密钥：

| Secret 名称 | 值 | 从哪里获取 |
|------------|-----|-----------|
| `SERVER_HOST` | `114.132.201.84` | 直接复制 |
| `SERVER_USER` | `root` | 直接复制 |
| `SERVER_PORT` | `22` | 直接复制 |
| `SSH_PRIVATE_KEY` | 上面的私钥内容 | `cat ~/.ssh/github_deploy` 的输出 |

**提示**：添加 `SSH_PRIVATE_KEY` 时，要复制整个私钥，包括：
```
-----BEGIN OPENSSH PRIVATE KEY-----
...（很多行）...
-----END OPENSSH PRIVATE KEY-----
```

---

## 第三部分：初始化服务器（10 分钟）

### 6. SSH 连接到服务器

```bash
ssh root@114.132.201.84
# 输入服务器密码
```

### 7. 执行一键初始化脚本

```bash
# 方法 1：从 GitHub 执行（推荐）
curl -fsSL https://raw.githubusercontent.com/YOUR_USERNAME/blog/main/scripts/init-server.sh | bash

# 方法 2：手动执行
mkdir -p /root/scripts
nano /root/scripts/init-server.sh
# 粘贴 scripts/init-server.sh 的内容
chmod +x /root/scripts/init-server.sh
/root/scripts/init-server.sh
```

**脚本会自动完成**：
- ✅ 安装 Docker 和 Docker Compose
- ✅ 克隆你的 GitHub 仓库
- ✅ 配置环境变量
- ✅ 构建 Docker 镜像
- ✅ 启动服务
- ✅ 初始化数据库
- ✅ 配置开机自启

### 8. 配置腾讯云安全组

1. 登录 https://console.cloud.tencent.com/
2. 进入 **云服务器 CVM**
3. 找到实例 `114.132.201.84`
4. 点击 **安全组** → **配置规则** → **添加规则**
5. 添加入站规则：
   - **类型**: 自定义
   - **来源**: 0.0.0.0/0
   - **协议端口**: TCP:3000
   - **策略**: 允许
6. 点击 **保存**

---

## 第四部分：验证部署（2 分钟）

### 9. 访问你的博客

在浏览器打开：**http://114.132.201.84:3000**

**检查清单**：
- [ ] 页面正常加载
- [ ] 可以浏览文章
- [ ] 后台管理可以访问（http://114.132.201.84:3000/login）

---

## 日常使用：本地修改 → 自动部署

### 以后修改代码后，只需：

```bash
# 1. 修改代码
# ... 在 VSCode 中编辑文件 ...

# 2. 提交到 GitHub
git add .
git commit -m "更新功能描述"
git push

# ✅ GitHub Actions 会自动部署到服务器（2-3 分钟）
```

### 查看部署进度

1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 查看最新的部署任务
4. 点击任务查看详细日志

---

## 常用命令

### 服务器管理

```bash
# SSH 到服务器
ssh root@114.132.201.84

# 查看服务状态
cd /var/blog && docker-compose ps

# 查看日志
cd /var/blog && docker-compose logs -f

# 重启服务
cd /var/blog && docker-compose restart

# 手动更新代码
cd /var/blog && git pull origin main
```

---

## 故障排查

### GitHub Actions 部署失败

**检查清单**：
1. GitHub Secrets 是否正确配置（4 个密钥）
2. SSH 密钥是否已添加到服务器：`ssh root@114.132.201.84`
3. 服务器上代码是否已克隆：`ls /var/blog`

**调试方法**：
```bash
# 本地测试 SSH 连接
ssh -i ~/.ssh/github_deploy root@114.132.201.84
```

### 无法访问前端页面

**检查清单**：
1. 腾讯云安全组是否开放 3000 端口
2. Docker 容器是否运行：`ssh root@114.132.201.84 "cd /var/blog && docker-compose ps"`
3. 防火墙状态：`ssh root@114.132.201.84 "sudo ufw status"`

---

## 下一步：配置域名和 HTTPS（可选）

当你有域名后：

1. **解析域名到服务器**
   - A 记录：`@` → `114.132.201.84`
   - 等待 DNS 生效（5-10 分钟）

2. **申请 SSL 证书**
   ```bash
   ssh root@114.132.201.84
   apt install certbot python3-certbot-nginx -y
   certbot certonly --standalone -d yourdomain.com
   ```

3. **更新配置**
   - 修改 `.env.production`：
     ```bash
     CORS_ORIGIN="https://yourdomain.com"
     APP_URL="https://yourdomain.com"
     ```
   - 提交并推送：`git add . && git commit -m "Configure domain" && git push`

---

## 需要帮助？

- 查看详细文档：[DEPLOYMENT.md](./DEPLOYMENT.md)
- 检查 GitHub Actions 日志
- 查看服务器日志：`ssh root@114.132.201.84 "cd /var/blog && docker-compose logs -f"`

---

**预计部署时间**：20-30 分钟（首次）
**后续更新时间**：2-3 分钟（每次 git push）
