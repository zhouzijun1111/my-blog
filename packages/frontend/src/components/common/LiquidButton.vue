<template>
  <button
    :class="[
      'liquid-button',
      `liquid-button-${variant}`,
      `liquid-button-${size}`,
      {
        'liquid-button-loading': loading,
        'liquid-button-disabled': disabled
      }
    ]"
    :disabled="loading || disabled"
    @click="handleClick"
  >
    <!-- 背景层 -->
    <span class="liquid-button-bg"></span>

    <!-- 涟漪效果层 -->
    <span class="liquid-button-ripple"></span>

    <!-- 内容层 -->
    <span class="liquid-button-content">
      <slot />
    </span>

    <!-- 加载指示器 -->
    <span v-if="loading" class="liquid-button-spinner"></span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (e: MouseEvent) => {
  if (!props.loading && !props.disabled) {
    emit('click', e)
    createRipple(e)
  }
}

const createRipple = (event: MouseEvent) => {
  const button = event.currentTarget as HTMLElement
  const ripple = button.querySelector('.liquid-button-ripple') as HTMLElement

  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2

  ripple.style.width = ripple.style.height = `${size}px`
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`

  ripple.classList.add('liquid-button-ripple-active')

  setTimeout(() => {
    ripple.classList.remove('liquid-button-ripple-active')
  }, 600)
}
</script>

<style scoped>
.liquid-button {
  position: relative;
  padding: var(--space-sm) var(--space-xl);
  font-size: var(--text-base);
  font-weight: 600;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  overflow: hidden;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

/* 尺寸变体 */
.liquid-button-sm {
  padding: var(--space-xs) var(--space-lg);
  font-size: var(--text-sm);
}

.liquid-button-lg {
  padding: var(--space-md) var(--space-2xl);
  font-size: var(--text-lg);
}

/* 背景层 */
.liquid-button-bg {
  position: absolute;
  inset: 0;
  background: var(--gradient-liquid);
  transition: all var(--transition-base);
}

/* 变体样式 */
.liquid-button-secondary .liquid-button-bg {
  background: var(--gradient-secondary);
}

.liquid-button-ghost .liquid-button-bg {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
}

/* 涟漪效果层 */
.liquid-button-ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: scale(0);
  pointer-events: none;
  transition: transform 0s;
}

.liquid-button-ripple-active {
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

/* 内容层 */
.liquid-button-content {
  position: relative;
  z-index: 2;
  color: white;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.liquid-button-ghost .liquid-button-content {
  color: var(--text-primary);
}

/* 悬停效果 */
.liquid-button:hover:not(.liquid-button-disabled):not(.liquid-button-loading) {
  transform: translateY(-2px);
  box-shadow:
    0 10px 20px rgba(99, 102, 241, 0.3),
    0 0 0 1px rgba(99, 102, 241, 0.2);
}

.liquid-button:hover:not(.liquid-button-disabled):not(.liquid-button-loading) .liquid-button-bg {
  filter: brightness(1.1) saturate(1.1);
}

/* 点击效果 */
.liquid-button:active:not(.liquid-button-disabled):not(.liquid-button-loading) {
  transform: translateY(0) scale(0.98);
}

/* 加载状态 */
.liquid-button-loading {
  pointer-events: none;
  opacity: 0.8;
}

.liquid-button-spinner {
  position: relative;
  z-index: 2;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 禁用状态 */
.liquid-button-disabled {
  pointer-events: none;
  opacity: 0.5;
  cursor: not-allowed;
}

/* 暗色模式 */
.dark .liquid-button-ghost .liquid-button-content {
  color: var(--text-primary);
}

/* 响应式 */
@media (max-width: 768px) {
  .liquid-button {
    padding: var(--space-sm) var(--space-lg);
  }

  .liquid-button-lg {
    padding: var(--space-md) var(--space-xl);
  }
}
</style>
