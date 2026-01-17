import { PrismaClient } from '@prisma/client'

/**
 * 文章服务
 * 处理文章的增删改查业务逻辑
 */
export class ArticleService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * 获取文章列表
   */
  async getList(params: {
    page?: number
    pageSize?: number
    published?: boolean
  }) {
    const { page = 1, pageSize = 10, published } = params
    const skip = (page - 1) * pageSize
    const where = published !== undefined ? { published } : {}

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          category: true,
          tags: true,
          author: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.article.count({ where }),
    ])

    return {
      items,
      pagination: { page, pageSize, total },
    }
  }

  /**
   * 根据 slug 获取文章详情
   */
  async getBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        tags: true,
        author: { select: { id: true, username: true } },
      },
    })

    if (!article) {
      throw new Error('文章不存在')
    }

    return article
  }

  /**
   * 根据 ID 获取文章
   */
  async getById(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
        author: { select: { id: true, username: true } },
      },
    })

    if (!article) {
      throw new Error('文章不存在')
    }

    return article
  }

  /**
   * 创建文章
   */
  async create(data: {
    title: string
    slug: string
    content: string
    excerpt?: string
    coverImage?: string
    published: boolean
    categoryId: string
    tagIds?: string[]
    authorId: string
  }) {
    // 检查 slug 是否已存在
    const existingArticle = await this.prisma.article.findUnique({
      where: { slug: data.slug }
    })

    if (existingArticle) {
      throw new Error('该 slug 已被使用')
    }

    // 验证分类存在
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId }
    })

    if (!category) {
      throw new Error('分类不存在')
    }

    // 验证标签存在（如果提供）
    if (data.tagIds && data.tagIds.length > 0) {
      const tags = await this.prisma.tag.findMany({
        where: { id: { in: data.tagIds } }
      })

      if (tags.length !== data.tagIds.length) {
        throw new Error('部分标签不存在')
      }
    }

    // 创建文章
    const article = await this.prisma.article.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        coverImage: data.coverImage,
        published: data.published,
        categoryId: data.categoryId,
        authorId: data.authorId,
        tags: data.tagIds ? {
          connect: data.tagIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        category: true,
        tags: true,
        author: { select: { id: true, username: true } },
      },
    })

    return article
  }

  /**
   * 更新文章
   */
  async update(id: string, userId: string, data: {
    title?: string
    slug?: string
    content?: string
    excerpt?: string
    coverImage?: string
    published?: boolean
    categoryId?: string
    tagIds?: string[]
  }) {
    // 检查文章是否存在
    const existingArticle = await this.prisma.article.findUnique({
      where: { id }
    })

    if (!existingArticle) {
      throw new Error('文章不存在')
    }

    // 权限检查：只有作者可以更新
    if (existingArticle.authorId !== userId) {
      throw new Error('无权限修改此文章')
    }

    // 如果要更新 slug，检查是否已被使用
    if (data.slug && data.slug !== existingArticle.slug) {
      const slugExists = await this.prisma.article.findUnique({
        where: { slug: data.slug }
      })

      if (slugExists) {
        throw new Error('该 slug 已被使用')
      }
    }

    // 如果要更新分类，验证分类存在
    if (data.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId }
      })

      if (!category) {
        throw new Error('分类不存在')
      }
    }

    // 构建更新数据
    const updateData: any = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
      ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
      ...(data.published !== undefined && { published: data.published }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
    }

    // 处理标签更新
    if (data.tagIds !== undefined) {
      // 先断开所有现有标签连接
      await this.prisma.article.update({
        where: { id },
        data: {
          tags: { set: [] }
        }
      })

      // 验证标签存在
      const tags = await this.prisma.tag.findMany({
        where: { id: { in: data.tagIds } }
      })

      if (tags.length !== data.tagIds.length) {
        throw new Error('部分标签不存在')
      }

      // 连接新标签
      updateData.tags = {
        connect: data.tagIds.map(tagId => ({ id: tagId }))
      }
    }

    // 更新文章
    const updatedArticle = await this.prisma.article.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        tags: true,
        author: { select: { id: true, username: true } },
      },
    })

    return updatedArticle
  }

  /**
   * 删除文章
   */
  async delete(id: string, userId: string) {
    // 检查文章是否存在
    const article = await this.prisma.article.findUnique({
      where: { id }
    })

    if (!article) {
      throw new Error('文章不存在')
    }

    // 权限检查：只有作者可以删除
    if (article.authorId !== userId) {
      throw new Error('无权限删除此文章')
    }

    // 删除文章（评论会通过级联删除自动删除）
    await this.prisma.article.delete({
      where: { id }
    })

    return { success: true }
  }

  /**
   * 增加文章阅读量
   */
  async incrementViews(slug: string) {
    const article = await this.prisma.article.update({
      where: { slug },
      data: {
        views: { increment: 1 }
      },
      select: { views: true }
    })

    return article
  }
}
