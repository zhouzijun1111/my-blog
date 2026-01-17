import { FastifyInstance } from 'fastify'
import rateLimit from '@fastify/rate-limit'

/**
 * 限流配置
 * 防止恶意请求和暴力攻击
 */
export const rateLimitConfig = {
  // 全局限流
  global: {
    max: 1000, // 每个 IP 最多 1000 次请求
    timeWindow: '1 minute', // 每分钟重置
    cache: 10000, // 缓存 10000 个 IP 的计数
    allowList: ['localhost', '127.0.0.1'], // 本地开发不限流
    addHeaders: {
      'x-ratelimit-limit': true,
      'x-ratelimit-remaining': true,
      'x-ratelimit-reset': true
    }
  },

  // 认证相关限流（登录、注册）
  auth: {
    max: 5, // 每个 IP 最多 5 次请求
    timeWindow: '1 minute', // 每分钟重置
    skipSuccessfulRequests: false
  },

  // API 限流
  api: {
    max: 100, // 每个 IP 最多 100 次请求
    timeWindow: '1 minute', // 每分钟重置
    skipSuccessfulRequests: false
  },

  // 评论限流（防止垃圾评论）
  comment: {
    max: 3, // 每个 IP 最多 3 次评论
    timeWindow: '5 minutes', // 5 分钟内
    skipSuccessfulRequests: false
  }
}

/**
 * 注册限流插件
 * 使用方法：在 server.register 中调用
 *
 * @example
 * await server.register(rateLimit, rateLimitConfig.global)
 * await server.register(rateLimit, { ...rateLimitConfig.auth, name: 'auth-limit' })
 */
export async function setupRateLimit(server: FastifyInstance) {
  // 全局限流
  await server.register(rateLimit, {
    ...rateLimitConfig.global,
    name: 'global-limit'
  })

  console.log('✅ Rate limiting enabled')
}

/**
 * 限流错误响应
 * 当请求被限流时返回友好的错误信息
 */
export function rateLimitErrorResponse(reply: any) {
  return reply.status(429).send({
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '请求过于频繁，请稍后再试'
    }
  })
}
