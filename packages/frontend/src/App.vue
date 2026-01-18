<template>
  <n-config-provider :theme="theme">
    <n-message-provider>
      <div class="app-background-effects">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="gradient-orb orb-3"></div>
        <div class="bg-noise"></div>
      </div>
      <router-view v-slot="{ Component, route }">
        <transition :name="route.meta.transition || 'fade'" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NConfigProvider, NMessageProvider, darkTheme } from 'naive-ui'
import { useTheme } from './composables/useTheme'

const { isDark } = useTheme()
const theme = computed(() => (isDark.value ? darkTheme : null))
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:root {
  /* 蓝紫渐变色系 */
  --accent-primary: #6366f1;
  --accent-secondary: #8b5cf6;
  --accent-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  --accent-color: #6366f1;

  /* 背景层级（4级） - 白色模式使用渐变 */
  --bg-primary: linear-gradient(135deg, #fafafa 0%, #f5f7fa 50%, #fafafa 100%);
  --bg-secondary: #f3f4f6;
  --bg-card: rgba(255, 255, 255, 0.85);
  --bg-elevated: rgba(255, 255, 255, 0.95);

  /* 文字层级（3级） */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;

  /* 边框 */
  --border-color: #e5e7eb;
  --border-light: #f3f4f6;

  /* 苹果风格阴影系统 */
  --shadow-xs: 0 1px 1px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-soft: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.15);

  /* 圆角系统（苹果风格） */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* 语义化颜色 */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;

  /* 渐变色系统 */
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --gradient-cool: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --gradient-warm: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  --gradient-nature: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  --gradient-sunset: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  --gradient-ocean: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-forest: linear-gradient(135deg, #38f9d7 0%, #43e97b 100%);
  --gradient-purple-pink: linear-gradient(135deg, #c471ed 0%, #f64f59 100%);
  --gradient-blue-teal: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%);

  /* 分类主题色 */
  --category-tech: #6366f1;
  --category-life: #10b981;
  --category-tutorial: #f59e0b;
  --category-project: #ef4444;

  /* 标签颜色 */
  --tag-blue: #3b82f6;
  --tag-green: #10b981;
  --tag-purple: #8b5cf6;
  --tag-pink: #ec4899;
  --tag-orange: #f97316;
  --tag-cyan: #06b6d4;

  /* 玻璃拟态系统 */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-bg-strong: rgba(255, 255, 255, 0.85);
  --glass-bg-weak: rgba(255, 255, 255, 0.5);
  --glass-blur: blur(20px);
  --glass-blur-strong: blur(40px);
  --glass-blur-weak: blur(10px);
  --glass-border: 1px solid rgba(255, 255, 255, 0.18);

  /* 液态渐变 */
  --gradient-liquid: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);

  /* ========== 间距系统（8px基准） ========== */
  --space-0: 0;
  --space-px: 1px;
  --space-0_5: 0.125rem;   /* 2px */
  --space-1: 0.25rem;       /* 4px */
  --space-1_5: 0.375rem;    /* 6px */
  --space-2: 0.5rem;        /* 8px */
  --space-2_5: 0.625rem;    /* 10px */
  --space-3: 0.75rem;       /* 12px */
  --space-3_5: 0.875rem;    /* 14px */
  --space-4: 1rem;          /* 16px */
  --space-5: 1.25rem;       /* 20px */
  --space-6: 1.5rem;        /* 24px */
  --space-7: 1.75rem;       /* 28px */
  --space-8: 2rem;          /* 32px */
  --space-9: 2.25rem;       /* 36px */
  --space-10: 2.5rem;       /* 40px */
  --space-11: 2.75rem;      /* 44px */
  --space-12: 3rem;         /* 48px */
  --space-14: 3.5rem;       /* 56px */
  --space-16: 4rem;         /* 64px */
  --space-20: 5rem;         /* 80px */
  --space-24: 6rem;         /* 96px */
  --space-28: 7rem;         /* 112px */
  --space-32: 8rem;         /* 128px */

  /* ========== 字体大小系统（明确层级） ========== */
  --text-xs: 0.75rem;        /* 12px */
  --text-sm: 0.875rem;       /* 14px */
  --text-base: 1rem;         /* 16px */
  --text-lg: 1.125rem;       /* 18px */
  --text-xl: 1.25rem;        /* 20px */
  --text-2xl: 1.5rem;        /* 24px */
  --text-3xl: 1.875rem;      /* 30px */
  --text-4xl: 2.25rem;       /* 36px */
  --text-5xl: 3rem;          /* 48px */
  --text-6xl: 3.75rem;       /* 60px */
  --text-7xl: 4.5rem;        /* 72px */
  --text-8xl: 6rem;          /* 96px */
  --text-9xl: 8rem;          /* 128px */

  /* ========== 行高系统 ========== */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* ========== 字重系统 ========== */
  --font-thin: 100;
  --font-extralight: 200;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  --font-black: 900;

  /* ========== 动画时长 ========== */
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;

  /* ========== 缓动函数 ========== */
  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* ========== 容器最大宽度 ========== */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;

  /* ========== 响应式断点 ========== */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* ========== 全局标题系统 ========== */
h1, .h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: -0.025em;
}

