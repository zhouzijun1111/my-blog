import { FastifyRequest } from 'fastify'

/**
 * JWT 用户信息
 */
export interface JwtUser {
  id: string
  email: string
  username: string
}

/**
 * 扩展 FastifyRequest 类型，添加 user 属性
 */
declare module 'fastify' {
  interface FastifyRequest {
    user: JwtUser | undefined
  }
}

/**
 * 认证后的请求类型（确保 user 存在）
 */
export interface AuthenticatedRequest extends FastifyRequest {
  user: JwtUser
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

/**
 * API 响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any[]
  }
}

/**
 * 创建文章请求体
 */
export interface CreateArticleRequest {
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  published: boolean
  categoryId: string
  tagIds?: string[]
}

/**
 * 更新文章请求体
 */
export interface UpdateArticleRequest {
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  coverImage?: string
  published?: boolean
  categoryId?: string
  tagIds?: string[]
}

/**
 * 创建分类请求体
 */
export interface CreateCategoryRequest {
  name: string
  slug: string
}

/**
 * 更新分类请求体
 */
export interface UpdateCategoryRequest {
  name?: string
  slug?: string
}

/**
 * 创建标签请求体
 */
export interface CreateTagRequest {
  name: string
  slug: string
}

/**
 * 更新标签请求体
 */
export interface UpdateTagRequest {
  name?: string
  slug?: string
}

/**
 * 创建评论请求体
 */
export interface CreateCommentRequest {
  content: string
  author: string
  email?: string
  articleSlug: string
  parentId?: string
}
