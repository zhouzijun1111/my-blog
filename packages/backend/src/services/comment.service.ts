import { PrismaClient } from '@prisma/client'

/**
 * 评论服务
 * 处理评论的增删改查业务逻辑
 */
export class CommentService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * 根据文章 slug 获取评论列表（仅已批准的评论）
   */
  async getByArticleSlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!article) {
      throw new Error('文章不存在')
    }

    const comments = await this.prisma.comment.findMany({
      where: {
        articleId: article.id,
        status: 'APPROVED'
      },
      include: {
        replies: {
          where: { status: 'APPROVED' },
          include: {
            replies: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return comments
  }

  /**
   * 创建评论
   */
  async create(data: {
    content: string
    author: string
    email?: string
    articleSlug: string
    parentId?: string
  }) {
    // 查找文章
    const article = await this.prisma.article.findUnique({
      where: { slug: data.articleSlug }
    })

    if (!article) {
      throw new Error('文章不存在')
    }

    // 如果有父评论，验证父评论存在
    if (data.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: data.parentId }
      })

      if (!parentComment) {
        throw new Error('父评论不存在')
      }

      // 检查父评论是否属于同一文章
      if (parentComment.articleId !== article.id) {
        throw new Error('父评论不属于该文章')
      }
    }

    // 创建评论（默认状态为 PENDING，需要管理员审核）
    const comment = await this.prisma.comment.create({
      data: {
        content: data.content,
        author: data.author,
        email: data.email,
        articleId: article.id,
        parentId: data.parentId,
        status: 'PENDING' // 新评论默认待审核
      },
      include: {
        article: {
          select: { title: true }
        }
      }
    })

    // 返回时排除敏感信息
    const { article: _articleData, ...commentWithoutArticle } = comment
    return commentWithoutArticle
  }

  /**
   * 更新评论状态（管理员功能）
   */
  async updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'SPAM') {
    const comment = await this.prisma.comment.findUnique({
      where: { id }
    })

    if (!comment) {
      throw new Error('评论不存在')
    }

    const updated = await this.prisma.comment.update({
      where: { id },
      data: { status, updatedAt: new Date() }
    })

    return updated
  }

  /**
   * 删除评论（管理员功能）
   */
  async delete(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id }
    })

    if (!comment) {
      throw new Error('评论不存在')
    }

    // 删除评论（级联删除所有回复）
    await this.prisma.comment.delete({
      where: { id }
    })

    return { success: true }
  }

  /**
   * 获取待审核评论列表（管理员功能）
   */
  async getPendingComments() {
    const comments = await this.prisma.comment.findMany({
      where: { status: 'PENDING' },
      include: {
        article: {
          select: { title: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return comments
  }

  /**
   * 获取所有评论（管理员功能）
   */
  async getAllComments(page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        skip,
        take: pageSize,
        include: {
          article: {
            select: { title: true, slug: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.comment.count()
    ])

    return {
      items: comments,
      pagination: {
        page,
        pageSize,
        total
      }
    }
  }
}
