<template>
  <router-link :to="`/article/${article.slug}`" class="article-card" :style="cardStyle">
    <div v-if="article.coverImage" class="card-image">
      <img :src="article.coverImage" :alt="article.title" />
      <div class="image-overlay"></div>
    </div>
    <div class="card-content">
      <div class="card-meta">
        <span class="category" :style="categoryStyle">{{ article.category?.name }}</span>
        <span class="date">{{ formatDate(article.createdAt) }}</span>
      </div>
      <h3 class="card-title">{{ article.title }}</h3>
      <p v-if="article.excerpt" class="card-excerpt">{{ article.excerpt }}</p>
      <div v-if="article.tags && article.tags.length > 0" class="card-tags">
        <span
          v-for="(tag, index) in article.tags.slice(0, 3)"
          :key="tag.id"
          class="tag"
          :style="{ '--tag-color': getTagColor(index) }"
        >
          #{{ tag.name }}
        </span>
      </div>
      <div class="card-footer">
        <span class="views">👁️ {{ article.views }}</span>
        <span class="author">✍️ {{ article.author?.username }}</span>
      </div>
    </div>
    <div class="card-glow"></div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Article } from 'shared/types'

defineProps<{
  article: Article
}>()

const gradients = [
  'var(--gradient-primary)',
  'var(--gradient-forest)',
  'var(--gradient-warm)',
  'var(--gradient-ocean)',
  'var(--gradient-sunset)',
  'var(--gradient-purple-pink)',
]

const tagColors = [
  'var(--tag-blue)',
  'var(--tag-green)',
  'var(--tag-purple)',
  'var(--tag-pink)',
  'var(--tag-orange)',
]

const cardStyle = computed(() => ({
  '--card-gradient': gradients[Math.floor(Math.random() * gradients.length)],
}))

const categoryStyle = computed(() => ({
  background: 'var(--gradient-primary)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}))

const getTagColor = (index: number) => {
  return tagColors[index % tagColors.length]
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.article-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--border-color);
  position: relative;
}

.article-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--card-gradient);
  opacity: 0;
  transition: opacity 0.3s;
}

.article-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-xl), var(--shadow-glow);
  border-color: transparent;
}

.article-card:hover::before {
  opacity: 1;
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--card-gradient);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  z-index: 0;
  border-radius: var(--radius-lg);
}

.article-card:hover .card-glow {
  opacity: 0.03;
}

/* ========== 图片区域 ========== */
.card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-card:hover .card-image img {
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.1));
  pointer-events: none;
}

/* ========== 内容区域 ========== */
.card-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.875rem;
  font-size: 0.85rem;
}

.category {
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.date {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.875rem;
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s;
}

.article-card:hover .card-title {
  color: var(--accent-primary);
}

.card-excerpt {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

/* ========== 标签 ========== */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag {
  font-size: 0.75rem;
  color: var(--tag-color);
  background: transparent;
  border: 1px solid var(--tag-color);
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  transition: all 0.3s;
}

.article-card:hover .tag {
  background: var(--tag-color);
  color: white;
  transform: translateY(-2px);
}

/* ========== 底部信息 ========== */
.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-muted);
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.views,
.author {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: color 0.3s;
}

.article-card:hover .views,
.article-card:hover .author {
  color: var(--text-secondary);
}

/* ========== 响应式 ========== */
@media (max-width: 640px) {
  .card-image {
    height: 180px;
  }

  .card-content {
    padding: 1.25rem;
  }

  .card-title {
    font-size: 1.1rem;
  }
}
</style>
