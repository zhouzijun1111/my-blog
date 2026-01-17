<template>
  <div class="article-edit">
    <div class="edit-header">
      <div class="header-content">
        <h2>{{ isEdit ? '编辑文章' : '新建文章' }}</h2>
        <p class="subtitle">创建精彩内容，与世界分享你的想法</p>
      </div>
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
        <n-grid :cols="2" :x-gap="24" responsive="screen">
          <n-grid-item :span="2">
            <n-form-item label="文章标题" path="title">
              <n-input v-model:value="form.title" placeholder="请输入标题" size="large" />
            </n-form-item>
          </n-grid-item>

          <n-grid-item>
            <n-form-item label="URL Slug" path="slug">
              <n-input v-model:value="form.slug" placeholder="article-slug" />
            </n-form-item>
          </n-grid-item>

          <n-grid-item>
            <n-form-item label="分类" path="categoryId">
              <n-select
                v-model:value="form.categoryId"
                :options="categoryOptions"
                placeholder="选择分类"
              />
            </n-form-item>
          </n-grid-item>

          <n-grid-item>
            <n-form-item label="标签" path="tagIds">
              <n-select
                v-model:value="form.tagIds"
                :options="tagOptions"
                multiple
                placeholder="选择标签"
              />
            </n-form-item>
          </n-grid-item>

          <n-grid-item>
            <n-form-item label="封面图片 URL" path="coverImage">
              <n-input v-model:value="form.coverImage" placeholder="https://..." />
            </n-form-item>
          </n-grid-item>

          <n-grid-item :span="2">
            <n-form-item label="摘要" path="excerpt">
              <n-input
                v-model:value="form.excerpt"
                type="textarea"
                placeholder="文章摘要（可选）"
                :rows="3"
              />
            </n-form-item>
          </n-grid-item>
        </n-grid>
      </div>

      <div class="form-section">
        <div class="section-title">文章内容</div>
        <n-grid-item :span="2">
          <n-form-item label="内容 (Markdown)" path="content">
            <n-input
              v-model:value="form.content"
              type="textarea"
              placeholder="# 开始写作..."
              :rows="20"
              @input="handleContentInput"
            />
          </n-form-item>
        </n-grid-item>
      </div>

      <div class="form-section">
        <div class="section-title">发布设置</div>
        <n-grid-item :span="2">
          <n-form-item label="发布状态" path="published">
            <div class="publish-switch">
              <n-switch v-model:value="form.published" size="large" />
              <span class="switch-label" :class="{ active: form.published }">
                {{ form.published ? '已发布' : '草稿' }}
              </span>
            </div>
          </n-form-item>
        </n-grid-item>
      </div>

      <div class="actions">
        <n-button @click="previewMarkdown" size="large" class="preview-btn">
          <template #icon>
            <span>👁️</span>
          </template>
          预览
        </n-button>
        <div class="right">
          <n-button @click="$router.back()" size="large">取消</n-button>
          <n-button type="primary" @click="handleSubmit" :loading="loading" size="large" class="submit-btn">
            {{ isEdit ? '保存' : '创建' }}
          </n-button>
        </div>
      </div>
    </n-form>

    <n-modal v-model:show="showPreview" preset="card" title="Markdown 预览" style="width: 900px" class="preview-modal">
      <div class="markdown-preview" v-html="previewHtml"></div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSwitch,
  NButton,
  NGrid,
  NGridItem,
  NModal,
  useMessage,
  type FormInst,
  type FormRules,
} from 'naive-ui'
import { useArticleStore } from '@/stores/article'
import { articleApi, categoryApi, tagApi } from '@/api'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'isomorphic-dompurify'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const message = useMessage()

const formRef = ref<FormInst | null>(null)
const loading = ref(false)
const showPreview = ref(false)
const previewHtml = ref('')

const md = new MarkdownIt()

const isEdit = computed(() => !!route.params.id)

const form = ref({
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  coverImage: '',
  published: false,
  categoryId: '',
  tagIds: [] as string[],
})

const categoryOptions = ref<any[]>([])
const tagOptions = ref<any[]>([])

const rules: FormRules = {
  title: { required: true, message: '请输入标题', trigger: 'blur' },
  slug: { required: true, message: '请输入 Slug', trigger: 'blur' },
  content: { required: true, message: '请输入内容', trigger: 'blur' },
  categoryId: { required: true, message: '请选择分类', trigger: 'change' },
}

