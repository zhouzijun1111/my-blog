<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="show" class="search-modal-overlay" @click.self="close">
        <div class="search-modal-container" @click.stop>
          <!-- 搜索输入框 -->
          <div class="search-input-wrapper">
            <SearchIcon class="search-icon" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="搜索文章、标签、分类..."
              @input="handleSearch"
              @keydown.down.prevent="highlightNext"
              @keydown.up.prevent="highlightPrev"
              @keydown.enter="handleEnter"
            />
            <button class="close-btn" @click="close">
              <span>ESC</span>
            </button>
          </div>

          <!-- 搜索历史 -->
          <div v-if="!searchQuery && searchHistory.length > 0" class="search-section">
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
                <ClockIcon class="history-icon" />
                <span class="history-text">{{ item }}</span>
                <span class="history-arrow">→</span>
              </button>
            </div>
          </div>

          <!-- 热门搜索 -->
          <div v-if="!searchQuery && popularSearches.length > 0" class="search-section">
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

          <!-- 搜索结果 -->
          <div v-if="searchQuery && (searchResults.length > 0 || loading)" class="search-section">
            <div v-if="loading" class="loading-state">
              <div class="spinner"></div>
              <p>搜索中...</p>
            </div>

            <div v-else class="results-list">
              <div
                v-for="(item, index) in searchResults"
                :key="item.id"
                class="result-item"
                :class="{ highlighted: index === highlightedIndex }"
                @click="goToArticle(item.slug)"
              >
                <DocumentIcon class="result-icon" />
                <div class="result-content">
                  <div class="result-title">{{ highlightMatch(item.title) }}</div>
                  <div class="result-meta">
                    <span class="result-category">{{ item.category?.name }}</span>
                    <span class="result-views">
                      <EyeIcon /> {{ item.views }}
                    </span>
                  </div>
                </div>
                <span class="result-arrow">→</span>
              </div>
            </div>
          </div>

          <!-- 无结果 -->
          <div v-if="searchQuery && !loading && searchResults.length === 0" class="empty-state">
            <SearchIcon class="empty-icon" />
            <h3>未找到相关内容</h3>
            <p>尝试使用其他关键词搜索</p>
          </div>

          <!-- 快捷键提示 -->
          <div class="search-footer">
            <div class="shortcuts">
              <span class="shortcut-item">
                <kbd>↑</kbd><kbd>↓</kbd> 导航
              </span>
              <span class="shortcut-item">
                <kbd>↵</kbd> 打开
              </span>
              <span class="shortcut-item">
                <kbd>ESC</kbd> 关闭
              </span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { searchApi } from '@/api'
import { useDebounceFn } from '@vueuse/core'
import SearchIcon from '@/components/icons/SearchIcon.vue'
import ClockIcon from '@/components/icons/ClockIcon.vue'
import DocumentIcon from '@/components/icons/DocumentIcon.vue'
import EyeIcon from '@/components/icons/EyeIcon.vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (_e: 'close'): void
}>()

const router = useRouter()
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const loading = ref(false)
const highlightedIndex = ref(-1)
const searchInputRef = ref<HTMLInputElement | null>(null)

// 搜索历史
const searchHistory = ref<string[]>([])
const HISTORY_KEY = 'search_history'
const MAX_HISTORY = 5

// 热门搜索
const popularSearches = ref([
  'Vue 3',
  'TypeScript',
  '性能优化',
  '前端架构',
  '全栈开发',
])

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

// 搜索处理（防抖）
const handleSearchDebounced = useDebounceFn(async (query: string) => {
  if (!query.trim()) {
    searchResults.value = []
    return
  }

  loading.value = true
  highlightedIndex.value = -1

  try {
    const response = await searchApi.search(query)
    if (response.success && response.data) {
      searchResults.value = response.data.articles || []
    }
  } catch {
    searchResults.value = []
  } finally {
    loading.value = false
  }
}, 300)

const handleSearch = () => {
  handleSearchDebounced(searchQuery.value)
}

