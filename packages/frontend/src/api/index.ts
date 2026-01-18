import api from './client'
import type { ApiResponse, Article, Category, Tag, LoginRequest, LoginResponse } from 'shared/types'

// 文章相关
export const articleApi = {
  getList: (params?: { page?: number; pageSize?: number; published?: boolean }) =>
    api.get<any, ApiResponse<{ items: Article[]; pagination: any }>>('/articles', { params }),

  getBySlug: (slug: string) =>
    api.get<any, ApiResponse<Article>>(`/articles/${slug}`),

  getById: (id: string) =>
    api.get<any, ApiResponse<Article>>(`/articles/by-id/${id}`),

  create: (data: Partial<Article>) =>
    api.post<any, ApiResponse<Article>>('/articles', data),

  update: (id: string, data: Partial<Article>) =>
    api.put<any, ApiResponse<Article>>(`/articles/${id}`, data),

  delete: (id: string) =>
    api.delete<any, ApiResponse<void>>(`/articles/${id}`),
}

// 分类相关
export const categoryApi = {
  getList: () =>
    api.get<any, ApiResponse<Category[]>>('/categories'),

  getBySlug: (slug: string) =>
    api.get<any, ApiResponse<Category & { articles: Article[] }>>(`/categories/${slug}`),

  create: (data: { name: string; slug: string; description?: string }) =>
    api.post<any, ApiResponse<Category>>('/categories', data),

  update: (id: string, data: { name: string; slug: string; description?: string }) =>
    api.put<any, ApiResponse<Category>>(`/categories/${id}`, data),

  delete: (id: string) =>
    api.delete<any, ApiResponse<void>>(`/categories/${id}`),
}

// 标签相关
export const tagApi = {
  getList: () =>
    api.get<any, ApiResponse<Tag[]>>('/tags'),

  getBySlug: (slug: string) =>
    api.get<any, ApiResponse<Tag & { articles: Article[] }>>(`/tags/${slug}`),

  create: (data: { name: string; slug: string; description?: string }) =>
    api.post<any, ApiResponse<Tag>>('/tags', data),

  update: (id: string, data: { name: string; slug: string; description?: string }) =>
    api.put<any, ApiResponse<Tag>>(`/tags/${id}`, data),

  delete: (id: string) =>
    api.delete<any, ApiResponse<void>>(`/tags/${id}`),
}

// 搜索
export const searchApi = {
  search: (q: string) =>
    api.get<any, ApiResponse<{ articles: Article[]; tags: Tag[]; categories: Category[] }>>('/search', {
      params: { q },
    }),
}

// 认证
export const authApi = {
  login: (data: LoginRequest) =>
    api.post<any, ApiResponse<LoginResponse>>('/auth/login', data),

  getMe: () =>
    api.get<any, ApiResponse<{ id: string; email: string; username: string }>>('/auth/me'),
}

export default api
