import { FastifyInstance } from 'fastify'
import { SubscriptionService } from '../services/subscription.service'
import { authenticateToken } from '../middleware/auth'
import { validateBody } from '../middleware/validation'
import { z } from 'zod'

/**
 * 订阅请求体类型
 */
interface SubscribeBody {
  email: string
}

interface UnsubscribeBody {
  email: string
}

/**
 * 订阅路由
 * 定义所有订阅相关的 API 端点
 */
export async function subscriptionRoutes(fastify: FastifyInstance) {
  const subscriptionService = new SubscriptionService(fastify.prisma)

  // 验证 Schema
  const subscribeSchema = z.object({
    email: z.string().email('邮箱格式不正确')
  })

  // 公开路由：邮件订阅
  fastify.post('/api/subscribe', {
    preHandler: validateBody(subscribeSchema)
  }, async (request, reply) => {
    try {
      const { email } = request.body as SubscribeBody

      const result = await subscriptionService.subscribe(email)

      return reply.send({
        success: true,
        data: result
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'SUBSCRIBE_FAILED',
          message: error.message || '订阅失败'
        }
      })
    }
  })

  // 公开路由：验证邮箱
  fastify.get('/api/subscribe/verify', async (request, reply) => {
    try {
      const { token } = request.query as { token?: string }

      if (!token) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: '验证链接无效'
          }
        })
      }

      const result = await subscriptionService.verifyEmail(token)

      return reply.send({
        success: true,
        data: result
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VERIFY_FAILED',
          message: error.message || '验证失败'
        }
      })
    }
  })

  // 公开路由：取消订阅
  fastify.delete('/api/subscribe', {
    preHandler: validateBody(subscribeSchema)
  }, async (request, reply) => {
    try {
      const { email } = request.body as UnsubscribeBody

      const result = await subscriptionService.unsubscribe(email)

      return reply.send({
        success: true,
        data: result
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'UNSUBSCRIBE_FAILED',
          message: error.message || '取消订阅失败'
        }
      })
    }
  })

  // 公开路由：RSS 订阅
  fastify.get('/rss.xml', async (request, reply) => {
    try {
      const host = request.headers.host || 'localhost:3001'
      const protocol = request.protocol || 'http'
      const baseUrl = `${protocol}://${host}`

      const xml = await subscriptionService.generateRSSFeed(baseUrl)

      reply.type('application/rss+xml').send(xml)
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        error: {
          code: 'RSS_GENERATE_FAILED',
          message: error.message || '生成 RSS 失败'
        }
      })
    }
  })

  // 管理员路由：获取所有订阅者
  fastify.get('/admin/subscriptions', {
    onRequest: [authenticateToken]
  }, async (request, reply) => {
    try {
      const { page = '1', pageSize = '20' } = request.query as { page?: string; pageSize?: string }

      const result = await subscriptionService.getAllSubscribers(
        parseInt(page),
        parseInt(pageSize)
      )

      return reply.send({
        success: true,
        data: result
      })
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || '获取订阅列表失败'
        }
      })
    }
  })
}