h2, .h2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-tight);
  letter-spacing: -0.02em;
}

h3, .h3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
}

h4, .h4 {
  font-size: var(--text-xl);
  font-weight: var(--font-medium);
  line-height: var(--leading-snug);
}

h5, .h5 {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
}

h6, .h6 {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
}

/* ========== 平滑滚动 ========== */
html {
  scroll-behavior: smooth;
}

/* ========== 优化滚动性能 ========== */
* {
  -webkit-overflow-scrolling: touch;
}

/* ========== GPU 加速优化 ========== */
.gradient-orb {
  will-change: transform;
}

.dark {
  /* 暗色模式主色调 */
  --accent-primary: #818cf8;
  --accent-secondary: #a78bfa;
  --accent-gradient: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
  --accent-color: #818cf8;

  /* 暗色背景 - 使用渐变 */
  --bg-primary: linear-gradient(180deg, #0a0a0a 0%, #0f0f12 50%, #0a0a0a 100%);
  --bg-secondary: #141414;
  --bg-card: rgba(26, 26, 26, 0.85);
  --bg-elevated: rgba(38, 38, 38, 0.95);

  /* 暗色文字 */
  --text-primary: #f9fafb;
  --text-secondary: #a1a1aa;
  --text-muted: #71717a;

  /* 暗色边框 */
  --border-color: #262626;
  --border-light: #1f1f1f;

  /* 暗色阴影 */
  --shadow-xs: 0 1px 1px 0 rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
  --shadow-soft: 0 2px 15px -3px rgba(0, 0, 0, 0.4), 0 10px 20px -2px rgba(0, 0, 0, 0.3);
  --shadow-glow: 0 0 30px rgba(129, 140, 248, 0.3);

  /* 暗色模式渐变 */
  --gradient-primary: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
  --gradient-secondary: linear-gradient(135deg, #f472b6 0%, #db2777 100%);
  --gradient-cool: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
  --gradient-warm: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  --gradient-nature: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  --gradient-sunset: linear-gradient(135deg, #fb7185 0%, #f43f5e 100%);
  --gradient-ocean: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  --gradient-forest: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  --gradient-purple-pink: linear-gradient(135deg, #d8b4fe 0%, #f472b6 100%);
  --gradient-blue-teal: linear-gradient(135deg, #7dd3fc 0%, #2dd4bf 100%);

  /* 暗色玻璃拟态系统 */
  --glass-bg: rgba(38, 38, 38, 0.7);
  --glass-bg-strong: rgba(38, 38, 38, 0.85);
  --glass-bg-weak: rgba(38, 38, 38, 0.5);
  --glass-blur: blur(20px);
  --glass-blur-strong: blur(40px);
  --glass-blur-weak: blur(10px);
  --glass-border: 1px solid rgba(255, 255, 255, 0.1);

  /* 暗色液态渐变 */
  --gradient-liquid: linear-gradient(135deg, #818cf8 0%, #a78bfa 100%);
}

#app {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background 0.3s ease, color 0.3s ease;
  position: relative;
}

/* ========== 背景效果层 ========== */
.app-background-effects {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* 浮动渐变光球 */
.gradient-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;
  pointer-events: none;
  z-index: 0;
  animation: float-orb 20s infinite ease-in-out;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: var(--gradient-primary);
  top: -200px;
  left: -200px;
  animation-delay: 0s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: var(--gradient-secondary);
  bottom: -150px;
  right: -150px;
  animation-delay: -5s;
  animation-direction: reverse;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: var(--gradient-cool);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -10s;
  opacity: 0.3;
}

@keyframes float-orb {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -30px) scale(1.05);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.95);
  }
  75% {
    transform: translate(-30px, -20px) scale(1.02);
  }
}

/* 噪点纹理 */
.bg-noise {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.015;
  pointer-events: none;
  z-index: 1;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}

/* 暗色模式下的光球更亮 */
.dark .gradient-orb {
  opacity: 0.5;
}

.dark .orb-3 {
  opacity: 0.4;
}

.dark .bg-noise {
  opacity: 0.02;
}

/* ========== 全局页面过渡动画 ========== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 滑动过渡（用于管理后台） */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
