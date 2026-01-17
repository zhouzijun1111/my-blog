import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 哈希密码
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // 创建用户 (使用 bcrypt 哈希密码)
  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
    },
  })

  // 创建分类
  const techCategory = await prisma.category.upsert({
    where: { slug: 'tech' },
    update: {},
    create: { name: '技术', slug: 'tech' },
  })

  const lifeCategory = await prisma.category.upsert({
    where: { slug: 'life' },
    update: {},
    create: { name: '生活', slug: 'life' },
  })

  // 创建标签
  const jsTag = await prisma.tag.upsert({
    where: { slug: 'javascript' },
    update: {},
    create: { name: 'JavaScript', slug: 'javascript' },
  })

  const vueTag = await prisma.tag.upsert({
    where: { slug: 'vue' },
    update: {},
    create: { name: 'Vue', slug: 'vue' },
  })

  // 创建示例文章
  await prisma.article.create({
    data: {
      title: '欢迎来到我的博客',
      slug: 'welcome-to-my-blog',
      content: `# 欢迎来到我的博客

这是一个使用 **Vue 3** + **Fastify** + **Prisma** 构建的现代化个人博客。

## 主要特性

- 📝 Markdown 文章支持
- 🎨 完整暗色模式
- 🔍 搜索功能
- 🏷️ 标签和分类系统
- 🔐 管理后台

## 技术栈

- 前端：Vue 3 + Vite + TypeScript + Naive UI
- 后端：Fastify + Prisma + SQLite
- 部署：本地运行

感谢访问！`,
      excerpt: '欢迎使用这个现代化的个人博客系统',
      published: true,
      categoryId: techCategory.id,
      authorId: user.id,
      tags: { connect: [{ id: jsTag.id }, { id: vueTag.id }] },
    },
  })

  await prisma.article.create({
    data: {
      title: 'Vue 3 Composition API 入门',
      slug: 'vue3-composition-api',
      content: `# Vue 3 Composition API 入门

Composition API 是 Vue 3 最重要的新特性之一。

## setup 函数

\`\`\`javascript
import { ref, computed } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const doubled = computed(() => count.value * 2)

    return { count, doubled }
  }
}
\`\`\`

## 好处

- 更好的逻辑复用
- 更好的类型推断
- 更灵活的代码组织`,
      excerpt: '学习 Vue 3 Composition API 的基础知识',
      published: true,
      categoryId: techCategory.id,
      authorId: user.id,
      tags: { connect: [{ id: vueTag.id }] },
    },
  })

  await prisma.article.create({
    data: {
      title: '我的第一篇日记',
      slug: 'my-first-diary',
      content: `# 我的第一篇日记

今天开始写博客了，记录生活中的点点滴滴。

## 今天做了什么

- 搭建了一个博客网站
- 写了一篇技术文章
- 学习了新知识

生活就是这样，不断学习，不断进步！`,
      excerpt: '记录生活，分享点滴',
      published: true,
      categoryId: lifeCategory.id,
      authorId: user.id,
    },
  })

  // Vue 3 全家桶深度文章 1：响应式原理
  await prisma.article.create({
    data: {
      title: 'Vue 3 响应式原理深度解析：从 Proxy 到 Reactive',
      slug: 'vue3-reactive-deep-dive',
      content: `# Vue 3 响应式原理深度解析

Vue 3 的响应式系统是基于 ES6 的 Proxy 实现的，相比 Vue 2 的 Object.defineProperty 有了质的飞跃。

## Proxy vs Object.defineProperty

### Vue 2 的局限性

\`\`\`javascript
// Vue 2 无法检测以下情况
const vm = new Vue({
  data: {
    obj: { a: 1 }
  }
})
// 无法检测
vm.obj.b = 2
vm.obj = { b: 2 }
\`\`\`

### Vue 3 的改进

\`\`\`javascript
// Vue 3 使用 Proxy
const reactive = (obj) => {
  return new Proxy(obj, {
    get(target, key, receiver) {
      track(target, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver)
      trigger(target, key)
      return result
    }
  })
}
\`\`\`

## 响应式实现的核心

### 依赖收集（track）

\`\`\`javascript
let activeEffect = null
const targetMap = new WeakMap()

function track(target, key) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  dep.add(activeEffect)
}
\`\`\`

### 触发更新（trigger）

\`\`\`javascript
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const dep = depsMap.get(key)
  if (dep) {
    dep.forEach(effect => effect())
  }
}
\`\`\`

## ref 与 reactive 的区别

### ref 的实现

\`\`\`javascript
class RefImpl {
  constructor(value) {
    this._value = toReactive(value)
    this.__v_isRef = true
  }

  get value() {
    track(this, 'value')
    return this._value
  }

  set value(newValue) {
    this._value = toReactive(newValue)
    trigger(this, 'value')
  }
}

function ref(value) {
  return new RefImpl(value)
}
\`\`\`

### reactive 的实现

\`\`\`javascript
function reactive(target) {
  if (typeof target !== 'object' || target === null) {
    return target
  }

  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver)

      // 递归处理嵌套对象
      if (typeof result === 'object' && result !== null) {
        return reactive(result)
      }

      track(target, key)
      return result
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)

      if (oldValue !== value) {
        trigger(target, key)
      }

      return result
    }
  })
}
\`\`\`

## computed 的实现原理

\`\`\`javascript
class ComputedRefImpl {
  constructor(getter) {
    this._value = undefined
    this._dirty = true
    this._getter = getter
    this._dep = new Set()

    const effect = () => {
      this._value = this._getter()
      this._dirty = false
    }

    this._effect = effect
  }

  get value() {
    if (this._dirty) {
      this._effect()
    }
    track(this, 'value')
    return this._value
  }
}

function computed(getter) {
  return new ComputedRefImpl(getter)
}
\`\`\`

## 实战最佳实践

1. **基本数据类型使用 ref**
2. **对象使用 reactive**
3. **解构时使用 toRefs**
4. **避免嵌套过深**

\`\`\`javascript
import { ref, reactive, toRefs } from 'vue'

// 基本类型
const count = ref(0)

// 对象
const state = reactive({
  count: 0,
  name: 'vue3'
})

// 解构时保持响应性
const { count, name } = toRefs(state)
\`\`\`

## 总结

Vue 3 的响应式系统通过 Proxy 实现了真正的全面拦截，配合依赖收集和触发机制，实现了高效的数据响应。理解这些原理有助于我们更好地使用 Vue 3，并在遇到问题时能够快速定位。`,
      excerpt: '深入理解 Vue 3 响应式系统的核心原理，包括 Proxy 实现、依赖收集、触发更新机制',
      published: true,
      categoryId: techCategory.id,
      authorId: user.id,
      tags: { connect: [{ id: vueTag.id }] },
    },
  })

  // Vue 3 全家桶深度文章 2：Pinia 状态管理
  await prisma.article.create({
    data: {
      title: 'Pinia 状态管理最佳实践：从 Vuex 到 Pinia 的升级之路',
      slug: 'pinia-state-management-best-practices',
      content: `# Pinia 状态管理最佳实践

Pinia 是 Vue 3 官方推荐的状态管理库，它相比 Vuex 有着更简洁的 API 和更好的 TypeScript 支持。

## Pinia vs Vuex

### 核心区别

1. **去掉了 mutations**：只有 state、getters、actions
2. **完整的 TypeScript 支持**：无需手动定义复杂类型
3. **更简洁的 API**：不再需要 modules 嵌套
4. **自动代码分割**：每个 store 都是独立的文件

### 定义 Store

\`\`\`typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // state
  const user = ref(null)
  const token = ref('')

  // getters
  const isAuthenticated = computed(() => !!token.value)

  // actions
  const login = async (credentials) => {
    const response = await api.login(credentials)
    user.value = response.user
    token.value = response.token
  }

  const logout = () => {
    user.value = null
    token.value = ''
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout
  }
})
\`\`\`

## 持久化存储

### 方案一：使用 pinia-plugin-persistedstate

\`\`\`typescript
// main.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// stores/user.ts
export const useUserStore = defineStore('user', () => {
  // ...
}, {
  persist: {
    key: 'user',
    storage: localStorage,
    paths: ['token', 'user']
  }
})
\`\`\`

### 方案二：手动持久化

\`\`\`typescript
export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')

  watch(token, (newValue) => {
    localStorage.setItem('token', newValue)
  })

  return { token }
})
\`\`\`

## 模块化组织

### 按功能划分 Store

\`\`\`stores/
├── index.ts          # 统一导出
├── user.ts           # 用户相关
├── cart.ts           # 购物车
├── products.ts       # 商品
└── settings.ts       # 设置
\`\`\`

### Store 之间通信

\`\`\`typescript
// stores/cart.ts
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', () => {
  const userStore = useUserStore()

  const addToCart = (product) => {
    if (!userStore.isAuthenticated) {
      throw new Error('请先登录')
    }
    // 添加到购物车逻辑
  }

  return { addToCart }
})
\`\`\`

## TypeScript 集成

\`\`\`typescript
// types/user.ts
interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface UserState {
  user: User | null
  token: string
}

// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string>('')

  const updateUser = (data: User) => {
    user.value = data
  }

  return {
    user,
    token,
    updateUser
  }
})
\`\`\`

## 实战技巧

### 1. 组合式 API 风格

\`\`\`typescript
// ✅ 推荐：使用 setup 语法
export const useStore = defineStore('store', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  return { count, double, increment }
})

// ❌ 不推荐：对象式写法（Vue 2 风格）
export const useStore = defineStore('store', {
  state: () => ({ count: 0 }),
  getters: {
    double: state => state.count * 2
  },
  actions: {
    increment() {
      this.count++
    }
  }
})
\`\`\`

### 2. Store 重置

\`\`\`typescript
export const useUserStore = defineStore('user', () => {
  const $reset = () => {
    user.value = null
    token.value = ''
  }

  return {
    user,
    token,
    $reset
  }
})
\`\`\`

### 3. DevTools 集成

Pinia 原生支持 Vue DevTools，可以直接在浏览器中查看和调试状态。

## 总结

Pinia 的设计更加现代化，配合 Vue 3 的组合式 API 使用体验极佳。无论是小型项目还是大型应用，Pinia 都能很好地满足状态管理的需求。`,
      excerpt: 'Pinia 相比 Vuex 的优势、Store 定义方式、持久化方案、TypeScript 集成',
      published: true,
      categoryId: techCategory.id,
      authorId: user.id,
      tags: { connect: [{ id: vueTag.id }] },
    },
  })

  // Vue 3 全家桶深度文章 3：Vue Router 4
  await prisma.article.create({
    data: {
      title: 'Vue Router 4 进阶技巧：路由守卫、动态路由与性能优化',
      slug: 'vue-router-4-advanced-techniques',
      content: `# Vue Router 4 进阶技巧

Vue Router 4 带来了许多新特性和改进，本文将深入探讨路由守卫、动态路由和性能优化技巧。

## 路由守卫最佳实践

### 全局前置守卫

\`\`\`typescript
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const token = localStorage.getItem('token')

  if (requiresAuth && !token) {
    next('/login')
  } else if (token && to.path === '/login') {
    next('/dashboard')
  } else {
    next()
  }
})
\`\`\`

### 组件内守卫

\`\`\`typescript
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

export default {
  setup() {
    onBeforeRouteLeave((to, from, next) => {
      const answer = window.confirm('确定要离开吗？未保存的更改将丢失。')
      if (answer) {
        next()
      } else {
        next(false)
      }
    })

    return {}
  }
}
\`\`\`

## 动态路由添加

\`\`\`typescript
const addRoute = (route) => {
  router.addRoute({
    path: '/dynamic',
    component: () => import('./views/DynamicView.vue'),
    meta: { title: '动态路由' }
  })
}

// 移除路由
const removeRoute = () => {
  router.removeRoute('dynamic')
}
\`\`\`

## 路由懒加载优化

\`\`\`typescript
// ✅ 推荐：使用 webpack 魔法注释
const routes = [
  {
    path: '/home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/Home.vue')
  }
]

// ✅ 推荐：使用 Vite 的分组
const routes = [
  {
    path: '/about',
    component: () => import('@/views/About.vue')
  }
]

// Vite 会自动将同一目录下的组件打包到同一个 chunk
\`\`\`

## 导航守卫组合式 API

\`\`\`typescript
import { useRouter, useRoute } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()

    const goBack = () => {
      router.back()
    }

    const pushWithQuery = () => {
      router.push({
        path: '/search',
        query: { q: 'vue3' }
      })
    }

    return { goBack, pushWithQuery }
  }
}
\`\`\`

## 总结

Vue Router 4 的设计更加现代化，与 Vue 3 的组合式 API 配合完美。掌握这些进阶技巧可以帮助你构建更强大的单页应用。`,
      excerpt: 'Vue Router 4 路由守卫、动态路由、懒加载优化技巧',
      published: true,
      categoryId: techCategory.id,
      authorId: user.id,
      tags: { connect: [{ id: vueTag.id }] },
    },
  })

  // 实战项目：全栈博客系统
  await prisma.article.create({
    data: {
      title: '全栈博客系统实战：Vue 3 + Fastify + Prisma 架构设计与实现',
      slug: 'fullstack-blog-system-practice',
      content: `# 全栈博客系统实战

本文将详细介绍如何从零构建一个现代化的全栈博客系统，包括技术选型、数据库设计、API 设计、前后端联调和部署流程。

## 技术选型分析

### 前端技术栈

- **Vue 3**: 最新版本的 Vue 框架，组合式 API
- **Vite**: 下一代前端构建工具，极速的开发体验
- **Naive UI**: 优秀的 UI 组件库，完整的 TypeScript 支持
- **Pinia**: 官方推荐的状态管理方案
- **Vue Router 4**: 官方路由管理器

### 后端技术栈

- **Fastify**: 高性能 Node.js Web 框架
- **Prisma**: 现代化的 ORM，类型安全
- **SQLite**: 轻量级数据库，适合个人博客
- **JWT**: 无状态认证方案

### 为什么选择这个技术栈？

1. **全栈 TypeScript**: 类型安全贯穿前后端
2. **现代化**: 使用最新的工具和最佳实践
3. **轻量级**: 部署简单，资源占用少
4. **可扩展**: 架构清晰，易于维护和扩展

## 数据库设计

### Prisma Schema

\`\`\`prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  password  String
  articles  Article[]
}

model Article {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String
  excerpt     String?
  published   Boolean  @default(false)
  views       Int      @default(0)
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  tags        Tag[]
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
\`\`\`

### 设计原则

1. **规范化**: 遵循第三范式
2. **索引优化**: 为常用查询字段添加索引
3. **关联设计**: 合理使用一对多、多对多关系

## RESTful API 设计

### 文章相关接口

\`\`\`typescript
GET    /api/articles              # 获取文章列表
GET    /api/articles/:slug        # 获取文章详情
POST   /api/articles              # 创建文章
PUT    /api/articles/:id          # 更新文章
DELETE /api/articles/:id          # 删除文章
\`\`\`

### 响应格式统一

\`\`\`typescript
// 成功响应
{
  "success": true,
  "data": { /* 数据 */ }
}

// 列表响应
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 100
    }
  }
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述"
  }
}
\`\`\`

## 前后端联调

### API 客户端封装

\`\`\`typescript
// api/client.ts
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`
  }
  return config
})

