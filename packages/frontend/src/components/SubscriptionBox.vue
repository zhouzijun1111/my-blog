<template>
  <GlassCard class="subscription-box" hoverable>
    <div class="subscription-header">
      <div class="icon">📬</div>
      <h3>订阅更新</h3>
      <p>最新文章第一时间送到你的邮箱</p>
    </div>

    <form @submit.prevent="handleSubscribe" class="subscription-form">
      <div class="input-group">
        <input
          v-model="email"
          type="email"
          placeholder="your@email.com"
          :disabled="loading || subscribed"
          class="glass-input"
          required
        />
        <LiquidButton
          type="submit"
          variant="primary"
          :loading="loading"
          :disabled="subscribed"
        >
          {{ subscribed ? '已订阅' : '订阅' }}
        </LiquidButton>
      </div>

      <p v-if="message" class="message" :class="`message-${messageType}`">
        {{ message }}
      </p>
    </form>

    <div class="rss-link">
      <a href="/rss.xml" target="_blank" rel="noopener noreferrer">
        <span class="rss-icon">📡</span>
        <span>RSS 订阅</span>
      </a>
    </div>

    <div class="subscription-info">
      <p class="info-text">
        <span class="info-icon">🔒</span>
        我们尊重您的隐私，不会发送垃圾邮件
      </p>
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GlassCard from './common/GlassCard.vue'
import LiquidButton from './common/LiquidButton.vue'

const email = ref('')
const loading = ref(false)
const subscribed = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const handleSubscribe = async () => {
  if (!email.value.trim()) {
    message.value = '请输入邮箱地址'
    messageType.value = 'error'
    return
  }

  loading.value = true
  message.value = ''

  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.value })
    })

    const data = await response.json()

    if (data.success) {
      subscribed.value = true
      message.value = data.data.message || '订阅成功，请查收验证邮件'
      messageType.value = 'success'
      email.value = ''
    } else {
      throw new Error(data.error?.message || '订阅失败')
    }
  } catch (error: any) {
    console.error('订阅失败:', error)
    message.value = error.message || '订阅失败，请稍后重试'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.subscription-box {
  margin-top: var(--space-2xl);
}

.subscription-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.icon {
  font-size: 48px;
  margin-bottom: var(--space-md);
}

.subscription-header h3 {
  margin: var(--space-sm) 0;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.subscription-header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

/* 表单 */
.subscription-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.input-group {
  display: flex;
  gap: var(--space-md);
}

.glass-input {
  flex: 1;
  padding: var(--space-md);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-base);
  font-family: inherit;
  transition: all var(--transition-base);
}

.glass-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.glass-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message {
  font-size: var(--text-sm);
  text-align: center;
  margin: 0;
  padding: var(--space-sm);
  border-radius: var(--radius-md);
}

.message-success {
  color: var(--color-success);
  background: rgba(34, 197, 94, 0.1);
}

.message-error {
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
}

/* RSS 链接 */
.rss-link {
  margin-top: var(--space-lg);
  text-align: center;
}

.rss-link a {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--text-secondary);
  text-decoration: none;
  padding: var(--space-md);
  background: var(--glass-bg-weak);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
}

.rss-link a:hover {
  background: var(--glass-bg);
  color: var(--accent-primary);
  transform: translateY(-2px);
}

.rss-icon {
  font-size: var(--text-xl);
}

/* 订阅说明 */
.subscription-info {
  margin-top: var(--space-lg);
  text-align: center;
}

.info-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  color: var(--text-muted);
  font-size: var(--text-xs);
  margin: 0;
}

.info-icon {
  font-size: var(--text-sm);
}

/* 响应式 */
@media (max-width: 768px) {
  .input-group {
    flex-direction: column;
  }
}
</style>
