import { FastifyInstance } from 'fastify'
import { ArticleService } from '../services/article.service'

/**
 * 文章路由
 * 提供文章的完整 CRUD 功能
 */
export async function articleRoutes(fastify: FastifyInstance) {
  const articleService = new ArticleService(fastify.prisma)

  // 获取文章列表
  fastify.get('/api/articles', async (request, reply) => {
    try {
      const { page = '1', pageSize = '10', published } = request.query as any
      const result = await articleService.getList({
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        published: published !== undefined ? published === 'true' : undefined
      })
      return { success: true, data: result }
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message }
      })
    }
  })

  // 获取文章详情
  fastify.get('/api/articles/:slug', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string }
      const article = await articleService.getBySlug(slug)

      // 增加阅读量（异步执行，不阻塞响应）
      articleService.incrementViews(slug).catch(err => {
        fastify.log.error({ err }, 'Failed to increment views')
      })

      return { success: true, data: article }
    } catch (error: any) {
      if (error.message === '文章不存在') {
        return reply.status(404).send({
          success: false,
          error: { code: 'ARTICLE_NOT_FOUND', message: error.message }
        })
      }
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message }
      })
    }
  })

  // 根据 ID 获取文章详情（用于编辑）
  fastify.get('/api/articles/by-id/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const article = await articleService.getById(id)
      return { success: true, data: article }
    } catch (error: any) {
      if (error.message === '文章不存在') {
        return reply.status(404).send({
          success: false,
          error: { code: 'ARTICLE_NOT_FOUND', message: error.message }
        })
      }
      return reply.status(500).send({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message }
      })
    }
  })

  // 创建文章（需要认证）
  fastify.post('/api/articles', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = (request as any).user.id
      const data = request.body as any

      const article = await articleService.create({
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        published: data.published ?? false,
        categoryId: data.categoryId,
        tagIds: data.tagIds,
        authorId: userId
      })

      return reply.status(201).send({ success: true, data: article })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: { code: 'CREATE_FAILED', message: error.message }
      })
    }
  })

  // 更新文章（需要认证）
  fastify.put('/api/articles/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const userId = (request as any).user.id
      const data = request.body as any

      const article = await articleService.update(id, userId, {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        published: data.published,
        categoryId: data.categoryId,
        tagIds: data.tagIds
      })

      return { success: true, data: article }
    } catch (error: any) {
      if (error.message === '文章不存在') {
        return reply.status(404).send({
          success: false,
          error: { code: 'ARTICLE_NOT_FOUND', message: error.message }
        })
      }
      if (error.message === '无权限修改此文章') {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: error.message }
        })
      }
      return reply.status(400).send({
        success: false,
        error: { code: 'UPDATE_FAILED', message: error.message }
      })
    }
  })

  // 删除文章（需要认证）
  fastify.delete('/api/articles/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const userId = (request as any).user.id
      await articleService.delete(id, userId)

      return { success: true, message: '文章已删除' }
    } catch (error: any) {
      if (error.message === '文章不存在') {
        return reply.status(404).send({
          success: false,
          error: { code: 'ARTICLE_NOT_FOUND', message: error.message }
        })
      }
      if (error.message === '无权限删除此文章') {
        return reply.status(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: error.message }
        })
      }
      return reply.status(500).send({
        success: false,
        error: { code: 'DELETE_FAILED', message: error.message }
      })
    }
  })
}
