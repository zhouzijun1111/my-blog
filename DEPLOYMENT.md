# 腾讯云服务器快速部署指南

## 📋 部署前准备

### 需要的信息
- [ ] 腾讯云服务器公网 IP 地址
- [ ] 服务器 root 密码或 SSH 密钥
- [ ] （可选）域名和 SSL 证书

### 本地准备
确保你有以下工具：
- SSH 客户端（Windows 自带或 Git Bash）
- SCP 客户端（用于上传文件，可选）
- 代码编辑器

---

## 🚀 部署步骤

### 第一步：SSH 连接到服务器

在本地 VSCode 终端或 PowerShell 中执行：

```bash
# 连接到腾讯云服务器
ssh root@your_server_ip

# 输入密码后即可进入服务器
```

**提示**: 将 `your_server_ip` 替换为你的实际服务器 IP。

### 第二步：安装 Docker 和 Docker Compose

在服务器上执行以下命令：

```bash
# 1. 更新系统包
sudo apt update && sudo apt upgrade -y

# 2. 安装必要工具
sudo apt install -y curl git

# 3. 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 4. 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 5. 安装 Docker Compose
sudo apt install docker-compose -y

# 6. 验证安装
docker --version
docker-compose --version
```

### 第三步：上传项目到服务器

**方式一：使用 Git（推荐）**

```bash
# 如果你的项目已推送到 GitHub/GitLab
cd /var
sudo mkdir -p blog
cd blog
sudo git clone your_repo_url .

# 如果项目未推送，先推送再克隆
# 在本地执行：
# cd e:\testing
# git init
# git add .
# git commit -m "Initial commit"
# git remote add origin your_repo_url
# git push -u origin main
```

**方式二：使用 SCP（本地执行）**

```bash
# 在本地 PowerShell 中执行
scp -r e:\testing root@your_server_ip:/var/blog
```

### 第四步：配置环境变量

```bash
# 在服务器上进入项目目录
cd /var/blog

# 1. 复制生产环境配置
sudo cp .env.production .env

# 2. 编辑 .env 文件
sudo nano .env
```

**需要修改的配置项**：
```bash
# 替换以下内容：
your_server_ip → 你的服务器 IP

# 生成强随机 JWT_SECRET（在服务器执行）：
openssl rand -base64 32
# 将输出复制到 JWT_SECRET
```

**示例 .env 配置**：
```bash
DATABASE_URL="file:./prod.db"
JWT_SECRET="生成的随机字符串"
CORS_ORIGIN="http://123.45.67.89:3000"
APP_URL="http://123.45.67.89:3000"
NODE_ENV="production"
LOG_LEVEL="warn"
```

### 第五步：构建和启动服务

```bash
# 在 /var/blog 目录执行

# 1. 构建 Docker 镜像
sudo docker-compose build

# 2. 启动服务（后台运行）
sudo docker-compose up -d

# 3. 查看服务状态
sudo docker-compose ps

# 4. 查看日志（确认无错误）
sudo docker-compose logs -f
# 按 Ctrl+C 退出日志查看
```

**期望输出**：
```
NAME                COMMAND             SERVICE    STATUS    PORTS
blog-backend        "node dist/index.js" backend    running   0.0.0.0:3001->3001/tcp
blog-frontend       "/docker-entryp..." frontend   running   0.0.0.0:3000->80/tcp
```

### 第六步：初始化数据库

```bash
# 进入后端容器
sudo docker-compose exec backend sh

# 生成 Prisma Client
pnpm db:generate

# 推送数据库结构
pnpm db:push

# 退出容器
exit
```

### 第七步：配置腾讯云安全组

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
2. 进入「云服务器 CVM」→ 点击你的实例
3. 点击「安全组」→「配置规则」→「添加规则」
4. 添加入站规则：
   - **类型**: 自定义
   - **来源**: 0.0.0.0/0
   - **协议端口**: TCP:3000
   - **策略**: 允许
5. 点击「保存」

### 第八步：访问测试

在浏览器访问：
```
http://your_server_ip:3000
```

**验证清单**：
- [ ] 前端页面正常加载
- [ ] 可以浏览文章列表
- [ ] 可以查看文章详情
- [ ] 点击文章标题能正常跳转
- [ ] 后台管理页面可以访问（如果有）

### 第九步：设置开机自启（可选）

```bash
# 创建 systemd 服务文件
sudo nano /etc/systemd/system/blog.service
```

**添加以下内容**：
```ini
[Unit]
Description=Blog Docker Compose Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/var/blog
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

**启用服务**：
```bash
sudo systemctl enable blog.service
sudo systemctl start blog.service
```

---

## 🔧 常用管理命令

### 查看服务状态
```bash
sudo docker-compose ps
```

### 查看日志
```bash
# 查看所有日志
sudo docker-compose logs -f

# 查看后端日志
sudo docker-compose logs -f backend

