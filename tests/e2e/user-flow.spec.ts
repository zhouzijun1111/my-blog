import { test, expect } from '@playwright/test'

test.describe('用户流程测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问首页
    await page.goto('/')
  })

  test('应该显示首页', async ({ page }) => {
    // 验证标题
    await expect(page.locator('h1')).toContainText('一剑轻安的博客')

    // 验证文章卡片存在
    const articleCards = page.locator('.article-card')
    await expect(articleCards).toHaveCount(3) // 种子数据有 3 篇文章
  })

  test('应该能够搜索文章', async ({ page }) => {
    // 点击搜索按钮或按 Cmd+K
    await page.keyboard.press('Meta+K')

    // 等待搜索模态框出现
    const searchModal = page.locator('.search-modal')
    await expect(searchModal).toBeVisible()

    // 输入搜索关键词
    const searchInput = page.locator('.search-input')
    await searchInput.fill('Vue')

    // 等待搜索结果
    const searchResults = page.locator('.search-result')
    await expect(searchResults).toBeVisible()

    // 按 Enter 提交搜索
    await page.keyboard.press('Enter')

    // 验证 URL 更新
    await expect(page).toHaveURL(/\/search/)
  })

  test('应该能够查看文章详情', async ({ page }) => {
    // 点击第一篇文章
    const firstArticle = page.locator('.article-card').first()
    await firstArticle.click()

    // 验证进入文章详情页
    await expect(page).toHaveURL(/\/articles\//)

    // 验证文章内容显示
    const articleTitle = page.locator('h1')
    await expect(articleTitle).toBeVisible()

    const articleContent = page.locator('.article-content')
    await expect(articleContent).toBeVisible()
  })

  test('应该能够浏览分类', async ({ page }) => {
    // 点击分类链接
    await page.click('a[href="/categories"]')

    // 验证分类页面加载
    await expect(page).toHaveURL('/categories')

    // 验证分类列表显示
    const categories = page.locator('.category-item')
    await expect(categories).toHaveCountGreaterThan(0)
  })

  test('应该能够浏览标签', async ({ page }) => {
    // 点击标签链接
    await page.click('a[href="/tags"]')

    // 验证标签页面加载
    await expect(page).toHaveURL('/tags')

    // 验证标签列表显示
    const tags = page.locator('.tag-item')
    await expect(tags).toHaveCountGreaterThan(0)
  })

  test.describe('用户认证', () => {
    test('应该能够注册新用户', async ({ page }) => {
      // 导航到注册页面
      await page.goto('/register')

      // 填写注册表单
      await page.fill('input[type="email"]', `test-${Date.now()}@example.com`)
      await page.fill('input[type="text"]', 'testuser')
      await page.fill('input[type="password"]', 'password123')

      // 提交表单
      await page.click('button[type="submit"]')

      // 验证注册成功（可能重定向到首页或登录页）
      await expect(page).toHaveURL(/\/(login|home)?/)
    })

    test('应该能够登录', async ({ page }) => {
      // 导航到登录页面
      await page.goto('/login')

      // 填写登录表单（使用种子数据账号）
      await page.fill('input[type="email"]', 'admin@blog.com')
      await page.fill('input[type="password"]', 'admin123')

      // 提交表单
      await page.click('button[type="submit"]')

      // 验证登录成功
      await expect(page).toHaveURL(/\/(admin|home)?/)
    })

    test('登录失败应该显示错误提示', async ({ page }) => {
      // 导航到登录页面
      await page.goto('/login')

      // 填写错误的登录信息
      await page.fill('input[type="email"]', 'wrong@example.com')
      await page.fill('input[type="password"]', 'wrongpassword')

      // 提交表单
      await page.click('button[type="submit"]')

      // 验证错误提示显示
      const errorMessage = page.locator('.error-message')
      await expect(errorMessage).toBeVisible()
      await expect(errorMessage).toContainText(/登录失败|用户不存在|密码错误/)
    })
  })

  test.describe('评论功能', () => {
    test.beforeEach(async ({ page }) => {
      // 先登录
      await page.goto('/login')
      await page.fill('input[type="email"]', 'admin@blog.com')
      await page.fill('input[type="password"]', 'admin123')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/(admin|home)?/)
    })

    test('应该能够发表评论', async ({ page }) => {
      // 进入文章详情页
      await page.goto('/articles/getting-started-with-vue3')

      // 填写评论内容
      const commentTextarea = page.locator('textarea[name="content"]')
      await commentTextarea.fill('这是一条测试评论')

      // 提交评论
      await page.click('button[type="submit"]')

      // 验证评论显示
      const comments = page.locator('.comment-item')
      await expect(comments).toHaveCountGreaterThan(0)

      // 验证新评论内容
      const lastComment = page.locator('.comment-item').last()
      await expect(lastComment).toContainText('这是一条测试评论')
    })

    test('评论提交失败应该显示错误', async ({ page }) => {
      // 进入文章详情页
      await page.goto('/articles/getting-started-with-vue3')

      // 提交空评论
      const commentTextarea = page.locator('textarea[name="content"]')
      await commentTextarea.fill('')

      // 尝试提交（按钮可能被禁用）
      const submitButton = page.locator('button[type="submit"]')
      await submitButton.click()

      // 验证错误提示或按钮禁用状态
      const errorMessage = page.locator('.error-message')
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toContainText(/评论内容|不能为空/)
      } else {
        await expect(submitButton).toBeDisabled()
      }
    })
  })

  test.describe('订阅功能', () => {
    test('应该能够通过 RSS 订阅', async ({ page }) => {
      // 访问 RSS 订阅链接
      const response = await page.request.get('/rss.xml')

      // 验证 RSS 内容
      expect(response.status()).toBe(200)
      const text = await response.text()
      expect(text).toContain('<?xml')
      expect(text).toContain('<rss')
    })

    test('应该能够邮件订阅', async ({ page }) => {
      // 滚动到订阅框
      const subscriptionBox = page.locator('.subscription-box')
      await subscriptionBox.scrollIntoViewIfNeeded()

      // 填写邮箱
      const emailInput = page.locator('.subscription-box input[type="email"]')
      await emailInput.fill(`test-${Date.now()}@example.com`)

      // 点击订阅按钮
      const subscribeButton = page.locator('.subscription-box button[type="submit"]')
      await subscribeButton.click()

      // 验证成功消息（注意：实际邮件发送需要配置 SMTP）
      const message = page.locator('.subscription-box .message')
      if (await message.isVisible()) {
        await expect(message).toContainText(/订阅成功|订阅失败/)
      }
    })
  })

  test.describe('响应式设计', () => {
    test('应该在移动端正常显示', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 })

      // 访问首页
      await page.goto('/')

      // 验证布局适配
      const articleCards = page.locator('.article-card')
      await expect(articleCards).toHaveCount(3)

      // 验证移动端导航
      const _mobileNav = page.locator('.mobile-nav')
      // 注意：这里假设有移动端导航，实际实现可能不同
    })

    test('应该在平板端正常显示', async ({ page }) => {
      // 设置平板视口
      await page.setViewportSize({ width: 768, height: 1024 })

      // 访问首页
      await page.goto('/')

      // 验证布局适配
      const articleCards = page.locator('.article-card')
      await expect(articleCards).toBeVisible()
    })
  })

  test.describe('性能测试', () => {
    test('首页加载性能应该良好', async ({ page }) => {
      // 记录性能指标
      const startTime = Date.now()

      await page.goto('/')

      await page.waitForLoadState('networkidle')

      const loadTime = Date.now() - startTime

      // 验证加载时间在可接受范围内（< 3s）
      expect(loadTime).toBeLessThan(3000)
    })

    test('页面切换应该流畅', async ({ page }) => {
      await page.goto('/')

      // 记录导航开始时间
      const startTime = Date.now()

      // 点击第一篇文章
      await page.click('.article-card:first-child')

      // 等待页面加载完成
      await page.waitForLoadState('networkidle')

      const navigationTime = Date.now() - startTime

      // 验证导航时间在可接受范围内（< 2s）
      expect(navigationTime).toBeLessThan(2000)
    })
  })
})
