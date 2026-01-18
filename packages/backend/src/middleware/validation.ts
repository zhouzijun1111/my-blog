import { z } from 'zod'
import { FastifyRequest, FastifyReply } from 'fastify'

/**
 * Zod 验证中间件工厂函数
 * 使用方法：在路由中传入 Zod schema 进行验证
 *
 * @example
 * server.post('/register', {
 *   preHandler: validateBody(registerSchema)
 * }, async (request, reply) => {
 *   // request.body 已经验证
 * })
 */
export function validateBody<T extends z.ZodType>(schema: T) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.body = schema.parse(request.body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '请求数据验证失败',
            details: error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        })
      }
      throw error
    }
  }
}

/**
 * 查询参数验证中间件
 */
export function validateQuery<T extends z.ZodType>(schema: T) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      request.query = schema.parse(request.query)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '查询参数验证失败',
            details: error.issues.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          }
        })
      }
      throw error
    }
  }
}

// 常用验证 Schema
export const commonSchemas = {
  // 分页参数
  pagination: z.object({
    page: z.string().optional().default('1'),
    pageSize: z.string().optional().default('10')
  }),

  // 邮箱
  email: z.string().email('邮箱格式不正确'),

  // 用户名
  username: z.string().min(2, '用户名至少2个字符').max(50, '用户名最多50个字符'),

  // 密码
  password: z.string().min(6, '密码至少6个字符'),

  // ID
  id: z.string().uuid('ID 格式不正确')
}

// 认证相关验证 Schema
export const authSchemas = {
  register: z.object({
    email: commonSchemas.email,
    username: commonSchemas.username,
    password: commonSchemas.password
  }),

  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, '密码不能为空')
  })
}

// 文章相关验证 Schema
export const articleSchemas = {
  create: z.object({
    title: z.string().min(1, '标题不能为空').max(200, '标题最多200字符'),
    slug: z.string().min(1, 'slug不能为空').max(100, 'slug最多100字符')
      .regex(/^[a-z0-9-]+$/, 'slug只能包含小写字母、数字和连字符'),
    content: z.string().min(1, '内容不能为空'),
    excerpt: z.string().max(500, '摘要最多500字符').optional(),
    coverImage: z.string().url('封面图片必须是有效URL').optional(),
    published: z.boolean().optional(),
    categoryId: z.string().uuid('分类ID格式不正确'),
    tagIds: z.array(z.string().uuid('标签ID格式不正确')).optional()
  }),

  update: z.object({
    title: z.string().min(1, '标题不能为空').max(200, '标题最多200字符').optional(),
    slug: z.string().min(1, 'slug不能为空').max(100, 'slug最多100字符')
      .regex(/^[a-z0-9-]+$/, 'slug只能包含小写字母、数字和连字符').optional(),
    content: z.string().min(1, '内容不能为空').optional(),
    excerpt: z.string().max(500, '摘要最多500字符').optional(),
    coverImage: z.string().url('封面图片必须是有效URL').optional(),
    published: z.boolean().optional(),
    categoryId: z.string().uuid('分类ID格式不正确').optional(),
    tagIds: z.array(z.string().uuid('标签ID格式不正确')).optional()
  })
}

// 分类相关验证 Schema
export const categorySchemas = {
  create: z.object({
    name: z.string().min(1, '名称不能为空').max(50, '名称最多50字符'),
    slug: z.string().min(1, 'slug不能为空').max(50, 'slug最多50字符')
      .regex(/^[a-z0-9-]+$/, 'slug只能包含小写字母、数字和连字符')
  }),

  update: z.object({
    name: z.string().min(1, '名称不能为空').max(50, '名称最多50字符').optional(),
    slug: z.string().min(1, 'slug不能为空').max(50, 'slug最多50字符')
      .regex(/^[a-z0-9-]+$/, 'slug只能包含小写字母、数字和连字符').optional()
  })
}

// 标签相关验证 Schema（同分类）
export const tagSchemas = {
  create: z.object({
    name: z.string().min(1, '名称不能为空').max(50, '名称最多50字符'),
    slug: z.string().min(1, 'slug不能为空').max(50, 'slug最多50字符')
      .regex(/^[a-z0-9-]+$/, 'slug只能包含小写字母、数字和连字符')
  }),

  update: z.object({
    name: z.string().min(1, '名称不能为空').max(50, '名称最多50字符').optional(),
    slug: z.string().min(1, 'slug不能为空').max(50, 'slug最多50字符')
      .regex(/^[a-z0-9-]+$/, 'slug只能包含小写字母、数字和连字符').optional()
  })
}

// 分页查询参数验证 Schema
export const paginationQuerySchema = z.object({
  page: z.string().optional().default('1'),
  pageSize: z.string().optional().default('10'),
  published: z.string().optional()
})