// 高亮匹配文本
const highlightMatch = (text: string) => {
  if (!searchQuery.value) return text

  const regex = new RegExp(`(${searchQuery.value})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 导航控制
const highlightNext = () => {
  if (searchResults.value.length === 0) return
  highlightedIndex.value = (highlightedIndex.value + 1) % searchResults.value.length
}

const highlightPrev = () => {
  if (searchResults.value.length === 0) return
  highlightedIndex.value =
    highlightedIndex.value <= 0 ? searchResults.value.length - 1 : highlightedIndex.value - 1
}

const handleEnter = () => {
  if (highlightedIndex.value >= 0 && searchResults.value[highlightedIndex.value]) {
    goToArticle(searchResults.value[highlightedIndex.value].slug)
  } else if (searchQuery.value) {
    saveToHistory(searchQuery.value)
    router.push({ path: '/search', query: { q: searchQuery.value } })
    close()
  }
}

// 跳转到文章
const goToArticle = (slug: string) => {
  saveToHistory(searchQuery.value)
  close()
  router.push(`/article/${slug}`)
}

// 搜索历史项
const searchHistoryItem = (query: string) => {
  searchQuery.value = query
  handleSearch()
}

// 关闭模态框
const close = () => {
  emit('close')
  searchQuery.value = ''
  searchResults.value = []
  highlightedIndex.value = -1
}

// 监听显示状态，自动聚焦输入框
watch(() => props.show, async (show) => {
  if (show) {
    loadHistory()
    await nextTick()
    searchInputRef.value?.focus()
  }
})

// 监听 ESC 键
const handleEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.show) {
    close()
  }
}

// 监听快捷键
const handleShortcut = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    if (props.show) {
      close()
    } else {
      emit('close') // 实际上是触发打开，由父组件处理
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleEsc)
  window.addEventListener('keydown', handleShortcut)
}
</script>

<style scoped>
/* ========== 模态框遮罩 ========== */
.search-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  z-index: 9999;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .search-modal-container,
.modal-leave-to .search-modal-container {
  transform: translateY(-20px) scale(0.95);
}

/* ========== 模态框容器 ========== */
.search-modal-container {
  width: 90%;
  max-width: 640px;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl), var(--shadow-glow);
  border: 1px solid var(--border-color);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 70vh;
  transition: transform 0.2s ease;
}

/* ========== 搜索输入框 ========== */
.search-input-wrapper {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  gap: 1rem;
}

.search-icon {
  width: 20px;
  height: 20px;
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

.close-btn {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* ========== 搜索区域 ========== */
.search-section {
  padding: 1rem 1.5rem;
  overflow-y: auto;
  max-height: 50vh;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clear-btn {
  padding: 0.25rem 0.75rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

/* ========== 搜索历史 ========== */
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
}

.history-item:hover {
  background: var(--bg-secondary);
}

.history-icon {
  width: 16px;
  height: 16px;
  opacity: 0.6;
}

.history-text {
  flex: 1;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.history-arrow {
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* ========== 热门搜索 ========== */
.popular-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.popular-item {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.popular-item:hover {
  background: var(--gradient-primary);
  color: white;
  border-color: transparent;
  transform: translateY(-1px);
}

/* ========== 搜索结果 ========== */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.result-item:hover,
.result-item.highlighted {
  background: var(--bg-secondary);
  border-color: var(--accent-primary);
  transform: translateX(4px);
}

.result-icon {
  width: 20px;
  height: 20px;
  opacity: 0.7;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-title :deep(mark) {
  background: var(--accent-primary);
  color: white;
  padding: 0 0.25rem;
  border-radius: 2px;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.result-arrow {
  color: var(--text-muted);
  font-size: 1rem;
}

/* ========== 加载状态 ========== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
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
  padding: 3rem 2rem;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  opacity: 0.4;
}

.empty-state h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* ========== 底部快捷键提示 ========== */
.search-footer {
  padding: 0.75rem 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.shortcuts {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.shortcut-item kbd {
  padding: 0.2rem 0.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 0.75rem;
  font-weight: 600;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .search-modal-container {
    width: 95%;
    max-height: 80vh;
  }

  .search-input-wrapper {
    padding: 1rem;
  }

  .shortcuts {
    flex-wrap: wrap;
    gap: 1rem;
  }
}
</style>
