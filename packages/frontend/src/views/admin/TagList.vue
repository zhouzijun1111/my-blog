<template>
  <div class="tag-list">
    <div class="header">
      <div class="header-content">
        <h2>标签管理</h2>
        <p class="subtitle">为文章添加灵活的标签分类</p>
      </div>
      <button class="create-btn" @click="showCreateModal = true">
        <span class="icon">+</span>
        <span>新建标签</span>
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="tags.length === 0" class="empty-state">
      <div class="empty-icon">🏷️</div>
      <h3>暂无标签</h3>
      <p>点击上方按钮创建您的第一个标签</p>
    </div>

    <div v-else class="tag-cloud">
      <div
        v-for="(tag, index) in tags"
        :key="tag.id"
        class="tag-card"
        :style="{ '--tag-color': getTagColor(index) }"
      >
        <div class="tag-header">
          <span class="tag-name">{{ tag.name }}</span>
          <span class="tag-count">{{ tag._count?.articles || 0 }}</span>
        </div>
        <div class="tag-footer">
          <span class="tag-slug">{{ tag.slug }}</span>
        </div>
      </div>
    </div>

    <n-modal v-model:show="showCreateModal" preset="card" title="新建标签" style="width: 500px" class="create-modal">
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
        <n-form-item label="标签名称" path="name">
          <n-input v-model:value="form.name" placeholder="JavaScript" size="large" />
        </n-form-item>
        <n-form-item label="URL Slug" path="slug">
          <n-input v-model:value="form.slug" placeholder="javascript" size="large" />
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
import { tagApi } from '@/api'

const message = useMessage()

const loading = ref(false)
const tags = ref<any[]>([])
const showCreateModal = ref(false)
const submitting = ref(false)
const formRef = ref<FormInst | null>(null)

const form = ref({
  name: '',
  slug: '',
})

const rules: FormRules = {
  name: { required: true, message: '请输入标签名称', trigger: 'blur' },
  slug: { required: true, message: '请输入 Slug', trigger: 'blur' },
}

const tagColors = [
  'var(--tag-blue)',
  'var(--tag-green)',
  'var(--tag-purple)',
  'var(--tag-pink)',
  'var(--tag-orange)',
  'var(--tag-cyan)',
]

const getTagColor = (index: number) => {
  return tagColors[index % tagColors.length]
}

const loadTags = async () => {
  loading.value = true
  try {
    const response = await tagApi.getList()
    if (response.success && response.data) {
      tags.value = response.data
    }
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const response = await tagApi.create(form.value)
    if (response.success) {
      message.success('标签创建成功')
      showCreateModal.value = false
      form.value = { name: '', slug: '' }
      await loadTags()
    }
  } catch {
    // validation error
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadTags()
})
</script>

<style scoped>
.tag-list {
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

/* ========== 标签云卡片 ========== */
.tag-cloud {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.tag-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  border-left: 4px solid var(--tag-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
}

.tag-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--tag-color);
  opacity: 0;
  transition: opacity 0.3s;
}

.tag-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.tag-card:hover::before {
  opacity: 0.05;
}

.tag-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.tag-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.tag-count {
  padding: 0.25rem 0.625rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--tag-color);
  flex-shrink: 0;
}

.tag-footer {
  position: relative;
  z-index: 1;
}

.tag-slug {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: 'Monaco', 'Consolas', monospace;
  background: var(--bg-secondary);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  display: inline-block;
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

  .tag-cloud {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
