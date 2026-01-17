# 完成部署配置（只需 10 分钟）

## ✅ 已完成
- [x] 代码已推送到 GitHub: https://github.com/zhouzijun1111/my-blog
- [x] SSH 密钥对已生成

---

## 📝 接下来 3 个简单步骤

### 步骤 1：添加 SSH 公钥到服务器（2 分钟）

在 VSCode 终端执行：

```bash
ssh root@114.132.201.84
```

**输入服务器密码后，执行以下命令：**

```bash
mkdir -p ~/.ssh
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIM7TiGlrUXbGBWNZ6QKS1VyIvBgtv3gfWCRDYyNlTAEn github-actions-deploy' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
echo '✅ 公钥已添加'
exit
```

**验证 SSH 密钥是否配置成功：**

```bash
ssh -i ~/.ssh/github_deploy root@114.132.201.84
```

如果不需要输入密码就能登录，说明配置成功！

---

### 步骤 2：配置 GitHub Secrets（3 分钟）

1. **打开 GitHub Secrets 设置页面：**

   https://github.com/zhouzijun1111/my-blog/settings/secrets/actions

2. **点击 "New repository secret"，添加以下 4 个密钥：**

   #### 密钥 1：SERVER_HOST
   - Name: `SERVER_HOST`
   - Value: `114.132.201.84`

   #### 密钥 2：SERVER_USER
   - Name: `SERVER_USER`
   - Value: `root`

   #### 密钥 3：SERVER_PORT
   - Name: `SERVER_PORT`
   - Value: `22`

   #### 密钥 4：SSH_PRIVATE_KEY
   - Name: `SSH_PRIVATE_KEY`
   - Value: 复制以下全部内容（包括 BEGIN 和 END 行）

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

### 步骤 3：初始化服务器（5 分钟）

1. **SSH 到服务器：**
   ```bash
   ssh root@114.132.201.84
   ```

2. **执行一键初始化脚本：**
   ```bash
   curl -fsSL https://raw.githubusercontent.com/zhouzijun1111/my-blog/main/scripts/init-server.sh | bash
   ```

   脚本会自动完成：
   - ✅ 安装 Docker 和 Docker Compose
   - ✅ 克隆你的 GitHub 仓库
   - ✅ 配置环境变量
   - ✅ 构建 Docker 镜像
   - ✅ 启动服务
   - ✅ 初始化数据库

3. **配置腾讯云安全组：**
   - 登录 https://console.cloud.tencent.com/
   - 进入 **云服务器 CVM** → 选择实例 `114.132.201.84`
   - 点击 **安全组** → **配置规则** → **添加规则**
   - 添加入站规则：
     - 类型：自定义
     - 来源：0.0.0.0/0
     - 协议端口：TCP:3000
     - 策略：允许
   - 点击 **保存**

---

## 🎉 完成！

访问你的博客：**http://114.132.201.84:3000**

---

## 🔄 日常开发流程

以后修改代码后，只需：

```bash
cd e:\testing
git add .
git commit -m "更新描述"
git push
```

**GitHub Actions 会自动部署到服务器（2-3 分钟）！**

在 GitHub 仓库的 **Actions** 标签页可以看到部署进度。

---

## 🔍 常用命令

```bash
# 查看服务器日志
ssh root@114.132.201.84
cd /var/blog && docker-compose logs -f

# 重启服务
cd /var/blog && docker-compose restart

# 查看服务状态
cd /var/blog && docker-compose ps
```

---

**需要帮助？** 查看 [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)