const loadOptions = async () => {
  const [categoriesRes, tagsRes] = await Promise.all([
    categoryApi.getList(),
    tagApi.getList(),
  ])

  if (categoriesRes.success && categoriesRes.data) {
    categoryOptions.value = categoriesRes.data.map((c: any) => ({
      label: c.name,
      value: c.id,
    }))
  }

  if (tagsRes.success && tagsRes.data) {
    tagOptions.value = tagsRes.data.map((t: any) => ({
      label: t.name,
      value: t.id,
    }))
  }
}

const loadArticle = async () => {
  if (!isEdit.value) return

  const id = route.params.id as string
  loading.value = true

  try {
    const response = await articleApi.getById(id)

    if (response.success && response.data) {
      const article = response.data
      form.value = {
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt || '',
        coverImage: article.coverImage || '',
        published: article.published,
        categoryId: article.categoryId || '',
        tagIds: article.tags?.map((t: any) => t.id) || [],
      }
    } else {
      message.error('文章不存在或已被删除')
      console.error('API返回成功但无数据')
      router.push('/admin/articles')
    }
  } catch (error: any) {
    message.error(`加载失败：${error.message}`)
    console.error(error)
    // 如果文章不存在，返回列表页
    if (error.message.includes('404') || error.message.includes('not found')) {
      router.push('/admin/articles')
    }
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    if (isEdit.value) {
      await articleStore.updateArticle(route.params.id as string, form.value)
      message.success('文章已更新')
    } else {
      await articleStore.createArticle(form.value)
      message.success('文章已创建')
    }

    router.push('/admin/articles')
  } catch {
    // validation error
  } finally {
    loading.value = false
  }
}

const handleContentInput = () => {
  const rawHtml = md.render(form.value.content)
  // 使用 DOMPurify 清理 HTML，防止 XSS 攻击
  previewHtml.value = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'code', 'pre',
                   'blockquote', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4',
                   'h5', 'h6', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'id', 'title']
  })
}

const previewMarkdown = () => {
  handleContentInput()
  showPreview.value = true
}

onMounted(async () => {
  await loadOptions()
  if (isEdit.value) {
    await loadArticle()
  }
})
</script>

<style scoped>
.article-edit {
  max-width: 1000px;
  margin: 0 auto;
}

/* ========== 头部 ========== */
.edit-header {
  margin-bottom: 2rem;
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

/* ========== 表单区域 ========== */
.edit-form {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 2rem;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
}

.form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--gradient-primary);
  display: inline-block;
}

/* ========== 发布开关 ========== */
.publish-switch {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.switch-label {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.3s;
}

.switch-label.active {
  background: var(--gradient-forest);
  color: white;
}

/* ========== 操作按钮 ========== */
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.actions .right {
  display: flex;
  gap: 0.75rem;
}

.preview-btn {
  transition: all 0.3s;
}

.preview-btn:hover {
  transform: translateY(-2px);
}

.submit-btn {
  background: var(--gradient-primary);
  border: none;
  box-shadow: var(--shadow-md);
  transition: all 0.3s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* ========== 预览模态框 ========== */
.markdown-preview {
  line-height: 1.8;
  color: var(--text-primary);
}

.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3 {
  margin-top: 1.5em;
  margin-bottom: 0.75em;
  font-weight: 600;
  color: var(--text-primary);
}

.markdown-preview h1 {
  font-size: 2em;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.5em;
}

.markdown-preview h2 {
  font-size: 1.5em;
}

.markdown-preview h3 {
  font-size: 1.25em;
}

.markdown-preview p {
  margin-bottom: 1em;
}

.markdown-preview code {
  background: var(--bg-secondary);
  padding: 0.2em 0.5em;
  border-radius: var(--radius-sm);
  font-size: 0.9em;
  color: var(--accent-primary);
}

.markdown-preview pre {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: 1.5em 0;
  border: 1px solid var(--border-color);
}

.markdown-preview pre code {
  background: transparent;
  padding: 0;
  color: var(--text-primary);
}

.markdown-preview ul,
.markdown-preview ol {
  margin-bottom: 1em;
  padding-left: 2em;
}

.markdown-preview li {
  margin-bottom: 0.5em;
}

.markdown-preview blockquote {
  border-left: 4px solid var(--accent-color);
  padding-left: 1rem;
  margin: 1.5em 0;
  color: var(--text-secondary);
  font-style: italic;
}

.markdown-preview a {
  color: var(--accent-color);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.markdown-preview a:hover {
  border-bottom-color: var(--accent-color);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .edit-form {
    padding: 1.5rem;
  }

  .actions {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .actions .right {
    flex-direction: column;
  }

  .preview-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>
