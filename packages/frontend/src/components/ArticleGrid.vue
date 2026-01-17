<template>
  <div class="article-grid">
    <ArticleCard
      v-for="article in articles"
      :key="article.id"
      :article="article"
    />
  </div>
</template>

<script setup lang="ts">
import type { Article } from 'shared/types'
import ArticleCard from './ArticleCard.vue'

defineProps<{
  articles: Article[]
}>()
</script>

<style scoped>
.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 640px) {
  .article-grid {
    grid-template-columns: 1fr;
  }
}
</style>
