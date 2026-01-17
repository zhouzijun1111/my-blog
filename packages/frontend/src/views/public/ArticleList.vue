<template>
  <div class="article-list-page">
    <h1 class="page-title">文章列表</h1>

    <div v-if="articleStore.loading" class="loading">加载中...</div>
    <ArticleGrid v-else-if="articleStore.articles.length > 0" :articles="articleStore.articles" />
    <div v-else class="empty">暂无文章</div>

    <div v-if="articleStore.pagination.total > articleStore.pagination.pageSize" class="pagination">
      <button
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
        class="page-btn"
      >
        上一页
      </button>
      <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      <button
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
        class="page-btn"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useArticleStore } from '@/stores/article'
import ArticleGrid from '@/components/ArticleGrid.vue'

const route = useRoute()
const articleStore = useArticleStore()

const currentPage = computed(() => articleStore.pagination.page)
const totalPages = computed(() => Math.ceil(articleStore.pagination.total / articleStore.pagination.pageSize))

const loadArticles = () => {
  const page = Number(route.query.page) || 1
  articleStore.fetchArticles({ page, published: true })
}

const changePage = (page: number) => {
  articleStore.fetchArticles({ page, published: true })
}

onMounted(() => {
  loadArticles()
})
</script>

<style scoped>
.article-list-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--text-primary);
}

.loading,
.empty {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem;
}

.page-btn {
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-card);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: var(--text-secondary);
}
</style>
