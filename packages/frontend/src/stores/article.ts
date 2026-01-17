import { defineStore } from 'pinia'
import { ref } from 'vue'
import { articleApi } from '../api'
import type { Article } from 'shared/types'

export const useArticleStore = defineStore('article', () => {
  const articles = ref<Article[]>([])
  const currentArticle = ref<Article | null>(null)
  const loading = ref(false)
  const pagination = ref({ page: 1, pageSize: 10, total: 0 })

  const fetchArticles = async (params?: { page?: number; pageSize?: number; published?: boolean }) => {
    loading.value = true
    try {
      const response = await articleApi.getList(params)
      if (response.success && response.data) {
        articles.value = response.data.items
        pagination.value = response.data.pagination
      }
    } finally {
      loading.value = false
    }
  }

  const fetchArticleBySlug = async (slug: string) => {
    loading.value = true
    try {
      const response = await articleApi.getBySlug(slug)
      if (response.success && response.data) {
        currentArticle.value = response.data
      }
    } finally {
      loading.value = false
    }
  }

  const createArticle = async (data: Partial<Article>) => {
    const response = await articleApi.create(data)
    if (response.success && response.data) {
      articles.value.unshift(response.data)
      return response.data
    }
    return null
  }

  const updateArticle = async (id: string, data: Partial<Article>) => {
    const response = await articleApi.update(id, data)
    if (response.success && response.data) {
      const index = articles.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        articles.value[index] = response.data
      }
      return response.data
    }
    return null
  }

  const deleteArticle = async (id: string) => {
    const response = await articleApi.delete(id)
    if (response.success) {
      articles.value = articles.value.filter((a) => a.id !== id)
      return true
    }
    return false
  }

  return {
    articles,
    currentArticle,
    loading,
    pagination,
    fetchArticles,
    fetchArticleBySlug,
    createArticle,
    updateArticle,
    deleteArticle,
  }
})
