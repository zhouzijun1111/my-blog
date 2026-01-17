import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import helmet from '@fastify/helmet'
import { PrismaClient } from '@prisma/client'
import { env } from './config/env'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { authenticateToken } from './middleware/auth'
import { validateBody, authSchemas } from './middleware/validation'
import { AuthService } from './services/auth.service'
import { commentRoutes } from './routes/comments'
import { subscriptionRoutes } from './routes/subscription'
import { sitemapRoutes } from './routes/sitemap'
import { robotsRoutes } from './routes/robots'
import { articleRoutes } from './routes/articles'
import { categoryRoutes } from './routes/categories'
import { tagRoutes } from './routes/tags'

const prisma = new PrismaClient()
const server = Fastify({
  logger: true,
})

// 暴露 Prisma 实例给路由使用
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
    authenticate: typeof import('./middleware/auth').authenticateToken
  }
}

server.decorate('prisma', prisma)

// 添加认证辅助方法
server.decorate('authenticate', authenticateToken)

// 注册插件
async function start() {
  // CORS 配置（使用环境变量）
  await server.register(cors, {
    origin: env.CORS_ORIGIN.split(','),
    credentials: true,
  })

  // Helmet 安全头部配置
  await server.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  })

  // JWT 配置（使用环境变量）
  await server.register(jwt, {
    secret: env.JWT_SECRET,
  })

  // 全局错误处理
  server.setErrorHandler(errorHandler)

  // 404 处理
  server.setNotFoundHandler(notFoundHandler)

  // 健康检查
  server.get('/api/health', async () => {
    return { success: true, message: 'OK', timestamp: new Date().toISOString() }
  })

  // ========== 搜索路由 ==========

  server.get('/api/search', async (request) => {
    const { q } = request.query as { q?: string }
    if (!q) {
      return { success: true, data: { articles: [], tags: [], categories: [] } }
    }

    const [articles, tags, categories] = await Promise.all([
      prisma.article.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: q } },
            { content: { contains: q } },
            { excerpt: { contains: q } },
          ],
        },
        include: { category: true, tags: true },
        take: 10,
      }),
      prisma.tag.findMany({
        where: {
          OR: [{ name: { contains: q } }, { slug: { contains: q } }]
        }
      }),
      prisma.category.findMany({
        where: {
          OR: [{ name: { contains: q } }, { slug: { contains: q } }]
        }
      }),
    ])

    return { success: true, data: { articles, tags, categories } }
  })

  // ========== 认证路由 ==========
  const authService = new AuthService(prisma)

  server.post('/api/auth/register', {
    preHandler: validateBody(authSchemas.register)
  }, async (request, reply) => {
    try {
      const { email, username, password } = request.body as any
      const user = await authService.register(email, username, password)

      // 生成 JWT token
      const token = server.jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
      })

      return { success: true, data: { token, user } }
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'REGISTER_FAILED', message: error.message }
      })
    }
  })

  server.post('/api/auth/login', {
    preHandler: validateBody(authSchemas.login)
  }, async (request, reply) => {
    try {
      const { email, password } = request.body as any
      const user = await authService.login(email, password)

      // 生成 JWT token
      const token = server.jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
      })

      return { success: true, data: { token, user } }
    } catch (error: any) {
      return reply.status(401).send({
        success: false,
        error: { code: 'LOGIN_FAILED', message: error.message }
      })
    }
  })

  server.get('/api/auth/me', {
    onRequest: [async (request, reply) => {
      try {
        await request.jwtVerify()
      } catch (err) {
        return reply.status(401).send({
          success: false,
          error: { code: 'UNAUTHORIZED', message: '未授权访问' }
        })
      }
    }]
  }, async (request) => {
    const userId = (request.user as any).id
    const user = await authService.getUserById(userId)
    return { success: true, data: user }
  })

  // ========== 注册模块化路由 ==========
  await server.register(articleRoutes)
  await server.register(categoryRoutes)
  await server.register(tagRoutes)
  await server.register(commentRoutes)
  await server.register(subscriptionRoutes)
  await server.register(sitemapRoutes)
  await server.register(robotsRoutes)

  // ========== 启动服务器 ==========
  try {
    await server.listen({ port: 3001, host: '0.0.0.0' })
    console.log('🚀 Server ready at http://localhost:3001')
    console.log('📚 API Documentation: http://localhost:3001/api/health')
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
