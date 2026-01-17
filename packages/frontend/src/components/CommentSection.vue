<template>
  <GlassCard class="comment-section" hoverable>
    <div class="comment-header">
      <h3>评论 ({{ comments.length }})</h3>
      <LiquidButton v-if="currentUser" size="sm" variant="primary" @click="showForm = !showForm">
        {{ showForm ? '收起' : '发表评论' }}
      </LiquidButton>
    </div>

    <!-- 未登录提示 -->
    <div v-if="!currentUser" class="login-hint">
      <p>登录后发表评论</p>
      <div class="login-actions">
        <LiquidButton @click="$router.push('/login')" variant="primary">登录</LiquidButton>
        <LiquidButton @click="$router.push('/register')" variant="secondary">注册</LiquidButton>
      </div>
    </div>

    <!-- 评论表单（登录用户） -->
    <div v-else-if="showForm" class="comment-form-wrapper">
      <form @submit.prevent="handleSubmit" class="comment-form">
        <div class="form-group">
          <label for="comment-content">评论内容</label>
          <textarea
            id="comment-content"
            v-model="form.content"
            placeholder="写下你的评论..."
            rows="4"
            :disabled="submitting"
            class="glass-input"
          ></textarea>
          <span v-if="errors.content" class="error-message">{{ errors.content }}</span>
        </div>

        <div class="form-actions">
          <LiquidButton type="submit" variant="primary" :loading="submitting" :disabled="!form.content.trim()">
            {{ submitting ? '提交中...' : '发表评论' }}
          </LiquidButton>
          <LiquidButton type="button" variant="ghost" @click="handleCancel" :disabled="submitting">
            取消
          </LiquidButton>
        </div>
      </form>
    </div>

    <!-- 评论列表 -->
    <div v-if="loading" class="loading-state">
      <LoadingSpinner />
    </div>

    <div v-else-if="comments.length === 0" class="empty-state">
      <p>暂无评论，快来抢沙发吧！</p>
    </div>

    <div v-else class="comment-list">
      <CommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :article-slug="articleSlug"
        @reply="handleReply"
        @delete="handleDelete"
      />
    </div>
  </GlassCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import GlassCard from './common/GlassCard.vue'
import LiquidButton from './common/LiquidButton.vue'
import CommentItem from './CommentItem.vue'
import LoadingSpinner from './common/LoadingSpinner.vue'

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
  articleSlug: string
}

const props = defineProps<Props>()

const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

const comments = ref<Comment[]>([])
const loading = ref(false)
const submitting = ref(false)
const showForm = ref(false)

const form = ref({
  content: ''
})

const errors = ref<Record<string, string>>({})

// 获取评论列表
const fetchComments = async () => {
  loading.value = true
  try {
    const response = await fetch(`/api/articles/${props.articleSlug}/comments`)
    const data = await response.json()
    if (data.success) {
      comments.value = data.data
    }
  } catch (error) {
    console.error('获取评论失败:', error)
  } finally {
    loading.value = false
  }
}

// 提交评论
const handleSubmit = async () => {
  // 验证
  errors.value = {}
  if (!form.value.content.trim()) {
    errors.value.content = '评论内容不能为空'
    return
  }

  if (form.value.content.length > 1000) {
    errors.value.content = '评论内容最多1000字符'
    return
  }

  submitting.value = true
  try {
    const response = await fetch(`/api/articles/${props.articleSlug}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        content: form.value.content,
        author: currentUser.value?.username || '游客',
        email: currentUser.value?.email
      })
    })

    const data = await response.json()
    if (data.success) {
      // 清空表单
      form.value.content = ''
      showForm.value = false
      // 重新获取评论列表
      await fetchComments()
      alert('评论提交成功，等待管理员审核')
    } else {
      throw new Error(data.error?.message || '提交失败')
    }
  } catch (error: any) {
    console.error('提交评论失败:', error)
    alert(error.message || '提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

// 取消评论
const handleCancel = () => {
  form.value.content = ''
  showForm.value = false
  errors.value = {}
}

// 回复评论
const handleReply = (commentId: string) => {
  // TODO: 实现嵌套评论回复
  console.log('回复评论:', commentId)
  showForm.value = true
}

// 删除评论（管理员）
const handleDelete = async (commentId: string) => {
  if (!confirm('确定要删除这条评论吗？')) return

  try {
    const response = await fetch(`/api/admin/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    const data = await response.json()
    if (data.success) {
      // 从列表中移除
      comments.value = comments.value.filter(c => c.id !== commentId)
      alert('删除成功')
    }
  } catch (error) {
    console.error('删除评论失败:', error)
    alert('删除失败')
  }
}

onMounted(() => {
  fetchComments()
})
</script>

<style scoped>
.comment-section {
  margin-top: var(--space-2xl);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.comment-header h3 {
  margin: 0;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
}

/* 未登录提示 */
.login-hint {
  text-align: center;
  padding: var(--space-2xl);
}

.login-hint p {
  color: var(--text-secondary);
  margin-bottom: var(--space-lg);
}

.login-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}

/* 评论表单 */
.comment-form-wrapper {
  margin-bottom: var(--space-xl);
  padding: var(--space-lg);
  background: var(--glass-bg-weak);
  backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-lg);
  border: var(--glass-border);
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.form-group label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--text-sm);
}

.glass-input {
  width: 100%;
  padding: var(--space-md);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: var(--text-base);
  font-family: inherit;
  resize: vertical;
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

.error-message {
  color: var(--color-danger);
  font-size: var(--text-sm);
}

.form-actions {
  display: flex;
  gap: var(--space-md);
}

/* 加载和空状态 */
.loading-state,
.empty-state {
  text-align: center;
  padding: var(--space-2xl);
}

.empty-state p {
  color: var(--text-muted);
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* 响应式 */
@media (max-width: 768px) {
  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }

  .login-actions {
    flex-direction: column;
  }
}
</style>
