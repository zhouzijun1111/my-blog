<template>
  <div class="comment-item" :class="{ 'comment-item-reply': isReply }">
    <div class="comment-avatar">
      <img :src="avatarUrl" :alt="comment.author" />
    </div>

    <div class="comment-content">
      <div class="comment-meta">
        <span class="comment-author">{{ comment.author }}</span>
        <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
      </div>

      <p class="comment-text">{{ comment.content }}</p>

      <div class="comment-actions">
        <LiquidButton
          v-if="canReply"
          size="sm"
          variant="ghost"
          @click="handleReply"
        >
          <span>💬</span> 回复
        </LiquidButton>

        <LiquidButton
          v-if="canDelete"
          size="sm"
          variant="ghost"
          @click="handleDelete"
        >
          <span>🗑️</span> 删除
        </LiquidButton>
      </div>

      <!-- 嵌套回复 -->
      <div v-if="comment.replies && comment.replies.length > 0" class="comment-replies">
        <CommentItem
          v-for="reply in comment.replies"
          :key="reply.id"
          :comment="reply"
          :article-slug="articleSlug"
          :is-reply="true"
          :current-user="currentUser"
          @reply="$emit('reply', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LiquidButton from './common/LiquidButton.vue'

interface Comment {
  id: string
  content: string
  author: string
  email?: string
  createdAt: string
  parentId?: string
  replies?: Comment[]
}

interface Props {
  comment: Comment
  articleSlug: string
  currentUser?: any
  isReply?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isReply: false
})

const emit = defineEmits<{
  reply: [commentId: string]
  delete: [commentId: string]
}>()

// 生成头像URL（使用 Gravatar 或默认头像）
const avatarUrl = computed(() => {
  if (props.comment.email) {
    // Gravatar
    const email = props.comment.email.toLowerCase().trim()
    const hash = btoa(email)
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=80`
  }
  // 默认头像
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(props.comment.author)}&background=random`
})

// 是否可以回复
const canReply = computed(() => {
  return props.currentUser && !props.isReply // 暂不支持多层嵌套
})

// 是否可以删除（管理员）
const canDelete = computed(() => {
  return props.currentUser && props.currentUser.role === 'admin'
})

// 格式化日期
const formatDate = (date: string) => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}

const handleReply = () => {
  emit('reply', props.comment.id)
}

const handleDelete = () => {
  emit('delete', props.comment.id)
}
</script>

<style scoped>
.comment-item {
  display: flex;
  gap: var(--space-md);
  animation: fadeIn 0.3s ease-out;
}

.comment-item-reply {
  margin-top: var(--space-lg);
  margin-left: var(--space-xl);
  padding-left: var(--space-lg);
  border-left: 2px solid var(--glass-border);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 头像 */
.comment-avatar {
  flex-shrink: 0;
}

.comment-avatar img {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

/* 内容 */
.comment-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-author {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.comment-date {
  color: var(--text-muted);
  font-size: var(--text-xs);
}

.comment-text {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: var(--space-sm) 0;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 操作按钮 */
.comment-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-xs);
}

.comment-actions button {
  padding: var(--space-xs) var(--space-sm) !important;
  font-size: var(--text-xs) !important;
}

/* 嵌套回复 */
.comment-replies {
  margin-top: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

/* 响应式 */
@media (max-width: 768px) {
  .comment-item-reply {
    margin-left: var(--space-md);
    padding-left: var(--space-md);
  }

  .comment-avatar img {
    width: 40px;
    height: 40px;
  }
}
</style>
