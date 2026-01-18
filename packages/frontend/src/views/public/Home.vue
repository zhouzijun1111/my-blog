<template>
  <div class="home">
    <!-- 动态背景 -->
    <div class="dynamic-background">
      <div ref="orb1" class="gradient-orb orb-1"></div>
      <div ref="orb2" class="gradient-orb orb-2"></div>
      <div ref="orb3" class="gradient-orb orb-3"></div>
    </div>

    <!-- Hero 区域 -->
    <section class="hero-section">
      <div ref="heroContent" class="hero-content">
        <h1 ref="heroTitle" class="hero-title">
          <span class="title-gradient">欢迎来到一剑轻安的博客</span>
        </h1>
        <p ref="heroSubtitle" class="hero-subtitle">
          探索技术深度，分享编程智慧
        </p>
        <div ref="heroTagsRef" class="hero-tags">
          <span
            v-for="(tag, index) in heroTags"
            :key="tag"
            class="hero-tag"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            {{ tag }}
          </span>
        </div>
        <div ref="heroCTA" class="hero-cta">
          <LiquidButton @click="scrollToArticles">开始阅读</LiquidButton>
        </div>
      </div>
    </section>

    <!-- 文章卡片网格 -->
    <section ref="articlesSection" class="articles-section">
      <div class="section-header">
        <h2 class="section-title">最新文章</h2>
        <div class="section-divider"></div>
      </div>

      <div v-if="articleStore.loading" class="loading-state">
        <div class="skeleton-grid">
          <div v-for="n in 6" :key="n" class="skeleton-card"></div>
        </div>
      </div>

      <div v-else-if="articleStore.articles.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>暂无文章</h3>
        <p>敬请期待精彩内容的发布</p>
      </div>

      <div v-else class="articles-grid">
        <div
          v-for="(article, index) in articleStore.articles"
          :key="article.id"
          :ref="el => setArticleCardRef(el, index)"
          class="article-card-wrapper"
        >
          <ArticleCard :article="article" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useArticleStore } from '@/stores/article'
import ArticleCard from '@/components/ArticleCard.vue'
import LiquidButton from '@/components/common/LiquidButton.vue'

const articleStore = useArticleStore()

// Hero 标签
const heroTags = ['Vue 3', 'TypeScript', '全栈开发', '最佳实践']

// 引用
const heroTitle = ref<HTMLElement>()
const heroSubtitle = ref<HTMLElement>()
const heroTagsRef = ref<HTMLElement>()
const heroCTA = ref<HTMLElement>()
const orb1 = ref<HTMLElement>()
const orb2 = ref<HTMLElement>()
const orb3 = ref<HTMLElement>()

// 文章卡片引用（用于瀑布流动画）
const articleCardRefs = ref<HTMLElement[]>([])
const setArticleCardRef = (el: any, index: number) => {
  if (el) {
    articleCardRefs.value[index] = el.$el || el
  }
}

const articlesSection = ref<HTMLElement>()

onMounted(() => {
  // 延迟执行动画，确保 DOM 就绪
  setTimeout(() => {
    // Hero 动画序列
    animateHero()
  }, 100)

  // 获取文章数据
  articleStore.fetchArticles({ published: true })
})

const animateHero = () => {
  // 标题渐入
  if (heroTitle.value) {
    heroTitle.value.style.opacity = '0'
    heroTitle.value.style.transform = 'translateY(30px)'

    requestAnimationFrame(() => {
      heroTitle.value!.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
      heroTitle.value!.style.opacity = '1'
      heroTitle.value!.style.transform = 'translateY(0)'
    })
  }

  // 副标题延迟渐入
  if (heroSubtitle.value) {
    heroSubtitle.value.style.opacity = '0'
    heroSubtitle.value.style.transform = 'translateY(20px)'

    setTimeout(() => {
      heroSubtitle.value!.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      heroSubtitle.value!.style.opacity = '1'
      heroSubtitle.value!.style.transform = 'translateY(0)'
    }, 150)
  }

  // 标签交错动画
  if (heroTagsRef.value) {
    const tags = heroTagsRef.value.querySelectorAll('.hero-tag')
    tags.forEach((tag, index) => {
      ;(tag as HTMLElement).style.opacity = '0'
      ;(tag as HTMLElement).style.transform = 'translateY(15px)'

      setTimeout(() => {
        ;(tag as HTMLElement).style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        ;(tag as HTMLElement).style.opacity = '1'
        ;(tag as HTMLElement).style.transform = 'translateY(0)'
      }, 300 + index * 80)
    })
  }

  // CTA 按钮
  if (heroCTA.value) {
    heroCTA.value.style.opacity = '0'
    heroCTA.value.style.transform = 'translateY(20px)'

    setTimeout(() => {
      heroCTA.value!.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      heroCTA.value!.style.opacity = '1'
      heroCTA.value!.style.transform = 'translateY(0)'
    }, 500)
  }
}

const scrollToArticles = () => {
  if (articlesSection.value) {
    articlesSection.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* ========== 动态背景 ========== */
.dynamic-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  background: var(--bg-primary);
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(
    circle,
    rgba(99, 102, 241, 0.4) 0%,
    rgba(99, 102, 241, 0) 70%
  );
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(
    circle,
    rgba(139, 92, 246, 0.4) 0%,
    rgba(139, 92, 246, 0) 70%
  );
  bottom: -150px;
  right: -150px;
  animation-delay: -5s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(
    circle,
    rgba(236, 72, 153, 0.3) 0%,
    rgba(236, 72, 153, 0) 70%
  );
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

/* ========== Hero 区域 ========== */
.hero-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3xl) var(--space-xl);
  text-align: center;
  position: relative;
}

.hero-content {
  max-width: 900px;
  position: relative;
  z-index: 2;
}

.hero-title {
  margin-bottom: var(--space-lg);
}

.title-gradient {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 800;
  background: var(--gradient-liquid);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.5rem);
  color: var(--text-secondary);
  margin-bottom: var(--space-2xl);
  line-height: 1.6;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-md);
  margin-bottom: var(--space-2xl);
}

.hero-tag {
  padding: var(--space-sm) var(--space-lg);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.hero-tag:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* ========== 文章区域 ========== */
.articles-section {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-3xl) var(--space-xl);
}

.section-header {
  text-align: center;
  margin-bottom: var(--space-3xl);
}

.section-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-md);
}

.section-divider {
  width: 80px;
  height: 4px;
  background: var(--gradient-liquid);
  border-radius: var(--radius-full);
  margin: 0 auto;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: var(--space-xl);
}

.article-card-wrapper {
  height: 100%;
}

/* ========== 加载骨架屏 ========== */
.loading-state {
  padding: var(--space-xl);
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: var(--space-xl);
}

.skeleton-card {
  height: 400px;
  background: var(--glass-bg);
  border-radius: var(--radius-lg);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* ========== 空状态 ========== */
.empty-state {
  text-align: center;
  padding: var(--space-3xl);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
}

.empty-state h3 {
  font-size: var(--text-xl);
  color: var(--text-primary);
  margin-bottom: var(--space-sm);
}

.empty-state p {
  color: var(--text-secondary);
  font-size: var(--text-lg);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .hero-section {
    padding: var(--space-2xl) var(--space-md);
  }

  .articles-grid {
    grid-template-columns: 1fr;
  }

  .gradient-orb {
    filter: blur(60px);
  }

  .orb-1,
  .orb-2 {
    width: 300px;
    height: 300px;
  }

  .title-gradient {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>