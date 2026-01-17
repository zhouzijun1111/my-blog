<template>
  <div class="tag-detail">
    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="tag" class="content">
      <div class="header">
        <h1>🏷️ {{ tag.name }}</h1>
        <p class="count">共 {{ tag.articles?.length || 0 }} 篇文章</p>
      </div>

      <div v-if="tag.articles && tag.articles.length > 0">
        <ArticleGrid :articles="tag.articles" />
      </div>
      <div v-else class="empty">该标签暂无文章</div>
    </div>

    <div v-else class="error">标签不存在</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { tagApi } from '@/api'
import ArticleGrid from '@/components/ArticleGrid.vue'

const route = useRoute()
const loading = ref(true)
const tag = ref<any>(null)

onMounted(async () => {
  const slug = route.params.slug as string
  try {
    const response = await tagApi.getBySlug(slug)
    if (response.success && response.data) {
      tag.value = response.data
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.tag-detail {
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
