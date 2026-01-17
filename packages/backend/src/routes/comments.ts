import { FastifyInstance } from 'fastify'
import { CommentService } from '../services/comment.service'
import { authenticateToken } from '../middleware/auth'
import { validateBody } from '../middleware/validation'
import { z } from 'zod'

/**
 * 评论路由
 * 定义所有评论相关的 API 端点
 */
export async function commentRoutes(fastify: FastifyInstance) {
  const commentService = new CommentService(fastify.prisma)

  // 验证 Schema
  const createCommentSchema = z.object({
    content: z.string().min(1, '评论内容不能为空').max(1000, '评论内容最多1000字符'),
    author: z.string().min(1, '昵称不能为空').max(50, '昵称最多50字符'),
    email: z.string().email('邮箱格式不正确').optional(),
    parentId: z.string().uuid('父评论ID格式不正确').optional()
  })

  const updateStatusSchema = z.object({
    status: z.enum(['PENDING', 'APPROVED', 'SPAM'], {
      errorMap: () => ({ message: '状态必须是 PENDING、APPROVED 或 SPAM' })
    })
  })

  // 公开路由：获取文章评论
  fastify.get('/articles/:slug/comments', async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string }

      const comments = await commentService.getByArticleSlug(slug)

      return reply.send({
        success: true,
        data: comments
      })
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || '获取评论失败'
        }
      })
    }
  })

  // 公开路由：创建评论（游客可发表，但需要审核）
  fastify.post('/articles/:slug/comments', {
    preHandler: validateBody(createCommentSchema)
  }, async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string }
      const body = request.body as any

      const comment = await commentService.create({
        content: body.content,
        author: body.author,
        email: body.email,
        articleSlug: slug,
        parentId: body.parentId
      })

      return reply.status(201).send({
        success: true,
        data: comment,
        message: '评论提交成功，等待管理员审核'
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'COMMENT_CREATE_FAILED',
          message: error.message || '发表评论失败'
        }
      })
    }
  })

  // 管理员路由：获取待审核评论
  fastify.get('/admin/comments/pending', {
    onRequest: [authenticateToken]
  }, async (request, reply) => {
    try {
      const comments = await commentService.getPendingComments()

      return reply.send({
        success: true,
        data: comments
      })
    } catch (error: any) {
      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || '获取待审核评论失败'
        }
      })
    }
  })

  // 管理员路由：获取所有评论
  fastify.get('/admin/comments', {
    onRequest: [authenticateToken]
  }, async (request, reply) => {
    try {
      const { page = '1', pageSize = '20' } = request.query as any

      const result = await commentService.getAllComments(
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
          message: error.message || '获取评论列表失败'
        }
      })
    }
  })

  // 管理员路由：更新评论状态
  fastify.put('/admin/comments/:id', {
    onRequest: [authenticateToken],
    preHandler: validateBody(updateStatusSchema)
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const { status } = request.body as any

      const comment = await commentService.updateStatus(id, status)

      return reply.send({
        success: true,
        data: comment,
        message: '评论状态更新成功'
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'COMMENT_UPDATE_FAILED',
          message: error.message || '更新评论状态失败'
        }
      })
    }
  })

  // 管理员路由：删除评论
  fastify.delete('/admin/comments/:id', {
    onRequest: [authenticateToken]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string }

      await commentService.delete(id)

      return reply.send({
        success: true,
        message: '评论删除成功'
      })
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'COMMENT_DELETE_FAILED',
          message: error.message || '删除评论失败'
        }
      })
    }
  })
}
