<template>
  <div
    class="glass-card"
    :class="[
      `glass-card-${variant}`,
      { 'glass-card-hoverable': hoverable },
      { 'glass-card-clickable': clickable }
    ]"
    :style="cardStyle"
    @click="handleClick"
  >
    <!-- 渐变背景层 -->
    <div class="glass-card-gradient"></div>

    <!-- 光泽动画层 -->
    <div v-if="hoverable" class="glass-card-shine"></div>

    <!-- 内容层 -->
    <div class="glass-card-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'

interface Props {
  variant?: 'default' | 'strong' | 'weak'
  hoverable?: boolean
  clickable?: boolean
  intensity?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  hoverable: true,
  clickable: false,
  intensity: 0.7
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const cardStyle = computed((): CSSProperties => ({
  '--glass-intensity': props.intensity,
  '--glass-blur-amount':
    props.variant === 'strong' ? '40px' : props.variant === 'weak' ? '10px' : '20px'
}))

const handleClick = (e: MouseEvent) => {
  if (props.clickable) {
    emit('click', e)
  }
}
</script>

<style scoped>
.glass-card {
  position: relative;
  background: rgba(255, 255, 255, var(--glass-intensity));
  backdrop-filter: var(--glass-blur-amount) saturate(180%);
  -webkit-backdrop-filter: var(--glass-blur-amount) saturate(180%);
  border: var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--glass-shadow);
  overflow: hidden;
  transition: all var(--transition-base);
}

/* 顶部高光线 */
.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  pointer-events: none;
}

/* 可悬停样式 */
.glass-card-hoverable:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow:
    var(--shadow-xl),
    0 0 0 1px rgba(99, 102, 241, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

/* 可点击样式 */
.glass-card-clickable {
  cursor: pointer;
  user-select: none;
}

.glass-card-clickable:active {
  transform: translateY(-4px) scale(0.98);
}

/* 渐变背景层 */
.glass-card-gradient {
  position: absolute;
  inset: 0;
  background: var(--gradient-liquid);
  opacity: 0;
  transition: opacity var(--transition-base);
  pointer-events: none;
}

.glass-card-hoverable:hover .glass-card-gradient {
  opacity: 0.05;
}

/* 光泽动画层 */
.glass-card-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transform: skewX(-20deg);
  pointer-events: none;
  transition: left 0.6s;
}

.glass-card-hoverable:hover .glass-card-shine {
  animation: shine 1.5s infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  100% {
    left: 200%;
  }
}

/* 内容层 */
.glass-card-content {
  position: relative;
  z-index: 1;
  padding: var(--space-lg);
}

/* 变体样式 */
.glass-card-strong {
  background: rgba(255, 255, 255, 0.85);
}

.glass-card-weak {
  background: rgba(255, 255, 255, 0.5);
}

/* 暗色模式 */
.dark .glass-card {
  background: rgba(30, 30, 30, var(--glass-intensity));
}

.dark .glass-card-strong {
  background: rgba(38, 38, 38, 0.85);
}

.dark .glass-card-weak {
  background: rgba(26, 26, 26, 0.5);
}

.dark .glass-card-hoverable:hover {
  box-shadow:
    var(--shadow-xl),
    0 0 0 1px rgba(129, 140, 248, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* 响应式 */
@media (max-width: 768px) {
  .glass-card-content {
    padding: var(--space-md);
  }

  .glass-card-hoverable:hover {
    transform: translateY(-4px) scale(1.01);
  }
}
</style>
