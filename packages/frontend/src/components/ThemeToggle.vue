<template>
  <div class="theme-switch-wrapper">
    <label class="theme-switch" for="theme-checkbox">
      <input
        type="checkbox"
        id="theme-checkbox"
        :checked="isDark"
        @change="toggleTheme"
      />
      <div class="slider round">
        <span class="icon sun">☀️</span>
        <span class="icon moon">🌙</span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-switch-wrapper {
  display: flex;
  align-items: center;
}

.theme-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
}

.theme-switch input {
  display: none;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  transition: 0.4s;
  border-radius: 34px;
  overflow: hidden;
}

.slider:before {
  position: absolute;
  content: '';
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

input:checked + .slider {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  z-index: 1;
  transition: opacity 0.3s;
}

.sun {
  left: 6px;
  opacity: 1;
}

.moon {
  right: 6px;
  opacity: 0;
}

input:checked + .slider .sun {
  opacity: 0;
}

input:checked + .slider .moon {
  opacity: 1;
}
</style>

<style>
/* 主题切换时的页面过渡动画 */
.theme-transition,
.theme-transition * {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
}
</style>
