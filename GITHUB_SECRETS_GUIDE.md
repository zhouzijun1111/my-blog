# GitHub Secrets 一键配置指南

## 🎯 快速配置步骤

### 第一步：打开 GitHub Secrets 配置页面

**点击这个链接直接打开**：
https://github.com/zhouzijun1111/my-blog/settings/secrets/actions

---

### 第二步：添加 4 个 Secrets

点击 "New repository secret" 按钮，逐个添加以下 4 个密钥：

---

## Secret #1: SERVER_HOST

**Name:**
```
SERVER_HOST
```

**Value:**
```
114.132.201.84
```

点击 "Add secret"

---

## Secret #2: SERVER_USER

**Name:**
```
SERVER_USER
```

**Value:**
```
lighthouse
```

点击 "Add secret"

---

## Secret #3: SERVER_PORT

**Name:**
```
SERVER_PORT
```

**Value:**
```
22
```

点击 "Add secret"

---

## Secret #4: SSH_PRIVATE_KEY

**Name:**
```
SSH_PRIVATE_KEY
```

**Value (复制以下全部内容，包括 BEGIN 和 END 行):**

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDO04hpa1F2xgVjWekCktVciLwYLb94H1gkQ2MjZUwBJwAAAJj1U2K09VNi
tAAAAAtzc2gtZWQyNTUxOQAAACDO04hpa1F2xgVjWekCktVciLwYLb94H1gkQ2MjZUwBJw
AAAEBKkoNAVcnrIQDiMmt/ENrBGzehGyIb01IaAOPDUuVrIc7TiGlrUXbGBWNZ6QKS1VyI
vBgtv3gfWCRDYyNlTAEnAAAAFWdpdGh1Yi1hY3Rpb25zLWRlcGxveQ==
-----END OPENSSH PRIVATE KEY-----
```

点击 "Add secret"

---

## ✅ 验证配置

添加完成后，你应该在 Secrets 列表中看到这 4 个密钥：
- ✅ SERVER_HOST
- ✅ SERVER_USER
- ✅ SERVER_PORT
- ✅ SSH_PRIVATE_KEY

---

## 🎉 完成！

配置完成后，你的自动化部署工作流就设置好了！

以后每次推送代码到 main 分支，GitHub Actions 会自动：
1. SSH 连接到服务器
2. 拉取最新代码
3. 重新构建 Docker 镜像
4. 重启服务
5. 更新数据库

**查看部署进度**：https://github.com/zhouzijun1111/my-blog/actions

---

## 📝 注意事项

1. **不要修改这些 Secrets**，除非你的服务器信息发生变化
2. **SSH_PRIVATE_KEY** 是私钥，绝对不要泄露给他人
3. 如果以后修改了服务器密码，SSH 密钥认证仍然有效（因为使用密钥而非密码）
4. 服务器用户名必须是 `lighthouse`（不是 root）
