<template>
  <div class="admin-layout">
    <!-- 现代化侧边栏 -->
    <aside class="sidebar">
      <!-- 品牌区域 - 玻璃拟态增强 -->
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-icon">
            <HomeIcon />
          </div>
          <div>
            <h2>一剑轻安</h2>
            <span class="brand-badge">管理后台</span>
          </div>
        </div>
        <!-- 装饰性渐变背景 -->
        <div class="brand-glow"></div>
      </div>

      <!-- 导航菜单 -->
      <nav class="sidebar-nav">
        <router-link to="/admin/articles" class="nav-item" v-slot="{ isActive }">
          <div class="nav-icon-wrapper" :class="{ active: isActive }">
            <ArticleIcon />
          </div>
          <span class="nav-text">文章管理</span>
          <div class="nav-indicator" v-if="isActive"></div>
        </router-link>

        <router-link to="/admin/categories" class="nav-item">
          <div class="nav-icon-wrapper">
            <CategoryIcon />
          </div>
          <span class="nav-text">分类管理</span>
          <div class="nav-indicator"></div>
        </router-link>

        <router-link to="/admin/tags" class="nav-item">
          <div class="nav-icon-wrapper">
            <TagIcon />
          </div>
          <span class="nav-text">标签管理</span>
          <div class="nav-indicator"></div>
        </router-link>
      </nav>

      <!-- 底部操作区 -->
      <div class="sidebar-footer">
        <button class="logout-btn" @click="handleLogout">
          <LogoutIcon />
          <span>退出登录</span>
        </button>
        <div class="theme-toggle-wrapper">
          <ThemeToggle />
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 顶部栏 - 现代化设计 -->
      <header class="top-bar">
        <div class="page-title">
          <h1>{{ pageTitle }}</h1>
          <p v-if="pageSubtitle" class="page-subtitle">{{ pageSubtitle }}</p>
        </div>
        <div class="top-bar-actions">
          <router-link to="/" class="view-site-btn">
            <span>查看网站</span>
            <ExternalLinkIcon />
          </router-link>
        </div>
      </header>

      <!-- 内容区域 - 添加页面过渡 -->
      <div class="content">
        <router-view v-slot="{ Component }">
          <transition :name="transitionName" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleIcon from '@/components/icons/ArticleIcon.vue'
import CategoryIcon from '@/components/icons/CategoryIcon.vue'
import TagIcon from '@/components/icons/TagIcon.vue'
import LogoutIcon from '@/components/icons/LogoutIcon.vue'
import HomeIcon from '@/components/icons/HomeIcon.vue'
import ExternalLinkIcon from '@/components/icons/ExternalLinkIcon.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    AdminArticles: '文章管理',
    AdminArticleCreate: '新建文章',
    AdminArticleEdit: '编辑文章',
    AdminCategories: '分类管理',
    AdminTags: '标签管理',
  }
  return titles[route.name as string] || '管理后台'
})

const pageSubtitle = computed(() => {
  const subtitles: Record<string, string> = {
    AdminArticles: '管理所有博客文章内容',
    AdminArticleCreate: '创建新的博客文章',
    AdminArticleEdit: '编辑文章内容和设置',
    AdminCategories: '管理文章分类',
    AdminTags: '管理文章标签',
  }
  return subtitles[route.name as string] || ''
})

const transitionName = computed(() => {
  // 根据路由深度决定过渡方向
  return route.meta.transition || 'fade'
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

/* ========== 现代化侧边栏 ========== */
.sidebar {
  width: 280px;
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur-strong);
  -webkit-backdrop-filter: var(--glass-blur-strong);
  border-right: var(--glass-border);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
  box-shadow: var(--shadow-xl);
  transition: all var(--transition-base);
}

/* 品牌区域 */
.sidebar-header {
  padding: var(--space-xl);
  position: relative;
  border-bottom: var(--glass-border);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  position: relative;
  z-index: 2;
}

.brand-icon {
  width: 48px;
  height: 48px;
  background: var(--gradient-liquid);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-glow);
}

.brand h2 {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.brand-badge {
  display: inline-block;
  font-size: var(--text-xs);
  padding: 2px 8px;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
  margin-top: 4px;
}

.brand-glow {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: var(--gradient-liquid);
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  z-index: 1;
}

/* 导航菜单 */
.sidebar-nav {
  flex: 1;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-secondary);
  transition: all var(--transition-base);
  position: relative;
  cursor: pointer;
}

.nav-item:hover {
  background: rgba(99, 102, 241, 0.1);
  color: var(--text-primary);
  transform: translateX(4px);
}

.nav-item.router-link-active {
  background: var(--gradient-liquid);
  color: white;
  box-shadow: var(--shadow-glow);
}

.nav-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.5);
  transition: all var(--transition-base);
}

.nav-item:hover .nav-icon-wrapper {
  background: rgba(99, 102, 241, 0.2);
}

.nav-item.router-link-active .nav-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
}

.nav-icon-wrapper svg {
  width: 20px;
  height: 20px;
}

.nav-text {
  flex: 1;
  font-weight: 500;
  font-size: var(--text-sm);
}

.nav-indicator {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
}

/* 底部操作区 */
.sidebar-footer {
  padding: var(--space-lg);
  border-top: var(--glass-border);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all var(--transition-base);
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--color-error);
  color: var(--color-error);
}

.theme-toggle-wrapper {
  margin-top: var(--space-md);
}

/* ========== 主内容区 ========== */
.main-content {
  flex: 1;
  margin-left: 280px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 顶部栏 */
.top-bar {
  padding: var(--space-xl) var(--space-2xl);
  background: var(--glass-bg-weak);
  backdrop-filter: var(--glass-blur-weak);
  border-bottom: var(--glass-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 50;
}

.page-title h1 {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.page-subtitle {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-top: var(--space-xs);
}

.view-site-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background: var(--gradient-primary);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-md);
}

.view-site-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

/* 内容区域 */
.content {
  flex: 1;
  padding: var(--space-2xl);
  overflow-y: auto;
}

/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 暗色模式适配 */
.dark .sidebar {
  background: rgba(30, 30, 30, 0.85);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.dark .nav-item:hover {
  background: rgba(99, 102, 241, 0.2);
}

.dark .nav-icon-wrapper {
  background: rgba(255, 255, 255, 0.1);
}
</style>
