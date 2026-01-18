<template>
  <div class="public-layout">
    <header class="header" :class="{ 'scrolled': isScrolled }">
      <nav class="nav">
        <div class="nav-brand">
          <router-link to="/">一剑轻安的博客</router-link>
        </div>

        <!-- 桌面端导航 -->
        <div class="nav-links desktop-nav">
          <router-link to="/">首页</router-link>
          <router-link to="/articles">文章</router-link>
          <button class="search-trigger" @click="openSearch">
            <SearchIcon />
            <span class="search-text">搜索...</span>
            <span class="search-shortcut">⌘K</span>
          </button>
          <router-link to="/login">管理后台</router-link>
          <ThemeToggle />
        </div>

        <!-- 移动端菜单按钮 -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="打开菜单">
          <MenuIcon v-if="!isMobileMenuOpen" />
          <XIcon v-else />
        </button>
      </nav>
    </header>

    <!-- 移动端抽屉菜单 -->
    <Transition name="slide">
      <div v-if="isMobileMenuOpen" class="mobile-drawer" @click="closeMobileMenu">
        <div class="drawer-content" @click.stop>
          <nav class="drawer-nav">
            <router-link to="/" @click="closeMobileMenu">首页</router-link>
            <router-link to="/articles" @click="closeMobileMenu">文章</router-link>
            <button class="search-trigger" @click="openSearchAndClose">
              <SearchIcon />
              <span>搜索文章...</span>
            </button>
            <router-link to="/login" @click="closeMobileMenu">管理后台</router-link>
          </nav>
          <div class="drawer-footer">
            <ThemeToggle />
            <p class="copyright">© 2024 一剑轻安的博客</p>
          </div>
        </div>
      </div>
    </Transition>

    <main class="main">
      <router-view />
    </main>

    <footer class="footer desktop-only">
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
import SearchIcon from '@/components/icons/SearchIcon.vue'
import MenuIcon from '@/components/icons/MenuIcon.vue'
import XIcon from '@/components/icons/XIcon.vue'

const showSearch = ref(false)
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const openSearch = () => {
  showSearch.value = true
}

const openSearchAndClose = () => {
  showSearch.value = true
  isMobileMenuOpen.value = false
}

// 滚动状态检测
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  // 防止背景滚动
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

// 快捷键打开搜索
const handleShortcut = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    showSearch.value = !showSearch.value
  }
  // ESC键关闭移动菜单
  if (e.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('keydown', handleShortcut)
  handleScroll() // 初始化状态
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('keydown', handleShortcut)
  document.body.style.overflow = '' // 清理
})
</script>

<style scoped>
.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ========== 导航栏容器 ========== */
.header {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all var(--duration-300) var(--ease-in-out);
  padding-top: var(--space-6);
  padding-bottom: var(--space-6);
}

/* 滚动后的状态 */
.header.scrolled {
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur-strong);
  box-shadow: var(--shadow-md);
  padding-top: var(--space-3);
  padding-bottom: var(--space-3);
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ========== 品牌标识 ========== */
.nav-brand a {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  text-decoration: none;
  transition: color var(--duration-200) var(--ease-out);
}

.nav-brand a:hover {
  color: var(--accent-primary);
}

/* ========== 桌面端导航链接 ========== */
.nav-links {
  display: flex;
  gap: var(--space-6);
  align-items: center;
}

.nav-links a {
  position: relative;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  transition: color var(--duration-200) var(--ease-out);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
}

/* 导航项下划线动画 */
.nav-links a::after {
  content: '';
  position: absolute;
  bottom: var(--space-2);
  left: var(--space-3);
  right: var(--space-3);
  height: 2px;
  background: var(--gradient-liquid);
  transform: scaleX(0);
  transition: transform var(--duration-300) var(--ease-out);
  border-radius: var(--radius-full);
}

.nav-links a:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.nav-links a:hover::after,
.nav-links a.router-link-active::after {
  transform: scaleX(1);
}

.nav-links a.router-link-active {
  color: var(--accent-primary);
}

/* ========== 搜索触发按钮 ========== */
.search-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-200) var(--ease-out);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.search-trigger:hover {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.search-trigger svg {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
}

.search-text {
  color: var(--text-secondary);
}

.search-shortcut {
  padding: var(--space-1) var(--space-2);
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--text-muted);
}

/* ========== 移动端菜单按钮 ========== */
.mobile-menu-btn {
  display: none;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  background: var(--glass-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-200) var(--ease-out);
}

.mobile-menu-btn:hover {
  background: var(--bg-secondary);
  transform: scale(1.05);
}

.mobile-menu-btn svg {
  width: 24px;
  height: 24px;
  color: var(--text-primary);
}

/* ========== 移动端抽屉菜单 ========== */
.mobile-drawer {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: none;
}

.drawer-content {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 85%;
  max-width: 320px;
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur-strong);
  border-left: 1px solid var(--border-color);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
}

.drawer-nav a,
.drawer-nav button {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  text-decoration: none;
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  transition: all var(--duration-200) var(--ease-out);
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
}

.drawer-nav a:hover,
.drawer-nav a.router-link-active {
  background: var(--bg-secondary);
  color: var(--accent-primary);
}

.drawer-nav button {
  justify-content: flex-start;
}

.drawer-nav button svg {
  width: 20px;
  height: 20px;
}

.drawer-footer {
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-color);
}

.copyright {
  margin-top: var(--space-4);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-align: center;
}

/* ========== 抽屉动画 ========== */
.slide-enter-active,
.slide-leave-active {
  transition: all var(--duration-300) var(--ease-in-out);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

.slide-enter-from .drawer-content,
.slide-leave-to .drawer-content {
  transform: translateX(100%);
}

/* ========== 主内容区 ========== */
.main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}

/* ========== 页脚 ========== */
.footer {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border-top: 1px solid var(--border-color);
  padding: var(--space-8) var(--space-6);
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .mobile-drawer {
    display: block;
  }

  .footer {
    display: none;
  }

  .nav {
    padding: 0 var(--space-4);
  }

  .nav-brand a {
    font-size: var(--text-lg);
  }
}

.desktop-only {
  display: block;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }
}
</style>
