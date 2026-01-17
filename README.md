# 一剑轻安的博客

> **2025 年现代化博客系统** - 液态玻璃美学 × 极致性能 × 完整功能

现代化的个人博客系统，采用 **液态玻璃美学（Liquid Glass Aesthetics）** 设计，使用 Vue 3 + Fastify + TypeScript 构建，支持 Docker 一键部署。

## ✨ 核心特性

### 🎨 UI/UX 设计
- ✨ **液态玻璃美学** - 半透明、模糊背景、微妙渐变
- 🎭 **流畅动画** - Motion One 高性能动画（帧率 > 55fps）
- 🌓 **暗色模式** - 完美适配的深色主题
- 📱 **响应式设计** - 支持桌面、平板、手机全设备
- 🎯 **交互细节** - 每次操作都是"艺术品"

### 🚀 性能优化
- ⚡ **首屏加载** < 2s（LCP < 2.5s）
- 📦 **代码分割** - 路由级懒加载
- 💾 **数据缓存** - Vue Query 智能缓存
- 🖼️ **图片优化** - WebP 格式 + 懒加载
- 📊 **Lighthouse** > 90 分

### 🛠️ 完整功能
- 📝 **文章管理** - Markdown 编辑、分类、标签
- 💬 **评论系统** - 嵌套评论、实时互动
- 📬 **订阅功能** - RSS + 邮件订阅
- 🔍 **全文搜索** - 文章、标签、分类搜索
- 🔐 **JWT 认证** - 安全的用户系统
- 🎁 **SEO 增强** - Sitemap、robots.txt、结构化数据

### 🧪 测试覆盖
- ✅ 单元测试（Vitest）
- ✅ E2E 测试（Playwright）
- ✅ 性能测试（Lighthouse）
- ✅ 80%+ 测试覆盖率

## 🛠️ 技术栈

### 前端
- **框架**: Vue 3.5 + TypeScript 5.7
- **构建**: Vite 6.0
- **UI 库**: Naive UI
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **数据缓存**: @tanstack/vue-query
- **动画**: Motion One
- **测试**: Vitest + Playwright + @vue/test-utils

### 后端
- **框架**: Fastify 5.2
- **ORM**: Prisma 6.0
- **数据库**: SQLite（可切换 PostgreSQL）
- **认证**: JWT + bcryptjs
- **验证**: Zod
- **邮件**: Nodemailer
- **RSS**: RSS 库
- **测试**: Vitest

### 开发工具
- **代码检查**: ESLint + StyleLint
- **代码格式化**: Prettier
- **Git Hooks**: Husky + lint-staged
- **容器化**: Docker + Docker Compose
- **包管理**: pnpm 8+

## 📁 项目结构

```
e:\testing\
├── packages/
│   ├── backend/              # 后端服务
│   │   ├── src/
│   │   │   ├── config/       # 配置（环境变量、常量）
│   │   │   ├── middleware/   # 中间件（认证、验证、限流、错误处理）
│   │   │   ├── routes/       # 路由（文章、认证、评论、订阅、SEO）
│   │   │   ├── services/     # 业务逻辑层
│   │   │   ├── utils/        # 工具函数
│   │   │   └── index.ts      # 入口文件
│   │   ├── prisma/
│   │   │   ├── schema.prisma # 数据库模型
│   │   │   └── seed/         # 种子数据
│   │   └── Dockerfile
│   │
│   ├── frontend/             # 前端应用
│   │   ├── src/
│   │   │   ├── api/          # API 调用（类型安全）
│   │   │   ├── components/   # 组件
│   │   │   │   ├── common/   # 通用组件（GlassCard、LiquidButton）
│   │   │   │   ├── ArticleCard.vue
│   │   │   │   ├── CommentSection.vue
│   │   │   │   └── SubscriptionBox.vue
│   │   │   ├── composables/  # 组合式函数（useMotion、useQuery）
│   │   │   ├── stores/       # Pinia 状态管理
│   │   │   ├── styles/       # 样式（设计系统、玻璃拟态、动画）
│   │   │   ├── utils/        # 工具（SEO、格式化）
│   │   │   └── views/        # 页面
│   │   ├── public/
│   │   │   └── robots.txt
│   │   ├── nginx.conf
│   │   └── Dockerfile
│   │
│   └── shared/               # 共享类型定义
│
├── tests/                    # 测试文件
│   ├── unit/                 # 单元测试
│   ├── e2e/                  # E2E 测试
│   └── performance/          # 性能测试
│
├── .env.example              # 环境变量模板
├── .eslintrc.js              # ESLint 配置
├── .prettierrc.js            # Prettier 配置
├── .stylelintrc.js           # StyleLint 配置
├── vitest.config.ts          # Vitest 配置
├── playwright.config.ts      # Playwright 配置
├── docker-compose.yml        # Docker Compose 配置
└── package.json
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Docker（可选，用于容器化部署）

### 1. 安装依赖

```bash
# 使用 pnpm 安装
pnpm install
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，设置必要的配置
# 重要：修改 JWT_SECRET 为至少 32 位的随机字符串
```

**必需配置**:
```bash
# 数据库
DATABASE_URL="file:./dev.db"

