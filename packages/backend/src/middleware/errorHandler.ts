import { FastifyError, FastifyRequest, FastifyReply } from 'fastify'

/**
 * 统一错误处理中间件
 * 捕获所有错误并返回标准化的错误响应
 */
export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // 记录完整错误日志（包含敏感信息）
  request.log.error({
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack
    },
    url: request.url,
    method: request.method,
  })

  const statusCode = error.statusCode || 500
  const isDevelopment = process.env.NODE_ENV === 'development'

  // 安全的错误消息映射（生产环境使用通用消息）
  const safeErrorMessages: Record<string, string> = {
    'ARTICLE_NOT_FOUND': '文章不存在',
    'CATEGORY_NOT_FOUND': '分类不存在',
    'TAG_NOT_FOUND': '标签不存在',
    'USER_NOT_FOUND': '用户不存在',
    'UNAUTHORIZED': '未授权访问',
    'FORBIDDEN': '无权限访问',
    'VALIDATION_ERROR': '请求数据验证失败',
  }

  // 构建安全响应
  const errorResponse: any = {
    success: false,
    error: {
      code: error.code || 'INTERNAL_SERVER_ERROR',
      message: isDevelopment
        ? (error.message || '服务器内部错误')
        : (safeErrorMessages[error.code || ''] || '服务器内部错误')
    }
  }

  // 开发环境下返回堆栈信息
  if (isDevelopment && error.stack) {
    errorResponse.error.stack = error.stack
  }

  return reply.status(statusCode).send(errorResponse)
}

/**
 * 404 错误处理
 */
export async function notFoundHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  return reply.status(404).send({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `路由 ${request.method} ${request.url} 不存在`
    }
  })
}