export default api
\`\`\`

## 部署流程

### 开发环境

\`\`\`bash
# 后端
cd backend
npm run dev

# 前端
cd frontend
npm run dev
\`\`\`

### 生产部署

\`\`\`bash
# 构建前端
cd frontend
npm run build

# 启动后端
cd backend
npm run start
\`\`\`

## 总结

本博客系统采用现代化的技术栈，架构清晰，代码简洁。通过本文的介绍，相信你已经能够构建属于自己的全栈博客了。`,
      excerpt: '从零构建全栈博客系统的完整指南，包括技术选型、数据库设计、API 实现',
      published: true,
      categoryId: techCategory.id,
      authorId: user.id,
      tags: { connect: [{ id: vueTag.id }, { id: jsTag.id }] },
    },
  })

  // 前端工程化：Vite 插件开发
  await prisma.article.create({
    data: {
      title: 'Vite 插件开发指南：从入门到精通',
      slug: 'vite-plugin-development-guide',
      content: `# Vite 插件开发指南

Vite 的强大之处在于其丰富的插件生态。本文将教你如何开发自己的 Vite 插件。

## Vite 插件架构

### 基础结构

\`\`\`typescript
import type { Plugin } from 'vite'

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    enforce: 'pre', // 执行时机

    // 构建阶段钩子
    config(config) {
      // 修改配置
    },

    configResolved(resolvedConfig) {
      // 配置已解析
    },

    configureServer(server) {
      // 配置开发服务器
    },

    // 转换钩子
    transform(code, id) {
      // 转换代码
      return {
        code: transformedCode,
        map: null
      }
    }
  }
}
\`\`\`

## 常用钩子详解

### config 钩子

\`\`\`typescript
export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    config(config, { command }) {
      // command: 'serve' | 'build'
      return {
        // 返回的配置将被深度合并
        resolve: {
          alias: {
            '@': '/src'
          }
        }
      }
    }
  }
}
\`\`\`

### transform 钩子

\`\`\`typescript
export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    transform(code, id) {
      // 只处理 .vue 文件
      if (!id.endsWith('.vue')) {
        return null
      }

      // 转换代码
      const transformed = code.replace(/foo/g, 'bar')

      return {
        code: transformed,
        map: null // 不生成 source map
      }
    }
  }
}
\`\`\`

## 开发第一个插件

### 需求：自动导入组件

\`\`\`typescript
import type { Plugin } from 'vite'
import { normalizePath } from 'vite'

export function autoImportComponents(): Plugin {
  return {
    name: 'auto-import-components',
    transform(code, id) {
      if (!id.endsWith('.vue')) return null

      // 查找所有组件标签
      const componentRegex = /<([A-Z][a-zA-Z]+)/g
      let match
      const components = new Set()

      while ((match = componentRegex.exec(code)) !== null) {
        components.add(match[1])
      }

      // 生成导入语句
      const imports = Array.from(components)
        .map(name => \`import \${name} from '@/components/\${name}.vue'\`)
        .join('\\n')

      return {
        code: imports + '\\n' + code,
        map: null
      }
    }
  }
}
\`\`\`

## 插件测试

\`\`\`typescript
import { describe, it, expect } from 'vitest'
import { myPlugin } from './my-plugin'

describe('My Plugin', () => {
  it('should transform code', () => {
    const plugin = myPlugin()
    const result = plugin.transform('foo', 'test.js')

    expect(result.code).toBe('bar')
  })
})
\`\`\`

## 总结

Vite 插件开发并不复杂，掌握 Rollup 钩子和 Vite 特有的钩子是关键。通过插件机制，我们可以扩展 Vite 的能力，满足各种定制化需求。`,
      excerpt: 'Vite 插件架构、常用钩子详解、插件开发实战、测试技巧',
      published: true,
      categoryId: techCategory.id,
      authorId: user.id,
      tags: { connect: [{ id: jsTag.id }] },
    },
  })

  // TypeScript 高级类型与泛型实战
  await prisma.article.create({
    data: {
      title: 'TypeScript 高级类型与泛型实战：构建类型安全的代码',
      slug: 'typescript-advanced-types-generics',
      content: `# TypeScript 高级类型与泛型实战

TypeScript 的类型系统是其最强大的特性之一。本文将深入探讨高级类型和泛型，帮助你写出更类型安全的代码。

## 泛型基础

### 泛型函数

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg
}

// 使用示例
const num = identity<number>(42)
const str = identity('hello')

// 类型推断
const bool = identity(true)
\`\`\`

### 泛型接口

\`\`\`typescript
interface Box<T> {
  value: T
}

const numberBox: Box<number> = { value: 42 }
const stringBox: Box<string> = { value: 'hello' }
\`\`\`

### 泛型类

\`\`\`typescript
class Stack<T> {
  private items: T[] = []

  push(item: T): void {
    this.items.push(item)
  }

  pop(): T | undefined {
    return this.items.pop()
  }
}

const numberStack = new Stack<number>()
\`\`\`

## 高级类型

### 条件类型

\`\`\`typescript
type IsArray<T> = T extends any[] ? true : false

type Test1 = IsArray<string>  // false
type Test2 = IsArray<number[]> // true
\`\`\`

### 映射类型

\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type Partial<T> = {
  [P in keyof T]?: T[P]
}

// 使用示例
interface User {
  id: number
  name: string
  email: string
}

type ReadonlyUser = Readonly<User>
type PartialUser = Partial<User>
\`\`\`

### 模板字面量类型

\`\`\`typescript
type EventName<T extends string> = \`on\${Capitalize<T>}\`

type ClickEvent = EventName<'click'>  // 'onClick'
type HoverEvent = EventName<'hover'> // 'onHover'
\`\`\`

## 实战技巧

### 1. 泛型约束

\`\`\`typescript
interface Lengthwise {
  length: number
}

function logLength<T extends Lengthwise>(arg: T): void {
  console.log(arg.length)
}

logLength('hello')  // ✅
logLength([1, 2, 3]) // ✅
logLength(42)       // ❌ Error
\`\`\`

### 2. 使用 keyof 操作符

\`\`\`typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { name: 'Alice', age: 30 }

const name = getProperty(user, 'name') // string
const age = getProperty(user, 'age')   // number
\`\`\`

### 3. 条件类型推断

\`\`\`typescript
type Unpacked<T> = T extends (infer U)[] ? U :
                   T extends (...args: any[]) => infer U ? U :
                   T extends Promise<infer U> ? U :
                   T

type T0 = Unpacked<string>        // string
type T1 = Unpacked<string[]>      // string
type T2 = Unpacked<() => string>  // string
type T3 = Unpacked<Promise<string>> // string
\`\`\`

## 实用工具类型

\`\`\`typescript
// Required - 将所有属性变为必需
type RequiredUser = Required<User>

// Pick - 选择部分属性
type UserPreview = Pick<User, 'name' | 'email'>

// Omit - 排除部分属性
type CreateUser = Omit<User, 'id'>

// Record - 构建对象类型
type PageInfo = Record<'title' | 'url', string>
\`\`\`

## 总结

TypeScript 的高级类型和泛型提供了强大的类型安全性。掌握这些技巧可以让你的代码更加健壮，减少运行时错误。`,
      excerpt: '深入理解 TypeScript 泛型、条件类型、映射类型等高级特性',
      published: true,
      categoryId: techCategory.id,
      authorId: user.id,
      tags: { connect: [{ id: jsTag.id }, { id: vueTag.id }] },
    },
  })

  // 前端性能优化完全指南
  await prisma.article.create({
    data: {
      title: '前端性能优化完全指南：从加载到渲染的全方位优化',
      slug: 'frontend-performance-optimization-guide',
      content: `# 前端性能优化完全指南

前端性能直接影响用户体验和业务转化。本文将系统地介绍从加载到渲染的全方位优化策略。

## 加载性能优化

### 1. 代码分割

\`\`\`javascript
// 路由级别代码分割
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

// 组件级别懒加载
const HeavyComponent = lazy(() => import('./HeavyComponent'))
\`\`\`

### 2. Tree Shaking

\`\`\`javascript
// 使用 ES Module
import { debounce } from 'lodash-es'

// 避免这样
import _ from 'lodash'
\`\`\`

### 3. 资源预加载

\`\`\`html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="https://api.example.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://cdn.example.com">

<!-- 预加载 -->
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
\`\`\`

## 渲染性能优化

### 1. 虚拟滚动

\`\`\`vue
<template>
  <RecycleScroller
    :items="items"
    :item-size="50"
    key-field="id"
  >
    <template #default="{ item }">
      <div class="item">{{ item.name }}</div>
    </template>
  </RecycleScroller>
</template>
\`\`\`

### 2. 防抖与节流

\`\`\`typescript
// 防抖
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// 节流
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
\`\`\`

### 3. 列表优化

\`\`\`vue
<template>
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
</template>
\`\`\`

## 内存优化

### 1. 避免内存泄漏

\`\`\`typescript
// 清理事件监听器
onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 清理定时器
const intervalId = setInterval(callback, 1000)

onUnmounted(() => {
  clearInterval(intervalId)
})
\`\`\`

### 2. 虚拟列表

使用虚拟列表技术渲染大量数据，只渲染可视区域内的元素。

## 网络优化

### 1. 资源压缩

- 启用 Gzip/Brotli 压缩
- 使用 WebP 格式图片
- 压缩 JavaScript 和 CSS

### 2. CDN 加速

将静态资源部署到 CDN，减少网络延迟。

### 3. HTTP 缓存

\`\`\`javascript
// Service Worker 缓存策略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})
\`\`\`

## 性能监控

### 1. Web Vitals

\`\`\`javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
\`\`\`

### 2. Performance API

\`\`\`javascript
// 测量执行时间
const start = performance.now()

// 执行代码

const end = performance.now()
console.log(\`Execution time: \${end - start}ms\`)
\`\`\`

## 总结

前端性能优化是一个系统工程，需要从加载、渲染、内存、网络等多个维度进行优化。持续监控和优化是保持高性能的关键。`,
      excerpt: '全面的前端性能优化指南，涵盖加载优化、渲染优化、内存优化等',
      published: true,
      categoryId: techCategory.id,
      authorId: user.id,
      tags: { connect: [{ id: jsTag.id }] },
    },
  })

  // Webpack vs Vite 深度对比
  await prisma.article.create({
    data: {
      title: 'Webpack vs Vite 深度对比：构建工具的演进之路',
      slug: 'webpack-vs-vite-comparison',
      content: `# Webpack vs Vite 深度对比

随着 Vite 的兴起，前端构建工具的格局发生了巨大变化。本文将深入对比 Webpack 和 Vite，帮助你做出正确的选择。

## 核心架构差异

### Webpack: 打包式构建

Webpack 采用打包式构建，将所有模块打包成 bundle。

\`\`\`javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\\.js$/,
        use: 'babel-loader',
      },
    ],
  },
}
\`\`\`

**优点：**
- 成熟稳定，生态丰富
- 强大的代码分割能力
- 广泛的浏览器兼容性

**缺点：**
- 冷启动慢
- HMR 更新速度随项目规模增加而下降

### Vite: 开发时按需编译

Vite 利用浏览器原生 ESM 能力，实现开发时按需编译。

\`\`\`javascript
// vite.config.js
export default {
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router'],
        },
      },
    },
  },
}
\`\`\`

**优点：**
- 极快的冷启动速度
- 即时的 HMR
- 开箱即用的 TypeScript 支持

**缺点：**
- 生态相对较新
- 某些高级优化不如 Webpack 成熟

## 性能对比

### 开发环境启动速度

| 项目规模 | Webpack | Vite |
|---------|---------|------|
| 小型项目 | ~3s | <1s |
| 中型项目 | ~10s | ~1s |
| 大型项目 | ~30s+ | ~2s |

### HMR 响应速度

Vite 的 HMR 响应速度通常是 Webpack 的 10 倍以上，因为：

1. 无需重新打包整个应用
2. 基于浏览器 ESM 的按需加载
3. 增量更新机制

## 功能对比

### 代码分割

**Webpack:**

\`\`\`javascript
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\\\/]node_modules[\\\\/]/,
        name: 'vendors',
        chunks: 'all',
      },
    },
  },
}
\`\`\`

**Vite:**

\`\`\`javascript
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules')) {
          return 'vendor'
        }
      },
    },
  },
}
\`\`\`

### 插件系统

**Webpack 插件：**

\`\`\`javascript
class MyPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      // 自定义逻辑
      callback()
    })
  }
}
\`\`\`

**Vite 插件：**

\`\`\`typescript
import type { Plugin } from 'vite'

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    transform(code, id) {
      if (id.endsWith('.vue')) {
        return { code: transformedCode }
      }
    },
  }
}
\`\`\`

## 生产构建

### Webpack 生产构建

\`\`\`bash
webpack --mode production
\`\`\`

特点：
- 高度优化的 bundle
- Tree Shaking
- 代码压缩
- 资源优化

### Vite 生产构建

Vite 使用 Rollup 进行生产构建：

\`\`\`bash
vite build
\`\`\`

特点：
- 更快的构建速度
- 自动 CSS 代码分割
- 原生 ESM 输出
- 更小的 bundle 体积

## 选择建议

### 选择 Webpack 的情况：

1. 需要高度自定义的构建流程
2. 项目有复杂的模块依赖
3. 需要支持旧版浏览器
4. 团队已经熟悉 Webpack

### 选择 Vite 的情况：

1. 追求极致的开发体验
2. 新项目或可以重构的项目
3. 使用现代浏览器
4. 重视构建速度

## 迁移指南

从 Webpack 迁移到 Vite 的关键步骤：

1. 安装 Vite
2. 配置 vite.config.js
3. 调整 index.html
4. 更新构建脚本
5. 处理兼容性问题

## 总结

Vite 代表了构建工具的未来方向，但 Webpack 仍然是可靠的选择。根据项目需求和团队情况做出合理的选择。`,
      excerpt: 'Webpack 与 Vite 的深度对比，包括架构、性能、功能和最佳实践',
      published: true,
      categoryId: techCategory.id,
      authorId: user.id,
      tags: { connect: [{ id: jsTag.id }] },
    },
  })

  // 微前端架构设计与实践
  await prisma.article.create({
    data: {
      title: '微前端架构设计与实践：qiankun 从入门到精通',
      slug: 'micro-frontend-architecture-with-qiankun',
      content: `# 微前端架构设计与实践

微前端是一种将前端应用分解为更小、更简单的块的架构风格。本文将介绍如何使用 qiankun 构建微前端应用。

## 什么是微前端

微前端的核心思想：

1. **应用分解**：将单体应用拆分为多个子应用
2. **独立部署**：每个子应用可以独立开发、测试、部署
3. **技术栈无关**：子应用可以使用不同的技术栈
4. **隔离运行**：子应用之间运行环境隔离

## qiankun 核心原理

### 1. 应用注册

\`\`\`typescript
// 主应用 src/micro-app.ts
import { registerMicroApps, start } from 'qiankun'

registerMicroApps([
  {
    name: 'react-app',
    entry: '//localhost:7100',
    container: '#subapp-container',
    activeRule: '/react',
  },
  {
    name: 'vue-app',
    entry: '//localhost:7200',
    container: '#subapp-container',
    activeRule: '/vue',
  },
])

start()
\`\`\`

### 2. HTML Entry

qiankun 通过获取子应用的 HTML 入口文件来加载应用：

\`\`\`typescript
async function loadApp(app) {
  const { template, execScripts } = await importHTML(app.entry)

  // 挂载 HTML
  container.innerHTML = template

  // 执行 JS
  execScripts()
}
\`\`\`

### 3. JS 沙箱

qiankun 使用 Proxy 实现沙箱隔离：

\`\`\`typescript
class ProxySandbox {
  constructor() {
    const fakeWindow = Object.create(null)
    this.proxyWindow = new Proxy(window, {
      set: (target, key, value) => {
        fakeWindow[key] = value
        return true
      },
      get: (target, key) => {
        return fakeWindow[key] || target[key]
      },
    })
  }
}
\`\`\`

## 主应用配置

### 1. 安装依赖

\`\`\`bash
npm install qiankun
\`\`\`

### 2. 配置微应用

\`\`\`typescript
// src/micro-app.ts
import { registerMicroApps, start, initGlobalState } from 'qiankun'

// 注册微应用
registerMicroApps([
  {
    name: 'sub-react',
    entry: '//localhost:3001',
    container: '#container',
    activeRule: '/sub-react',
    props: {
      routerBase: '/sub-react',
    },
  },
  {
    name: 'sub-vue',
    entry: '//localhost:3002',
    container: '#container',
    activeRule: '/sub-vue',
  },
])

// 初始化全局状态
const { onGlobalStateChange, setGlobalState } = initGlobalState({
  user: 'unlogin',
  language: 'zh-CN',
})

onGlobalStateChange((state, prev) => {
  console.log('主应用监听状态变化', state, prev)
})

// 启动 qiankun
start({
  sandbox: {
    strictStyleIsolation: true,
  },
})
\`\`\`

### 3. 路由配置

\`\`\`typescript
// router/index.ts
const router = createRouter({
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/sub-react',
      name: 'SubReact',
      component: MicroAppContainer,
    },
    {
      path: '/sub-vue',
      name: 'SubVue',
      component: MicroAppContainer,
    },
  ],
})
\`\`\`

## 子应用配置

### React 子应用

\`\`\`typescript
// src/public-path.ts
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
}

// src/index.tsx
let root: RootElement

function render(props: any) {
  const { container } = props
  root = createRoot(container ? container.querySelector('#root') : document.querySelector('#root'))
  root.render(<App />)
}

if (!window.__POWERED_BY_QIANKUN__) {
  render({})
}

export async function bootstrap() {
  console.log('React app bootstraped')
}

export async function mount(props: any) {
  render(props)
}

export async function unmount() {
  root?.unmount()
}
\`\`\`

### Vue 子应用

\`\`\`typescript
// main.ts
let instance: any

if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
}

function render(props: any = {}) {
  const { container } = props
  instance = createApp({
    render: () => h(App),
  })
  instance.use(router)
  instance.mount(container ? container.querySelector('#app') : '#app')
}

if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

export async function bootstrap() {
  console.log('Vue app bootstraped')
}

export async function mount(props: any) {
  render(props)
}

export async function unmount() {
  instance?.unmount()
}
\`\`\`

## 通信机制

### 主应用向子应用传递数据

\`\`\`typescript
// 主应用
registerMicroApps([
  {
    name: 'sub-app',
    entry: '//localhost:3001',
    container: '#container',
    activeRule: '/sub',
    props: {
      data: 'from main',
      getToken: () => localStorage.getItem('token'),
    },
  },
])
\`\`\`

### 全局状态管理

\`\`\`typescript
// 初始化状态
const { onGlobalStateChange, setGlobalState } = initGlobalState({
  user: 'guest',
})

// 监听状态
onGlobalStateChange((state, prev) => {
  console.log('状态变化', state, prev)
})

// 更新状态
setGlobalState({ user: 'admin' })
\`\`\`

## 最佳实践

### 1. 样式隔离

使用 CSS Modules 或 CSS-in-JS 避免样式冲突：

\`\`\`typescript
start({
  sandbox: {
    strictStyleIsolation: true,
  },
})
\`\`\`

### 2. 预加载

\`\`\`typescript
import { prefetchApps } from 'qiankun'

prefetchApps([
  {
    name: 'sub-app',
    entry: '//localhost:3001',
  },
])
\`\`\`

### 3. 错误处理

\`\`\`typescript
import { addGlobalUncaughtErrorHandler } from 'qiankun'

addGlobalUncaughtErrorHandler((event) => {
  console.error('微应用错误', event)
  // 上报错误
})
\`\`\`

## 总结

qiankun 提供了一套完整的微前端解决方案，能够帮助我们构建可扩展的大型前端应用。`,
      excerpt: '微前端架构设计、qiankun 原理、主应用与子应用配置、通信机制',
      published: true,
      categoryId: techCategory.id,
      authorId: user.id,
      tags: { connect: [{ id: jsTag.id }, { id: vueTag.id }] },
    },
  })

  // Node.js 异步编程深度解析
  await prisma.article.create({
    data: {
      title: 'Node.js 异步编程深度解析：从回调到 Async/Await',
      slug: 'nodejs-asynchronous-programming',
      content: `# Node.js 异步编程深度解析

Node.js 的异步编程模型是其核心特性。本文将深入探讨从回调到 Async/Await 的演进历程。

## 事件循环机制

### 事件循环的组成

\`\`\`text
┌───────────────────────────┐
│         Timers            │
├───────────────────────────┤
│   Pending Callbacks       │
├───────────────────────────┤
│      Idle, Prepare        │
├───────────────────────────┤
│        Poll               │
├───────────────────────────┤
│         Check             │
├───────────────────────────┤
│    Close Callbacks        │
└───────────────────────────┘
\`\`\`

### 宏任务与微任务

\`\`\`javascript
console.log('1')

setTimeout(() => {
  console.log('2')
}, 0)

Promise.resolve().then(() => {
  console.log('3')
})

console.log('4')

// 输出顺序: 1 -> 4 -> 3 -> 2
\`\`\`

## 回调函数

### 基本用法

\`\`\`javascript
function fetchData(callback) {
  setTimeout(() => {
    const data = { name: 'Alice' }
    callback(data)
  }, 1000)
}

fetchData((data) => {
  console.log(data)
})
\`\`\`

### 回调地狱

\`\`\`javascript
fs.readFile('file1.txt', (err, data1) => {
  if (err) throw err

  fs.readFile('file2.txt', (err, data2) => {
    if (err) throw err

    fs.readFile('file3.txt', (err, data3) => {
      if (err) throw err

      console.log(data1, data2, data3)
    })
  })
})
\`\`\`

## Promise

### 基本用法

\`\`\`javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Success!')
  }, 1000)
})

promise.then((value) => {
  console.log(value)
}).catch((error) => {
  console.error(error)
})
\`\`\`

### Promise 链

\`\`\`javascript
Promise.resolve(1)
  .then((value) => {
    console.log(value) // 1
    return value + 1
  })
  .then((value) => {
    console.log(value) // 2
    return value + 1
  })
  .then((value) => {
    console.log(value) // 3
  })
\`\`\`

### Promise 并行

\`\`\`javascript
// Promise.all - 全部成功才成功
Promise.all([promise1, promise2, promise3])
  .then((values) => {
    console.log(values)
  })

// Promise.race - 第一个完成的结果
Promise.race([promise1, promise2])
  .then((value) => {
    console.log(value)
  })

// Promise.allSettled - 返回所有结果
Promise.allSettled([promise1, promise2, promise3])
  .then((results) => {
    console.log(results)
  })

// Promise.any - 第一个成功的结果
Promise.any([promise1, promise2, promise3])
  .then((value) => {
    console.log(value)
  })
\`\`\`

## Async/Await

### 基本语法

\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data')
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
  }
}
\`\`\`

### 并行处理

\`\`\`javascript
async function fetchMultiple() {
  const [data1, data2, data3] = await Promise.all([
    fetch('/api/1').then(r => r.json()),
    fetch('/api/2').then(r => r.json()),
    fetch('/api/3').then(r => r.json()),
  ])

  return { data1, data2, data3 }
}
\`\`\`

### 错误处理

\`\`\`javascript
async function handleErrors() {
  try {
    await riskyOperation()
  } catch (error) {
    if (error instanceof NetworkError) {
      // 处理网络错误
    } else {
      // 处理其他错误
    }
  }
}
\`\`\`

## 实战模式

### 1. 串行执行

\`\`\`javascript
async function series() {
  const result1 = await operation1()
  const result2 = await operation2(result1)
  const result3 = await operation3(result2)
  return result3
}
\`\`\`

### 2. 并行执行

\`\`\`javascript
async function parallel() {
  const [result1, result2, result3] = await Promise.all([
    operation1(),
    operation2(),
    operation3(),
  ])

  return { result1, result2, result3 }
}
\`\`\`

### 3. 限制并发数

\`\`\`javascript
async function asyncPool<T, R>(
  poolLimit: number,
  array: T[],
  iteratorFn: (item: T, array: T[]) => Promise<R>
): Promise<R[]> {
  const ret: R[] = []
  const executing: Promise<void>[] = []

  for (const item of array) {
    const p = Promise.resolve().then(() => iteratorFn(item, array))
    ret.push(p)

    if (poolLimit <= array.length) {
      const e: any = p.then(() => {
        executing.splice(executing.indexOf(e), 1)
      })
      executing.push(e)

      if (executing.length >= poolLimit) {
        await Promise.race(executing)
      }
    }
  }

  return Promise.all(ret)
}
\`\`\`

## 性能优化

### 1. 避免阻塞事件循环

\`\`\`javascript
// 使用 setImmediate
function heavyOperation() {
  setImmediate(() => {
    // 执行耗时操作
  })
}

// 使用 process.nextTick
process.nextTick(() => {
  // 在当前操作完成后立即执行
})
\`\`\`

### 2. 使用 Worker Threads

\`\`\`javascript
const { Worker } = require('worker_threads')

function runWorker(fileName) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(fileName, {
      workerData: { data: 'data' },
    })

    worker.on('message', resolve)
    worker.on('error', reject)
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(\`Worker stopped with exit code \${code}\`))
      }
    })
  })
}
\`\`\`

## 总结

Node.js 异步编程经历了从回调函数到 Promise，再到 Async/Await 的演进。掌握这些知识对于编写高效的 Node.js 应用至关重要。`,
      excerpt: 'Node.js 事件循环、Promise、Async/Await、异步编程模式详解',
      published: true,
      categoryId: techCategory.id,
      authorId: user.id,
      tags: { connect: [{ id: jsTag.id }] },
    },
  })

  console.log('✅ Seed data created successfully!')
  console.log('📧 Login email: admin@example.com')
  console.log('🔑 Login password: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
