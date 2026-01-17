<template>
  <div class="loading-spinner" :class="`loading-spinner-${size}`">
    <div class="spinner"></div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  text: ''
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
}

.spinner {
  border-radius: var(--radius-full);
  border: 3px solid var(--glass-border);
  border-top-color: var(--accent-primary);
  animation: spin 0.8s linear infinite;
}

.loading-spinner-sm .spinner {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.loading-spinner-md .spinner {
  width: 40px;
  height: 40px;
  border-width: 3px;
}

.loading-spinner-lg .spinner {
  width: 56px;
  height: 56px;
  border-width: 4px;
}

.loading-text {
  color: var(--text-muted);
  font-size: var(--text-sm);
  text-align: center;
  margin: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
