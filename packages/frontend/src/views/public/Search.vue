<template>
  <div class="search-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">
        <span class="title-gradient">搜索文章</span>
      </h1>
      <p class="page-subtitle">探索技术深度，发现编程智慧</p>
    </div>

    <!-- 搜索输入框 -->
    <div class="search-bar">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="搜索文章、标签、分类..."
          class="search-input"
        />
        <button @click="handleSearch" class="search-btn">搜索</button>
      </div>
    </div>

    <!-- 搜索历史和热门搜索 -->
    <div v-if="!hasSearched" class="search-suggestions">
      <div v-if="searchHistory.length > 0" class="suggestion-section">
        <div class="section-header">
          <h3>搜索历史</h3>
          <button class="clear-btn" @click="clearHistory">清除</button>
        </div>
        <div class="history-list">
          <button
            v-for="(item, index) in searchHistory"
            :key="index"
            class="history-item"
            @click="searchHistoryItem(item)"
          >
            <span class="history-icon">🕐</span>
            <span>{{ item }}</span>
          </button>
        </div>
      </div>

      <div class="suggestion-section">
        <div class="section-header">
          <h3>热门搜索</h3>
        </div>
        <div class="popular-list">
          <button
            v-for="(item, index) in popularSearches"
            :key="index"
            class="popular-item"
            @click="searchHistoryItem(item)"
          >
            {{ item }}
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>搜索中...</p>
    </div>

    <!-- 搜索结果 -->
    <div v-else-if="hasSearched" class="results-container">
      <!-- 结果统计 -->
      <div class="results-header">
        <h2 class="results-title">
          找到 <span class="highlight">{{ totalResults }}</span> 个结果
          <span v-if="searchQuery" class="search-term">"{{ searchQuery }}"</span>
        </h2>
      </div>

      <!-- 无结果 -->
      <div v-if="totalResults === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>未找到相关内容</h3>
        <p>尝试使用其他关键词或查看热门搜索</p>
      </div>

      <!-- 文章结果 -->
      <div v-if="results.articles?.length" class="result-section">
        <h3 class="section-title">
          <span class="title-icon">📄</span>
          文章 ({{ results.articles.length }})
        </h3>
        <ArticleGrid :articles="results.articles" />
      </div>

      <!-- 分类结果 -->
      <div v-if="results.categories?.length" class="result-section">
        <h3 class="section-title">
          <span class="title-icon">📁</span>
          分类 ({{ results.categories.length }})
        </h3>
        <div class="category-list">
          <router-link
            v-for="category in results.categories"
            :key="category.id"
            :to="`/category/${category.slug}`"
            class="category-card"
          >
            <div class="category-icon">{{ getCategoryIcon(category.id) }}</div>
            <div class="category-info">
              <div class="category-name">{{ category.name }}</div>
              <div class="category-count">{{ category._count?.articles || 0 }} 篇文章</div>
            </div>
          </router-link>
        </div>
      </div>

      <!-- 标签结果 -->
      <div v-if="results.tags?.length" class="result-section">
        <h3 class="section-title">
          <span class="title-icon">🏷️</span>
          标签 ({{ results.tags.length }})
        </h3>
        <div class="tag-list">
          <router-link
            v-for="tag in results.tags"
            :key="tag.id"
            :to="`/tag/${tag.slug}`"
            class="tag-item"
            :style="{ '--tag-color': getTagColor(tag.id) }"
          >
            #{{ tag.name }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { searchApi } from '@/api'
import ArticleGrid from '@/components/ArticleGrid.vue'

const route = useRoute()
const searchQuery = ref('')
const loading = ref(false)
const hasSearched = ref(false)
const results = ref<{ articles?: any[]; categories?: any[]; tags?: any[] }>({})

// 搜索历史
const searchHistory = ref<string[]>([])
const HISTORY_KEY = 'search_history'
const MAX_HISTORY = 8

// 热门搜索
const popularSearches = ref([
  'Vue 3',
  'TypeScript',
  '性能优化',
  '前端架构',
  '全栈开发',
  'React',
  'Node.js',
  '微前端',
])

// 标签颜色
const tagColors = [
  'var(--tag-blue)',
  'var(--tag-green)',
  'var(--tag-purple)',
  'var(--tag-pink)',
  'var(--tag-orange)',
  'var(--tag-cyan)',
]

const getTagColor = (id: string) => {
  const index = parseInt(id) % tagColors.length
  return tagColors[index]
}

