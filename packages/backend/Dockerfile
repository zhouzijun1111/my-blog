# ==================== 单阶段构建（使用 Alpine 3.18 以获得 libssl1.1 支持）====================
FROM node:18-alpine3.18

# 安装 SSL 库（Prisma 需要 libssl.so.1.1）
RUN apk add --no-cache libssl1.1 libcrypto1.1

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@8

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 复制根目录的 workspace 和 lock 文件
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# 复制后端 package.json
COPY packages/backend/package.json ./packages/backend/

# 安装所有依赖
RUN pnpm install

# 复制后端源码
COPY packages/backend ./packages/backend/

# 设置工作目录为后端目录
WORKDIR /app/packages/backend

# 生成 Prisma Client
RUN npx prisma generate

# 构建项目
RUN pnpm run build

# 设置文件所有者
RUN chown -R nodejs:nodejs /app

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/index.js"]
