import { PrismaClient } from '@prisma/client'

/**
 * 分类服务
 * 处理分类的增删改查业务逻辑
 */
export class CategoryService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * 获取所有分类
   */
  async getAll() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    })

    return categories.map(cat => ({
      ...cat,
      articleCount: cat._count.articles
    }))
  }

  /**
   * 根据 slug 获取分类
   */
  async getBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    })

    if (!category) {
      throw new Error('分类不存在')
    }

    return {
      ...category,
      articleCount: category._count.articles
    }
  }

  /**
   * 根据 ID 获取分类
   */
  async getById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id }
    })

    if (!category) {
      throw new Error('分类不存在')
    }

    return category
  }

  /**
   * 创建分类
   */
  async create(data: { name: string; slug: string }) {
    // 检查名称是否已存在
    const existingByName = await this.prisma.category.findUnique({
      where: { name: data.name }
    })

    if (existingByName) {
      throw new Error('该分类名称已存在')
    }

    // 检查 slug 是否已存在
    const existingBySlug = await this.prisma.category.findUnique({
      where: { slug: data.slug }
    })

    if (existingBySlug) {
      throw new Error('该 slug 已被使用')
    }

    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug
      }
    })

    return category
  }

  /**
   * 更新分类
   */
  async update(id: string, data: { name?: string; slug?: string }) {
    // 检查分类是否存在
    const existingCategory = await this.prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      throw new Error('分类不存在')
    }

    // 如果要更新名称，检查是否已被使用
    if (data.name && data.name !== existingCategory.name) {
      const nameExists = await this.prisma.category.findUnique({
        where: { name: data.name }
      })

      if (nameExists) {
        throw new Error('该分类名称已存在')
      }
    }

    // 如果要更新 slug，检查是否已被使用
    if (data.slug && data.slug !== existingCategory.slug) {
      const slugExists = await this.prisma.category.findUnique({
        where: { slug: data.slug }
      })

      if (slugExists) {
        throw new Error('该 slug 已被使用')
      }
    }

    const category = await this.prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug })
      }
    })

    return category
  }

  /**
   * 删除分类
   */
  async delete(id: string) {
    // 检查分类是否存在
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true }
        }
      }
    })

    if (!category) {
      throw new Error('分类不存在')
    }

    // 检查是否有关联的文章
    if (category._count.articles > 0) {
      throw new Error(`该分类下还有 ${category._count.articles} 篇文章，无法删除`)
    }

    // 删除分类
    await this.prisma.category.delete({
      where: { id }
    })

    return { success: true }
  }
}
