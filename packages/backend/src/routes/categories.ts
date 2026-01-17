import { FastifyInstance } from 'fastify'
import { CategoryService } from '../services/category.service'
import { authenticateToken } from '../middleware/auth'

/**
 * 分类路由
 * 提供分类的完整 CRUD 功能
 */
export async function categoryRoutes(fastify: FastifyInstance) {
  const categoryService = new CategoryService(fastify.prisma)

  // 获取所有分类
  fastify.get('/api/categories', async (request, reply) => {
    try {
      const categories = await categoryService.getAll()
      return { success: true, data: categories }
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message }
      })
    }
  })

  // 获取分类详情
  fastify.get('/api/categories/:slug', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string }
      const category = await categoryService.getBySlug(slug)
      return { success: true, data: category }
    } catch (error: any) {
      if (error.message === '分类不存在') {
        return reply.status(404).send({
          success: false,
          error: { code: 'CATEGORY_NOT_FOUND', message: error.message }
        })
      }
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message }
      })
    }
  })

  // 创建分类（需要认证）
  fastify.post('/api/categories', {
    onRequest: [authenticateToken]
  }, async (request, reply) => {
    try {
      const data = request.body as { name: string; slug: string }
      const category = await categoryService.create(data)

      return reply.status(201).send({ success: true, data: category })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'CREATE_FAILED', message: error.message }
      })
    }
  })

  // 更新分类（需要认证）
  fastify.put('/api/categories/:id', {
    onRequest: [authenticateToken]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const data = request.body as { name?: string; slug?: string }
      const category = await categoryService.update(id, data)

      return { success: true, data: category }
    } catch (error: any) {
      if (error.message === '分类不存在') {
        return reply.status(404).send({
          success: false,
          error: { code: 'CATEGORY_NOT_FOUND', message: error.message }
        })
      }
      return reply.status(400).send({
        success: false,
        error: { code: 'UPDATE_FAILED', message: error.message }
      })
    }
  })

  // 删除分类（需要认证）
  fastify.delete('/api/categories/:id', {
    onRequest: [authenticateToken]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      await categoryService.delete(id)

      return { success: true, message: '分类已删除' }
    } catch (error: any) {
      if (error.message === '分类不存在') {
        return reply.status(404).send({
          success: false,
          error: { code: 'CATEGORY_NOT_FOUND', message: error.message }
        })
      }
      if (error.message.includes('还有') && error.message.includes('篇文章')) {
        return reply.status(400).send({
          success: false,
          error: { code: 'CATEGORY_HAS_ARTICLES', message: error.message }
        })
      }
      return reply.status(500).send({
        success: false,
        error: { code: 'DELETE_FAILED', message: error.message }
      })
    }
  })
}
