<template>
  <div class="category-list">
    <div class="header">
      <div class="header-content">
        <h2>分类管理</h2>
        <p class="subtitle">组织和分类您的文章内容</p>
      </div>
      <button class="create-btn" @click="showCreateModal = true">
        <span class="icon">+</span>
        <span>新建分类</span>
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="categories.length === 0" class="empty-state">
      <div class="empty-icon">📁</div>
      <h3>暂无分类</h3>
      <p>点击上方按钮创建您的第一个分类</p>
    </div>

    <div v-else class="category-grid">
      <div
        v-for="(category, index) in categories"
        :key="category.id"
        class="category-card"
        :style="{ '--card-gradient': getGradientForIndex(index) }"
      >
        <div class="card-header">
          <div class="category-icon">
            {{ getCategoryIcon(index) }}
          </div>
          <div class="category-info">
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-slug">/{{ category.slug }}</p>
          </div>
        </div>
        <div class="card-footer">
          <div class="article-count">
            <span class="count">{{ category._count?.articles || 0 }}</span>
            <span class="label">篇文章</span>
          </div>
        </div>
      </div>
    </div>

    <n-modal v-model:show="showCreateModal" preset="card" title="新建分类" style="width: 500px" class="create-modal">
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
        <n-form-item label="分类名称" path="name">
          <n-input v-model:value="form.name" placeholder="技术" size="large" />
        </n-form-item>
        <n-form-item label="URL Slug" path="slug">
          <n-input v-model:value="form.slug" placeholder="tech" size="large" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div class="modal-actions">
          <n-button @click="showCreateModal = false" size="large">取消</n-button>
          <n-button type="primary" @click="handleCreate" :loading="submitting" size="large" class="submit-btn">
            创建
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { NModal, NForm, NFormItem, NInput, NButton, useMessage, type FormInst, type FormRules } from 'naive-ui'
import { categoryApi } from '@/api'

const message = useMessage()

const loading = ref(false)
const categories = ref<any[]>([])
const showCreateModal = ref(false)
const submitting = ref(false)
const formRef = ref<FormInst | null>(null)

const form = ref({
  name: '',
  slug: '',
})

const rules: FormRules = {
  name: { required: true, message: '请输入分类名称', trigger: 'blur' },
  slug: { required: true, message: '请输入 Slug', trigger: 'blur' },
}

const gradients = [
  'var(--gradient-primary)',
  'var(--gradient-forest)',
  'var(--gradient-warm)',
  'var(--gradient-ocean)',
  'var(--gradient-sunset)',
  'var(--gradient-nature)',
]

const getGradientForIndex = (index: number) => {
  return gradients[index % gradients.length]
}

const getCategoryIcon = (index: number) => {
  const icons = ['📚', '💻', '🎨', '🔧', '📖', '🚀', '💡', '🎯']
  return icons[index % icons.length]
}

const loadCategories = async () => {
  loading.value = true
  try {
    const response = await categoryApi.getList()
    if (response.success && response.data) {
      categories.value = response.data
    }
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const response = await categoryApi.create(form.value)
    if (response.success) {
      message.success('分类创建成功')
      showCreateModal.value = false
      form.value = { name: '', slug: '' }
      await loadCategories()
    }
  } catch {
    // validation error
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.category-list {
  max-width: 1200px;
  margin: 0 auto;
}

/* ========== 头部 ========== */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 2rem;
}

.header-content h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: var(--shadow-md);
  white-space: nowrap;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.create-btn .icon {
  font-size: 1.25rem;
  font-weight: 300;
}

/* ========== 加载状态 ========== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ========== 空状态 ========== */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.empty-state p {
  color: var(--text-secondary);
}

/* ========== 分类卡片网格 ========== */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--card-gradient);
  transition: height 0.3s;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.category-card:hover::before {
  height: 100%;
  opacity: 0.05;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.category-icon {
  width: 56px;
  height: 56px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
  min-width: 0;
}

.category-name {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-slug {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-family: 'Monaco', 'Consolas', monospace;
  margin: 0;
}

.card-footer {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.article-count {
  display: flex;
  align-items: baseline;
  gap: 0.375rem;
}

.count {
  font-size: 1.5rem;
  font-weight: 700;
  background: var(--card-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* ========== 模态框 ========== */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.submit-btn {
  background: var(--gradient-primary);
  border: none;
  box-shadow: var(--shadow-md);
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .create-btn {
    width: 100%;
    justify-content: center;
  }

  .category-grid {
    grid-template-columns: 1fr;
  }
}
</style>