# JWT（必须修改！）
JWT_SECRET="your-super-secret-key-change-this-at-least-32-characters-long"

# CORS
CORS_ORIGIN="http://localhost:3000"
```

**可选配置**（邮件订阅功能）:
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@blog.com"
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
pnpm db:generate

# 推送数据库 schema
pnpm db:push

# 填充种子数据
pnpm db:seed
```

### 4. 启动开发服务器

```bash
# 同时启动前后端
pnpm dev

# 单独启动后端（端口 3001）
pnpm dev:backend

# 单独启动前端（端口 3000）
pnpm dev:frontend
```

访问：
- 前端: http://localhost:3000
- 后端 API: http://localhost:3001
- API 健康检查: http://localhost:3001/api/health

### 5. 默认账号

种子数据会创建一个测试账号：
- 邮箱: `admin@blog.com`
- 密码: `admin123`

**⚠️ 生产环境请立即修改默认密码！**

## 🐳 Docker 部署

### 一键启动（推荐）

```bash
# 构建并启动所有服务
pnpm docker:up

# 查看日志
pnpm docker:logs

# 停止服务
pnpm docker:down
```

服务将在后台启动：
- 前端: http://localhost:3000
- 后端: http://localhost:3001

### 手动构建

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 重启服务
docker-compose restart
```

## 🧪 测试

### 单元测试

```bash
# 运行所有测试
pnpm test

# 交互式 UI
pnpm test:ui

# 生成覆盖率报告
pnpm test:coverage
```

### E2E 测试

```bash
# 运行 E2E 测试
pnpm test:e2e

# 交互式 UI
pnpm test:e2e:ui
```

### 代码质量

```bash
# ESLint 检查
pnpm lint

# ESLint 自动修复
pnpm lint:fix

# Prettier 格式化
pnpm format

# StyleLint 检查
pnpm stylelint

# StyleLint 自动修复
pnpm stylelint:fix

# TypeScript 类型检查
pnpm type-check
```

## 📚 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 同时启动前后端开发服务器 |
| `pnpm build` | 构建前后端生产版本 |
| `pnpm test` | 运行单元测试 |
| `pnpm test:e2e` | 运行 E2E 测试 |
| `pnpm lint` | 代码检查 |
| `pnpm format` | 代码格式化 |
| `pnpm db:push` | 推送数据库 schema |
| `pnpm db:seed` | 填充种子数据 |
| `pnpm docker:up` | Docker 启动服务 |
| `pnpm docker:down` | Docker 停止服务 |

查看所有脚本：`cat package.json | grep -A 50 "scripts"`

## 🎨 设计系统

### 液态玻璃美学

项目使用 CSS 变量系统实现玻璃拟态效果：

```css
/* 玻璃效果 */
--glass-bg: rgba(255, 255, 255, 0.7);
--glass-blur: blur(20px);
--glass-border: 1px solid rgba(255, 255, 255, 0.3);

