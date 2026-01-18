import { FastifyRequest, FastifyReply } from 'fastify'

/**
 * JWT 认证中间件
 * 验证请求中的 JWT token
 */
export async function authenticateToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (_err) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: '未授权访问，请先登录'
      }
    })
  }
}

/**
 * 可选的 JWT 认证中间件
 * 如果有 token 则验证，没有则继续（允许游客访问）
 */
export async function optionalAuth(request: FastifyRequest, _reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch (_err) {
    // 游客访问，不抛出错误
    // Fastify 的 JWT 插件会在验证失败时自动处理
  }
}