# 查看前端日志
sudo docker-compose logs -f frontend
```

### 重启服务
```bash
sudo docker-compose restart
```

### 停止服务
```bash
sudo docker-compose down
```

### 更新代码后重新部署
```bash
cd /var/blog
sudo git pull
sudo docker-compose build
sudo docker-compose up -d
```

### 进入后端容器
```bash
sudo docker-compose exec backend sh
```

### 数据库操作
```bash
# 打开 Prisma Studio（数据库可视化）
sudo docker-compose exec backend sh
pnpm db:studio
# 然后在浏览器访问 http://localhost:5555
```

---

## 🐛 故障排查

### 问题 1: 无法访问前端页面

**检查清单**：
```bash
# 1. 确认容器正在运行
sudo docker-compose ps

# 2. 检查安全组是否开放 3000 端口
# 前往腾讯云控制台检查

# 3. 查看容器日志
sudo docker-compose logs frontend
```

### 问题 2: 前端无法调用后端 API

**检查清单**：
```bash
# 1. 检查 .env 中的 CORS_ORIGIN 配置
cat .env | grep CORS_ORIGIN

# 2. 确认后端容器健康
sudo docker-compose logs backend

# 3. 测试 API 是否正常
curl http://localhost:3001/api/health
```

### 问题 3: 容器启动失败

**解决方法**：
```bash
# 查看详细错误日志
sudo docker-compose logs backend
sudo docker-compose logs frontend

# 重新构建镜像
sudo docker-compose build --no-cache
sudo docker-compose up -d
```

### 问题 4: 数据库文件权限问题

```bash
# 修改数据库文件权限
sudo docker-compose exec backend chmod 644 prod.db
```

### 问题 5: 端口被占用

```bash
# 查看端口占用
sudo netstat -tlnp | grep 3000

# 停止占用端口的服务或更换端口
```

---

## 📈 后续优化

### 1. 配置域名和 HTTPS（推荐）

当你有域名后：

```bash
# 1. 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 2. 申请免费 SSL 证书
sudo certbot certonly --standalone -d yourdomain.com

# 3. 更新 .env 配置
nano .env
# 修改：
# CORS_ORIGIN="https://yourdomain.com"
# APP_URL="https://yourdomain.com"

# 4. 重启服务
sudo docker-compose restart
```

### 2. 配置 Nginx 反向代理（可选）

```bash
# 安装 Nginx
sudo apt install nginx -y

# 创建站点配置
sudo nano /etc/nginx/sites-available/blog
```

**Nginx 配置**：
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**启用配置**：
```bash
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. 配置自动备份（推荐）

创建备份脚本：
```bash
sudo nano /var/blog/backup.sh
```

**备份脚本内容**：
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/blog"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
cp /var/blog/packages/backend/prisma/prod.db $BACKUP_DIR/prod_$DATE.db

# 保留最近 7 天的备份
find $BACKUP_DIR -name "prod_*.db" -mtime +7 -delete

echo "Backup completed: prod_$DATE.db"
```

**添加定时任务**：
```bash
# 赋予执行权限
sudo chmod +x /var/blog/backup.sh

# 添加到 crontab（每天凌晨 2 点备份）
sudo crontab -e
# 添加：0 2 * * * /var/blog/backup.sh >> /var/log/blog-backup.log 2>&1
```

### 4. 升级到 PostgreSQL（高并发场景）

如果你的博客流量增长，可以升级到 PostgreSQL：

**修改 docker-compose.yml**，取消 postgres 服务的注释：
```yaml
postgres:
  image: postgres:15-alpine
  container_name: blog-postgres
  restart: unless-stopped
  ports:
    - "5432:5432"
  environment:
    - POSTGRES_USER=${POSTGRES_USER:-bloguser}
    - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-blogpass}
    - POSTGRES_DB=${POSTGRES_DB:-blogdb}
  volumes:
    - postgres-data:/var/lib/postgresql/data
  networks:
    - blog-network
```

**修改 .env**：
```bash
DATABASE_URL="postgresql://bloguser:blogpass@postgres:5432/blogdb"
```

**更新 Prisma schema**：
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## 📚 参考资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [腾讯云 CVM 文档](https://cloud.tencent.com/document/product/213)
- [Prisma 文档](https://www.prisma.io/docs)

---

## ✅ 部署完成检查清单

- [ ] Docker 和 Docker Compose 安装成功
- [ ] 项目文件已上传到服务器 `/var/blog`
- [ ] `.env` 文件配置正确（特别是 JWT_SECRET）
- [ ] Docker 容器正常启动（2 个服务都在运行）
- [ ] 腾讯云安全组已开放 3000 端口
- [ ] 浏览器可以通过 `http://IP:3000` 访问前端
- [ ] 前端页面正常显示
- [ ] 可以浏览文章列表和详情
- [ ] 数据库已初始化
- [ ] （可选）开机自启动已配置

---

**部署时间**: 约 30-45 分钟
**支持**: 如遇问题，请查看上方故障排查章节
