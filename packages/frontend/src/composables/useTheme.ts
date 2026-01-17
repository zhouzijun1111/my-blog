import { ref, computed } from 'vue'

// 模块级别的主题状态
const isDark = ref(false)
const isInitialized = ref(false)

// 监听系统主题变化
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

// 初始化主题（立即执行，不等待 onMounted）
function initializeTheme() {
  if (isInitialized.value) return

  const savedTheme = localStorage.getItem('theme')

  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    // 自动检测系统主题
    isDark.value = mediaQuery.matches
  }

  updateDocumentTheme()

  // 监听系统主题变化
  mediaQuery.addEventListener('change', handleSystemThemeChange)

  isInitialized.value = true
}

// 处理系统主题变化
const handleSystemThemeChange = (e: MediaQueryListEvent) => {
  // 只有在用户没有手动设置过主题时才跟随系统
  if (!localStorage.getItem('theme')) {
    isDark.value = e.matches
    updateDocumentTheme()
  }
}

// 更新文档主题
function updateDocumentTheme() {
  document.documentElement.classList.toggle('dark', isDark.value)
  // 添加过渡动画类
  document.documentElement.classList.add('theme-transition')
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transition')
  }, 300)
}

// 供 main.ts 调用的设置函数
export function setupTheme() {
  initializeTheme()
}

export function useTheme() {
  // 确保在首次调用时初始化
  if (!isInitialized.value) {
    initializeTheme()
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    updateDocumentTheme()
  }

  const theme = computed(() => (isDark.value ? 'dark' : 'light'))

  return {
    isDark: computed(() => isDark.value),
    theme,
    toggleTheme,
  }
}
