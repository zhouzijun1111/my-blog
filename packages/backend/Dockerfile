# ==================== 构建阶段 ====================
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制根目录的 workspace 和 lock 文件
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# 复制后端 package.json
COPY packages/backend/package.json ./packages/backend/

# 安装 pnpm
RUN npm install -g pnpm@8

# 安装依赖
RUN pnpm install 

# 复制后端源码
COPY packages/backend ./packages/backend/

# 生成 Prisma Client
WORKDIR /app/packages/backend
RUN npx prisma generate

# 构建项目
RUN pnpm run build

# ==================== 生产阶段 ====================
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm@8

# 复制根目录的 workspace 和 lock 文件
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/backend/package.json ./packages/backend/

# 仅安装生产依赖
RUN pnpm install --prod 

# 从构建阶段复制文件
COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=builder /app/packages/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/packages/backend/prisma ./prisma

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 更改文件所有者
RUN chown -R nodejs:nodejs /app

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/index.js"]
