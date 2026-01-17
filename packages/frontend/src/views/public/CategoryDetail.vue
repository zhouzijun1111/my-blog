<template>
  <div class="category-detail">
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="category" class="content">
      <div class="header">
        <h1>📁 {{ category.name }}</h1>
        <p class="count">共 {{ category.articles?.length || 0 }} 篇文章</p>
      </div>

      <div v-if="category.articles && category.articles.length > 0">
        <ArticleGrid :articles="category.articles" />
      </div>
      <div v-else class="empty">该分类暂无文章</div>
    </div>

    <div v-else class="error">分类不存在</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { categoryApi } from '@/api'
import ArticleGrid from '@/components/ArticleGrid.vue'

const route = useRoute()
const loading = ref(true)
const category = ref<any>(null)

onMounted(async () => {
  const slug = route.params.slug as string
  try {
    const response = await categoryApi.getBySlug(slug)
    if (response.success && response.data) {
      category.value = response.data
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.category-detail {
  max-width: 1000px;
  margin: 0 auto;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
}

.header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem;
  background: linear-gradient(135deg, var(--accent-color), #8b5cf6);
  border-radius: 12px;
  color: white;
}

.header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.count {
  opacity: 0.9;
}
</style>
