import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // 前台路由
  {
    path: '/',
    component: () => import('@/components/layout/PublicLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/public/Home.vue'),
      },
      {
        path: 'articles',
        name: 'ArticleList',
        component: () => import('@/views/public/ArticleList.vue'),
      },
      {
        path: 'article/:slug',
        name: 'ArticleDetail',
        component: () => import('@/views/public/ArticleDetail.vue'),
      },
      {
        path: 'category/:slug',
        name: 'CategoryDetail',
        component: () => import('@/views/public/CategoryDetail.vue'),
      },
      {
        path: 'tag/:slug',
        name: 'TagDetail',
        component: () => import('@/views/public/TagDetail.vue'),
      },
      {
        path: 'search',
        name: 'Search',
        component: () => import('@/views/public/Search.vue'),
      },
    ],
  },
  // 后台路由
  {
    path: '/admin',
    component: () => import('@/components/layout/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/articles',
      },
      {
        path: 'articles',
        name: 'AdminArticles',
        component: () => import('@/views/admin/ArticleList.vue'),
      },
      {
        path: 'articles/new',
        name: 'AdminArticleCreate',
        component: () => import('@/views/admin/ArticleEdit.vue'),
      },
      {
        path: 'articles/:id/edit',
        name: 'AdminArticleEdit',
        component: () => import('@/views/admin/ArticleEdit.vue'),
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('@/views/admin/CategoryList.vue'),
      },
      {
        path: 'tags',
        name: 'AdminTags',
        component: () => import('@/views/admin/TagList.vue'),
      },
    ],
  },
  // 登录页
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/public/Login.vue'),
  },
  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/public/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const token = localStorage.getItem('token')

  // 如果需要认证但没有 token，重定向到登录页
  if (requiresAuth && !token) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
    return
  }

  // 如果有 token 且需要认证，尝试验证并获取用户信息
  if (token && requiresAuth) {
    try {
      const { useAuthStore } = await import('@/stores/auth')
      const authStore = useAuthStore()
      if (!authStore.user) {
        await authStore.fetchUser()
      }
      next()
    } catch (error) {
      // token 无效，清除并重定向
      localStorage.removeItem('token')
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
    }
  } else {
    next()
  }
})

export default router