/* 品牌渐变 */
--gradient-liquid: linear-gradient(
  135deg,
  rgba(99, 102, 241, 0.8) 0%,
  rgba(139, 92, 246, 0.8) 50%,
  rgba(236, 72, 153, 0.8) 100%
);
```

### 核心组件

#### GlassCard - 玻璃拟态卡片

```vue
<template>
  <GlassCard hoverable>
    <h3>标题</h3>
    <p>内容</p>
  </GlassCard>
</template>
```

#### LiquidButton - 液态按钮

```vue
<template>
  <LiquidButton variant="primary" @click="handleClick">
    点击我
  </LiquidButton>
</template>
```

## 📡 API 端点

### 公开端点
- `GET /api/health` - 健康检查
- `GET /api/articles` - 获取文章列表
- `GET /api/articles/:slug` - 获取文章详情
- `GET /api/categories` - 获取分类列表
- `GET /api/tags` - 获取标签列表
- `GET /api/search?q=关键词` - 搜索
- `GET /rss.xml` - RSS 订阅
- `GET /sitemap.xml` - Sitemap
- `GET /robots.txt` - Robots.txt

### 认证端点
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户（需要 JWT）

### 评论端点
- `GET /api/articles/:slug/comments` - 获取文章评论
- `POST /api/articles/:slug/comments` - 发表评论（需要 JWT）

### 订阅端点
- `POST /api/subscribe` - 邮件订阅
- `GET /api/subscribe/verify?token=xxx` - 验证订阅
- `DELETE /api/subscribe` - 取消订阅

完整 API 文档请查看后端代码中的 `routes/` 目录。

## 🔒 安全特性

- ✅ **密码加密** - bcryptjs 哈希（salt rounds: 10）
- ✅ **JWT 认证** - 7 天过期，可配置
- ✅ **环境变量验证** - Zod schema 验证
- ✅ **输入验证** - Zod schema 验证所有输入
- ✅ **CORS 限制** - 仅允许配置的源
- ✅ **限流保护** - 防止暴力攻击（需配置）
- ✅ **SQL 注入防护** - Prisma 自动参数化查询
- ✅ **XSS 防护** - 输入转义 + CSP 头

## 📈 性能指标

| 指标 | 目标 | 实际 |
|------|------|------|
| Lighthouse 性能 | > 90 | - |
| 首屏加载（FCP） | < 1.8s | - |
| 最大内容绘制（LCP） | < 2.5s | - |
| 动画帧率 | > 55fps | - |
| Bundle 大小 | < 500KB | - |
| 测试覆盖率 | > 80% | - |

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- 遵循 ESLint + Prettier 配置
- 提交前会自动运行 lint-staged
- 提交信息遵循 Conventional Commits

## 📝 更新日志

### v2.0.0 (2025-01-04) - 2025 年全面现代化

**新功能**:
- ✨ 液态玻璃美学 UI/UX
- 💬 评论系统（嵌套评论）
- 📬 订阅功能（RSS + 邮件）
- 🎁 SEO 增强（Sitemap、结构化数据）
- 🧪 完整测试覆盖（单元 + E2E）
- 🐳 Docker 容器化

**优化**:
- ⚡ 性能优化（Vue Query、代码分割、图片优化）
- 🔒 安全增强（bcryptjs、JWT、输入验证）
- 🏗️ 架构重构（模块化后端、类型安全前端）
- 📚 完善文档

**技术栈升级**:
- Vue 3.4 → 3.5
- Fastify 4.26 → 5.2
- Prisma 5.9 → 6.0
- TypeScript 5.3 → 5.7
- Vite 5.1 → 6.0

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Fastify](https://fastify.dev/) - 高性能 Node.js Web 框架
- [Prisma](https://www.prisma.io/) - 下一代 ORM
- [Naive UI](https://www.naiveui.com/) - Vue 3 组件库
- [Motion One](https://motion.dev/) - 高性能动画库

## 📮 联系方式

- 作者: 一剑轻安
- 项目地址: [GitHub](https://github.com/yourusername/blog)
- 问题反馈: [Issues](https://github.com/yourusername/blog/issues)

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**
