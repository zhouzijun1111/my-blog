// 共享类型定义

export interface User {
  id: string
  email: string
  username: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

export interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string | null
  coverImage?: string | null
  published: boolean
  views: number
  categoryId: string
  category?: Category
  tags?: Tag[]
  authorId: string
  author?: User
  createdAt: string
  updatedAt: string
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

// 登录请求
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

// 文章表单
export interface ArticleForm {
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  published: boolean
  categoryId: string
  tagIds: string[]
}
