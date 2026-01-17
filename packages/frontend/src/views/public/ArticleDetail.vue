<template>
  <div class="article-detail">
    <!-- 阅读进度条 -->
    <div class="reading-progress" :style="{ width: `${scrollProgress}%` }"></div>

    <div v-if="articleStore.loading" class="loading">加载中...</div>

    <article v-else-if="article" class="article-container">
      <!-- 返回按钮 - 改进设计 -->
      <div class="back-nav">
        <router-link to="/articles" class="back-btn">
          <ArrowLeftIcon />
          <span>返回文章列表</span>
        </router-link>
      </div>

      <!-- 文章头部 - 移除 emoji，应用现代化设计 -->
      <header class="article-header">
        <div class="header-meta">
          <router-link
            :to="`/category/${article.category?.slug}`"
            class="category-badge"
          >
            <CategoryIcon />
            {{ article.category?.name }}
          </router-link>
          <span class="date">{{ formatDate(article.createdAt) }}</span>
        </div>

        <h1 class="title">{{ article.title }}</h1>

        <div v-if="article.tags && article.tags.length" class="tags">
          <router-link
            v-for="tag in article.tags"
            :key="tag.id"
            :to="`/tag/${tag.slug}`"
            class="tag"
          >
            #{{ tag.name }}
          </router-link>
        </div>

        <div class="author-info">
          <div class="author-avatar">
            {{ article.author?.username?.charAt(0) }}
          </div>
          <div class="author-details">
            <span class="author-name">{{ article.author?.username }}</span>
            <span class="article-stats">
              <EyeIcon />
              {{ article.views }} 次阅读
            </span>
          </div>
        </div>
      </header>

      <!-- 文章内容 -->
      <div class="content-wrapper">
        <div class="content markdown-body" v-html="renderedContent"></div>
      </div>

      <!-- 文章底部 -->
      <footer class="article-footer">
        <div class="footer-actions">
          <router-link to="/articles" class="action-btn">
            <ArticleIcon />
            <span>更多文章</span>
          </router-link>
          <button @click="scrollToTop" class="action-btn">
            <ArrowUpIcon />
            <span>回到顶部</span>
          </button>
        </div>
      </footer>
    </article>

    <div v-else class="error">文章不存在</div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useArticleStore } from '@/stores/article'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import ArrowLeftIcon from '@/components/icons/ArrowLeftIcon.vue'
import ArticleIcon from '@/components/icons/ArticleIcon.vue'
import EyeIcon from '@/components/icons/EyeIcon.vue'
import ArrowUpIcon from '@/components/icons/ArrowUpIcon.vue'
import CategoryIcon from '@/components/icons/CategoryIcon.vue'

const route = useRoute()
const articleStore = useArticleStore()

// 阅读进度
const scrollProgress = ref(0)

const handleScroll = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = (scrollTop / docHeight) * 100
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Markdown 配置（增强代码块）
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang }).value
        // 包装成带复制按钮的代码块
        return `<div class="code-block-wrapper" data-language="${lang}">
          <div class="code-header">
            <span class="code-language">${lang}</span>
            <button class="copy-button" onclick="copyCode(this)" title="复制代码">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span class="copy-text">复制</span>
            </button>
          </div>
          <pre class="code-content"><code class="language-${lang}">${highlighted}</code></pre>
        </div>`
      } catch {
        // ignore
      }
    }
    return ''
  },
})

const article = computed(() => articleStore.currentArticle)

const renderedContent = computed(() => {
  return article.value ? md.render(article.value.content) : ''
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(() => {
  const slug = route.params.slug as string
  articleStore.fetchArticleBySlug(slug)

  // 监听滚动
  window.addEventListener('scroll', handleScroll)

  // 添加全局复制函数
  ;(window as any).copyCode = (button: HTMLElement) => {
    const codeBlock = button.closest('.code-block-wrapper')
    const code = codeBlock?.querySelector('code')?.textContent

    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        const textSpan = button.querySelector('.copy-text')
        if (textSpan) {
          textSpan.textContent = '已复制!'
          setTimeout(() => {
            textSpan.textContent = '复制'
          }, 2000)
        }
      })
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.article-detail {
  min-height: 100vh;
  position: relative;
}

/* ========== 阅读进度条 ========== */
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--accent-gradient);
  z-index: 1000;
  transition: width 0.1s linear;
}

/* ========== 返回导航 ========== */
.back-nav {
  max-width: 900px;
  margin: 2rem auto 0;
  padding: 0 2rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.back-btn:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
  transform: translateX(-4px);
}

/* ========== 文章容器 ========== */
.article-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 2rem;
}

/* ========== 文章头部 ========== */
.article-header {
  text-align: center;
  padding: 3rem 0;
  margin-bottom: 3rem;
  position: relative;
}

.header-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: var(--accent-gradient);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.2s;
}

.category-badge:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-glow);
}

.date {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  line-height: 1.2;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.tag:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
  transform: translateY(-2px);
}

.author-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.author-avatar {
  width: 48px;
  height: 48px;
  background: var(--accent-gradient);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
}

.author-details {
  text-align: left;
}

.author-name {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
}

.article-stats {
  font-size: 0.875rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* ========== 文章内容 ========== */
.content-wrapper {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 3rem;
  box-shadow: var(--shadow-xl);
}

.content {
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--text-primary);
}

/* Markdown 样式增强 */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.markdown-body :deep(p) {
  margin-bottom: 1rem;
}

.markdown-body :deep(img) {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin: 1.5rem 0;
}

/* 代码块样式 */
.markdown-body :deep(.code-block-wrapper) {
  margin: 1.5rem 0;
  background: rgba(30, 30, 30, 0.95);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

.markdown-body :deep(.code-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.markdown-body :deep(.code-language) {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #818cf8;
}

.markdown-body :deep(.copy-button) {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.markdown-body :deep(.copy-button:hover) {
  background: rgba(255, 255, 255, 0.2);
}

.markdown-body :deep(.code-content) {
  padding: 1rem;
  overflow-x: auto;
}

/* ========== 文章底部 ========== */
.article-footer {
  margin-top: 3rem;
}

.footer-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.action-btn:hover {
  background: var(--accent-gradient);
  color: white;
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .article-container {
    padding: 1.5rem;
  }

  .content-wrapper {
    padding: 1.5rem;
  }

  .title {
    font-size: 1.75rem;
  }

  .back-nav {
    padding: 0 1rem;
  }

  .markdown-body :deep(.code-block-wrapper) {
    margin: 1rem 0;
  }

  .footer-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

<style>
/* 全局 Markdown 样式 */
.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-weight: 600;
  line-height: 1.3;
}

.markdown-body h1 {
  font-size: 2em;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5rem;
}

.markdown-body h2 {
  font-size: 1.5em;
}

.markdown-body h3 {
  font-size: 1.25em;
}

.markdown-body p {
  margin-bottom: 1em;
}

.markdown-body code {
  background: var(--bg-secondary);
  padding: 0.2em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
}

.markdown-body pre {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 1em;
}

.markdown-body pre code {
  background: none;
  padding: 0;
}

.markdown-body blockquote {
  border-left: 4px solid var(--accent-color);
  padding-left: 1rem;
  margin-left: 0;
  color: var(--text-secondary);
}

.markdown-body ul,
.markdown-body ol {
  margin-bottom: 1em;
  padding-left: 2em;
}

.markdown-body a {
  color: var(--accent-color);
}

.markdown-body img {
  max-width: 100%;
  border-radius: 8px;
  margin: 1rem 0;
}
</style>
