import { PrismaClient } from '@prisma/client'

/**
 * 标签服务
 * 处理标签的增删改查业务逻辑
 */
export class TagService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * 获取所有标签
   */
  async getAll() {
    const tags = await this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    })

    return tags.map(tag => ({
      ...tag,
      articleCount: tag._count.articles
    }))
  }

  /**
   * 根据 slug 获取标签
   */
  async getBySlug(slug: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    })

    if (!tag) {
      throw new Error('标签不存在')
    }

    return {
      ...tag,
      articleCount: tag._count.articles
    }
  }

  /**
   * 根据 ID 获取标签
   */
  async getById(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id }
    })

    if (!tag) {
      throw new Error('标签不存在')
    }

    return tag
  }

  /**
   * 创建标签
   */
  async create(data: { name: string; slug: string }) {
    // 检查名称是否已存在
    const existingByName = await this.prisma.tag.findUnique({
      where: { name: data.name }
    })

    if (existingByName) {
      throw new Error('该标签名称已存在')
    }

    // 检查 slug 是否已存在
    const existingBySlug = await this.prisma.tag.findUnique({
      where: { slug: data.slug }
    })

    if (existingBySlug) {
      throw new Error('该 slug 已被使用')
    }

    const tag = await this.prisma.tag.create({
      data: {
        name: data.name,
        slug: data.slug
      }
    })

    return tag
  }

  /**
   * 更新标签
   */
  async update(id: string, data: { name?: string; slug?: string }) {
    // 检查标签是否存在
    const existingTag = await this.prisma.tag.findUnique({
      where: { id }
    })

    if (!existingTag) {
      throw new Error('标签不存在')
    }

    // 如果要更新名称，检查是否已被使用
    if (data.name && data.name !== existingTag.name) {
      const nameExists = await this.prisma.tag.findUnique({
        where: { name: data.name }
      })

      if (nameExists) {
        throw new Error('该标签名称已存在')
      }
    }

    // 如果要更新 slug，检查是否已被使用
    if (data.slug && data.slug !== existingTag.slug) {
      const slugExists = await this.prisma.tag.findUnique({
        where: { slug: data.slug }
      })

      if (slugExists) {
        throw new Error('该 slug 已被使用')
      }
    }

    const tag = await this.prisma.tag.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug })
      }
    })

    return tag
  }

  /**
   * 删除标签
   */
  async delete(id: string) {
    // 检查标签是否存在
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    })

    if (!tag) {
      throw new Error('标签不存在')
    }

    // 标签可以被删除，即使有关联的文章（只是解除关联关系）

    // 删除标签
    await this.prisma.tag.delete({
      where: { id }
    })

    return { success: true }
  }
}
