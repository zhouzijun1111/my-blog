<template>
  <div class="admin-article-list">
    <div class="header">
      <div class="header-content">
        <h2>文章列表</h2>
        <p class="subtitle">管理和编辑您的所有文章</p>
      </div>
      <button class="create-btn" @click="$router.push('/admin/articles/new')">
        <span class="icon">+</span>
        <span>新建文章</span>
      </button>
    </div>

    <div v-if="articleStore.loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="articleStore.articles.length === 0" class="empty-state">
      <div class="empty-icon">
        <FileIcon />
      </div>
      <h3>暂无文章</h3>
      <p>点击上方按钮创建您的第一篇文章</p>
    </div>

    <div v-else class="article-grid">
      <GlassCard
        v-for="article in articleStore.articles"
        :key="article.id"
        class="article-card"
        :class="{ 'is-draft': !article.published }"
      >
        <div class="card-header">
          <div class="status-badge" :class="{ published: article.published }">
            {{ article.published ? '已发布' : '草稿' }}
          </div>
          <div class="card-actions">
            <button class="action-btn edit" @click="$router.push(`/admin/articles/${article.id}/edit`)" aria-label="编辑文章">
              <EditIcon />
            </button>
            <button class="action-btn delete" @click="handleDelete(article.id)" aria-label="删除文章">
              <DeleteIcon />
            </button>
          </div>
        </div>

        <h3 class="card-title">{{ article.title }}</h3>

        <p v-if="article.excerpt" class="card-excerpt">{{ article.excerpt }}</p>

        <div class="card-meta">
          <div class="meta-item">
            <FolderIcon />
            <span>{{ article.category?.name || '未分类' }}</span>
          </div>
          <div class="meta-item">
            <EyeIcon />
            <span>{{ article.views || 0 }}</span>
          </div>
          <div class="meta-item">
            <CalendarIcon />
            <span>{{ formatDate(article.createdAt) }}</span>
          </div>
        </div>

        <div v-if="article.tags && article.tags.length > 0" class="card-tags">
          <span v-for="tag in article.tags.slice(0, 3)" :key="tag.id" class="tag">
            {{ tag.name }}
          </span>
        </div>
      </GlassCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useArticleStore } from '@/stores/article'
import { useMessage } from 'naive-ui'
import GlassCard from '@/components/common/GlassCard.vue'
import EditIcon from '@/components/icons/EditIcon.vue'
import DeleteIcon from '@/components/icons/DeleteIcon.vue'
import FileIcon from '@/components/icons/FileIcon.vue'
import FolderIcon from '@/components/icons/FolderIcon.vue'
import EyeIcon from '@/components/icons/EyeIcon.vue'
import CalendarIcon from '@/components/icons/CalendarIcon.vue'

const articleStore = useArticleStore()
const message = useMessage()

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const handleDelete = async (id: string) => {
  if (confirm('确定要删除这篇文章吗？此操作无法撤销。')) {
    try {
      await articleStore.deleteArticle(id)
      message.success('文章已删除')
    } catch (_error) {
      message.error('删除失败')
    }
  }
}

onMounted(() => {
  articleStore.fetchArticles()
})
</script>

<style scoped>
.admin-article-list {
  max-width: 1400px;
  margin: 0 auto;
}

/* ========== 头部 ========== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content h2 {
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.2;
  margin-bottom: 0.25rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-md);
  white-space: nowrap;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.create-btn .icon {
  font-size: 1.25rem;
  font-weight: 300;
}

/* ========== 加载状态 ========== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========== 空状态 ========== */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  opacity: 0.3;
  color: var(--text-secondary);
}

.empty-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.empty-state p {
  color: var(--text-secondary);
}

/* ========== 文章卡片网格 ========== */
.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.article-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-card:hover {
  transform: translateY(-4px);
}

.article-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gradient-primary);
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.article-card:hover::before {
  opacity: 1;
}

.article-card.is-draft {
  opacity: 0.85;
}

/* ========== 卡片头部 ========== */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.status-badge.published {
  background: var(--gradient-forest);
  color: white;
  border: none;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.action-btn.edit:hover {
  background: var(--gradient-cool);
  color: white;
  transform: scale(1.1);
}

.action-btn.delete:hover {
  background: var(--gradient-sunset);
  color: white;
  transform: scale(1.1);
}

/* ========== 卡片内容 ========== */
.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.card-excerpt {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

/* ========== 卡片元数据 ========== */
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.meta-item svg {
  width: 16px;
  height: 16px;
  color: var(--accent-color);
}

/* ========== 卡片标签 ========== */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
}

.tag {
  padding: 0.25rem 0.625rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--accent-color);
  font-weight: 500;
  border: 1px solid var(--border-color);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-content h2 {
    font-size: 1.75rem;
  }

  .create-btn {
    width: 100%;
    justify-content: center;
  }

  .article-grid {
    grid-template-columns: 1fr;
  }
}
</style>
