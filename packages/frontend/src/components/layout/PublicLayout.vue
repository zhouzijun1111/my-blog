<template>
  <div class="public-layout">
    <header class="header">
      <nav class="nav">
        <div class="nav-brand">
          <router-link to="/">一剑轻安的博客</router-link>
        </div>
        <div class="nav-links">
          <router-link to="/">首页</router-link>
          <router-link to="/articles">文章</router-link>
          <button class="search-trigger" @click="openSearch">
            <span class="search-icon">🔍</span>
            <span class="search-text">搜索...</span>
            <span class="search-shortcut">⌘K</span>
          </button>
          <router-link to="/login">管理后台</router-link>
          <ThemeToggle />
        </div>
      </nav>
    </header>

    <main class="main">
      <router-view />
    </main>

    <footer class="footer">
      <p>&copy; 2024 一剑轻安的博客. All rights reserved.</p>
    </footer>

    <!-- 全局搜索模态框 -->
    <SearchModal :show="showSearch" @close="showSearch = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import SearchModal from '@/components/SearchModal.vue'

const showSearch = ref(false)

const openSearch = () => {
  showSearch.value = true
}

// 快捷键打开搜索
const handleShortcut = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    showSearch.value = !showSearch.value
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleShortcut)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleShortcut)
})
</script>

<style scoped>
.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand a {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--accent-color);
}

/* ========== 搜索触发按钮 ========== */
.search-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s;
}

.search-trigger:hover {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-icon {
  font-size: 1rem;
  opacity: 0.7;
}

.search-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.search-shortcut {
  padding: 0.2rem 0.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted);
}

.main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.footer {
  background: var(--bg-card);
  border-top: 1px solid var(--border-color);
  padding: 2rem 1.5rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .nav {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
}
</style>