// 分类图标
const categoryIcons = ['📚', '💻', '🎨', '🔧', '📖', '🚀', '💡', '🎯']

const getCategoryIcon = (id: string) => {
  const index = parseInt(id) % categoryIcons.length
  return categoryIcons[index]
}

// 总结果数
const totalResults = computed(() => {
  return (
    (results.value.articles?.length || 0) +
    (results.value.categories?.length || 0) +
    (results.value.tags?.length || 0)
  )
})

// 加载搜索历史
const loadHistory = () => {
  try {
    const saved = localStorage.getItem(HISTORY_KEY)
    if (saved) {
      searchHistory.value = JSON.parse(saved)
    }
  } catch {
    // ignore
  }
}

// 保存搜索历史
const saveToHistory = (query: string) => {
  if (!query.trim()) return

  const filtered = searchHistory.value.filter((item) => item !== query)
  searchHistory.value = [query, ...filtered].slice(0, MAX_HISTORY)

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(searchHistory.value))
  } catch {
    // ignore
  }
}

// 清除历史
const clearHistory = () => {
  searchHistory.value = []
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {
    // ignore
  }
}

// 搜索历史项
const searchHistoryItem = (query: string) => {
  searchQuery.value = query
  handleSearch()
}

// 执行搜索
const handleSearch = async () => {
  if (!searchQuery.value.trim()) return

  loading.value = true
  hasSearched.value = true
  saveToHistory(searchQuery.value)

  try {
    const response = await searchApi.search(searchQuery.value)
    if (response.success && response.data) {
      results.value = response.data
    }
  } finally {
    loading.value = false
  }
}

// 初始化：从 URL 参数获取搜索词
onMounted(() => {
  loadHistory()

  const query = route.query.q as string
  if (query) {
    searchQuery.value = query
    handleSearch()
  }
})
</script>

<style scoped>
.search-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 0;
}

/* ========== 页面标题 ========== */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 3rem 1rem;
  background: var(--gradient-primary);
  border-radius: var(--radius-xl);
  color: white;
  position: relative;
  overflow: hidden;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.4;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
}

.title-gradient {
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.85) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  position: relative;
  z-index: 1;
}

/* ========== 搜索输入框 ========== */
.search-bar {
  margin-bottom: 2rem;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all 0.3s;
}

.search-input-wrapper:focus-within {
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
  transform: translateY(-2px);
}

.search-icon {
  font-size: 1.5rem;
  opacity: 0.5;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.1rem;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-btn {
  padding: 0.75rem 2rem;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: var(--shadow-md);
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* ========== 搜索建议 ========== */
.search-suggestions {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.suggestion-section {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.clear-btn {
  padding: 0.4rem 0.8rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

/* 搜索历史 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
  color: var(--text-primary);
}

.history-item:hover {
  background: var(--bg-secondary);
  transform: translateX(4px);
}

.history-icon {
  font-size: 1rem;
  opacity: 0.6;
}

/* 热门搜索 */
.popular-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.popular-item {
  padding: 0.6rem 1.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.popular-item:hover {
  background: var(--gradient-primary);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
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
  width: 50px;
  height: 50px;
  border: 4px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========== 搜索结果 ========== */
.results-container {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results-header {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.results-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.results-title .highlight {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  font-size: 1.4rem;
}

.search-term {
  color: var(--text-muted);
  font-size: 1rem;
  font-weight: 400;
}

/* ========== 空状态 ========== */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
  opacity: 0.4;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* ========== 结果区域 ========== */
.result-section {
  margin-bottom: 3rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--gradient-primary);
}

.title-icon {
  font-size: 1.75rem;
}

/* ========== 分类卡片 ========== */
.category-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s;
  box-shadow: var(--shadow-sm);
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-primary);
}

.category-icon {
  width: 48px;
  height: 48px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
}

.category-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.category-count {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* ========== 标签列表 ========== */
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tag-item {
  padding: 0.75rem 1.25rem;
  background: var(--bg-card);
  border: 2px solid var(--tag-color);
  border-radius: var(--radius-full);
  color: var(--tag-color);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s;
  box-shadow: var(--shadow-sm);
}

.tag-item:hover {
  background: var(--tag-color);
  color: white;
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .page-header {
    padding: 2rem 1rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .page-subtitle {
    font-size: 0.95rem;
  }

  .search-input-wrapper {
    flex-direction: column;
    padding: 1rem;
  }

  .search-btn {
    width: 100%;
  }

  .category-list {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 1.25rem;
  }
}
</style>
