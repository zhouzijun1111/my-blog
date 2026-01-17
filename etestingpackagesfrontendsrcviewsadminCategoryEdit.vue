<template>
  <div class="category-edit">
    <div class="edit-header">
      <h2>{{ isEdit ? '编辑分类' : '新建分类' }}</h2>
      <p class="subtitle">创建分类以组织您的文章</p>
    </div>

    <n-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-placement="top"
      class="edit-form"
    >
      <div class="form-section">
        <div class="section-title">基本信息</div>
        <n-grid :cols="1" :x-gap="24" responsive="screen">
          <n-form-item label="分类名称" path="name">
            <n-input v-model:value="form.name" placeholder="输入分类名称" size="large" />
          </n-form-item>

          <n-form-item label="URL Slug" path="slug">
            <n-input v-model:value="form.slug" placeholder="category-slug" />
          </n-form-item>

          <n-form-item label="描述" path="description">
            <n-input
              v-model:value="form.description"
              type="textarea"
              placeholder="分类描述（可选）"
              :rows="3"
            />
          </n-form-item>
        </n-grid>
      </div>

      <div class="actions">
        <div class="left">
          <n-button @click="$router.back()" size="large">取消</n-button>
        </div>
        <div class="right">
          <n-button type="primary" @click="handleSubmit" :loading="loading" size="large">
            {{ isEdit ? '保存' : '创建' }}
          </n-button>
        </div>
      </div>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NGrid, NGridItem, useMessage } from 'naive-ui'
import { categoryApi } from '@/api'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const formRef = ref<InstanceType<typeof NForm> | null>(null)
const loading = ref(false)

const isEdit = computed(() => !!route.params.id)

const form = ref({
  name: '',
  slug: '',
  description: '',
})

const rules = {
  name: { required: true, message: '请输入分类名称' },
  slug: { required: true, message: '请输入 Slug' },
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    if (isEdit.value) {
      // 更新分类
      await categoryApi.update(route.params.id as string, form.value)
      message.success('分类已更新')
    } else {
      // 创建分类
      await categoryApi.create(form.value)
      message.success('分类已创建')
    }

    router.push('/admin/categories')
  } catch (error: any) {
    message.error(\`操作失败：\${error.message}\`)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.category-edit {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.edit-header {
  text-align: center;
  margin-bottom: 2rem;
}

.edit-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.edit-form {
  background: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur-strong);
  border: var(--glass-border);
  border-radius: var(--radius-xl);
  padding: 2rem;
  box-shadow: var(--shadow-xl);
}

.form-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
}

.right {
  display: flex;
  gap: 1rem;
}
</style>
