import { FastifyInstance } from 'fastify'
import { TagService } from '../services/tag.service'

/**
 * 标签路由
 * 提供标签的完整 CRUD 功能
 */
export async function tagRoutes(fastify: FastifyInstance) {
  const tagService = new TagService(fastify.prisma)

  // 获取所有标签
  fastify.get('/api/tags', async (request, reply) => {
    try {
      const tags = await tagService.getAll()
      return { success: true, data: tags }
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message }
      })
    }
  })

  // 获取标签详情
  fastify.get('/api/tags/:slug', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string }
      const tag = await tagService.getBySlug(slug)
      return { success: true, data: tag }
    } catch (error: any) {
      if (error.message === '标签不存在') {
        return reply.status(404).send({
          success: false,
          error: { code: 'TAG_NOT_FOUND', message: error.message }
        })
      }
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message }
      })
    }
  })

  // 创建标签（需要认证）
  fastify.post('/api/tags', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const data = request.body as { name: string; slug: string }
      const tag = await tagService.create(data)

      return reply.status(201).send({ success: true, data: tag })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'CREATE_FAILED', message: error.message }
      })
    }
  })

  // 更新标签（需要认证）
  fastify.put('/api/tags/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const data = request.body as { name?: string; slug?: string }
      const tag = await tagService.update(id, data)

      return { success: true, data: tag }
    } catch (error: any) {
      if (error.message === '标签不存在') {
        return reply.status(404).send({
          success: false,
          error: { code: 'TAG_NOT_FOUND', message: error.message }
        })
      }
      return reply.status(400).send({
        success: false,
        error: { code: 'UPDATE_FAILED', message: error.message }
      })
    }
  })

  // 删除标签（需要认证）
  fastify.delete('/api/tags/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      await tagService.delete(id)

      return { success: true, message: '标签已删除' }
    } catch (error: any) {
      if (error.message === '标签不存在') {
        return reply.status(404).send({
          success: false,
          error: { code: 'TAG_NOT_FOUND', message: error.message }
        })
      }
      return reply.status(500).send({
        success: false,
        error: { code: 'DELETE_FAILED', message: error.message }
      })
    }
  })
}
