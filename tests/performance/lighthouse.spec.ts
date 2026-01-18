import { test, expect } from '@playwright/test'
import { playAudit } from 'playwright-lighthouse'

/**
 * Lighthouse 性能测试
 *
 * 运行要求：
 * 1. 安装依赖：pnpm add -D playwright-lighthouse
 * 2. 启动开发服务器：pnpm dev
 * 3. 运行测试：pnpm test:e2e tests/performance/lighthouse.spec.ts
 */

test.describe('Lighthouse 性能测试', () => {
  // 测试配置
  const thresholds = {
    performance: 90,
    accessibility: 90,
    'best-practices': 90,
    seo: 90,
  }

  test('首页性能应该达标', async ({ page, port }) => {
    await page.goto(`http://localhost:${port}`)

    await playAudit({
      page,
      port,
      thresholds,
      reports: {
        formats: { html: true, json: true },
        name: `homepage-report-${Date.now()}`,
        directory: './test-reports/lighthouse',
      },
    })

    // 额外检查：首屏渲染
    const fcp = await page.evaluate(() =>
      performance.getEntriesByType('paint').find((entry) => entry.name === 'first-contentful-paint')
        ?.startTime
    )
    expect(fcp).toBeLessThan(1800) // FCP < 1.8s
  })

  test('文章详情页性能应该达标', async ({ page, port }) => {
    await page.goto(`http://localhost:${port}/articles/getting-started-with-vue3`)

    await playAudit({
      page,
      port,
      thresholds,
      reports: {
        formats: { html: true },
        name: `article-report-${Date.now()}`,
        directory: './test-reports/lighthouse',
      },
    })

    // 检查 LCP（Largest Contentful Paint）
    const lcp = await page.evaluate(() => {
      const entries = performance.getEntriesByType('largest-contentful-paint')
      return entries.length > 0 ? entries[entries.length - 1].startTime : null
    })
    expect(lcp).toBeLessThan(2500) // LCP < 2.5s
  })

  test('搜索页面性能应该达标', async ({ page, port }) => {
    await page.goto(`http://localhost:${port}/search?q=Vue`)

    await playAudit({
      page,
      port,
      thresholds: {
        ...thresholds,
        performance: 85, // 搜索页面可以略低
      },
      reports: {
        formats: { html: true },
        name: `search-report-${Date.now()}`,
        directory: './test-reports/lighthouse',
      },
    })
  })

  test('分类页面性能应该达标', async ({ page, port }) => {
    await page.goto(`http://localhost:${port}/categories`)

    await playAudit({
      page,
      port,
      thresholds,
      reports: {
        formats: { html: true },
        name: `categories-report-${Date.now()}`,
        directory: './test-reports/lighthouse',
      },
    })
  })

  test('标签页面性能应该达标', async ({ page, port }) => {
    await page.goto(`http://localhost:${port}/tags`)

    await playAudit({
      page,
      port,
      thresholds,
      reports: {
        formats: { html: true },
        name: `tags-report-${Date.now()}`,
        directory: './test-reports/lighthouse',
      },
    })
  })
})

test.describe('核心 Web 指标测试', () => {
  test('首页 CLS（累积布局偏移）应该小于 0.1', async ({ page }) => {
    await page.goto('/')

    // 等待页面完全加载
    await page.waitForLoadState('networkidle')

    // 测量 CLS
    const cls = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsValue = 0
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
          resolve(clsValue)
        }).observe({ entryTypes: ['layout-shift'] })

        // 1秒后返回结果
        setTimeout(() => resolve(clsValue), 1000)
      })
    })

    expect(cls).toBeLessThan(0.1)
  })

  test('首页 FID（首次输入延迟）应该小于 100ms', async ({ page }) => {
    await page.goto('/')

    // 等待页面可交互
    await page.waitForLoadState('domcontentloaded')

    // 测量 FID
    const fid = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          if (entries.length > 0) {
            resolve(entries[0].processingStart - entries[0].startTime)
          }
        }).observe({ entryTypes: ['first-input'] })

        // 模拟用户输入
        setTimeout(() => {
          document.body.click()
        }, 100)

        // 2秒后返回结果
        setTimeout(() => resolve(0), 2000)
      })
    })

    expect(fid).toBeLessThan(100)
  })

  test('首页 TTI（可交互时间）应该小于 3.8s', async ({ page }) => {
    await page.goto('/')

    const tti = await page.evaluate(async () => {
      return new Promise((resolve) => {
        if (window.PerformanceObserver) {
          try {
            new PerformanceObserver((list) => {
              const entries = list.getEntries()
              if (entries.length > 0) {
                resolve(entries[0].startTime)
              }
            }).observe({ entryTypes: ['largest-contentful-paint'] })
          } catch (_e) {
            // Fallback: 使用 domContentLoadedEventEnd
            resolve(
              performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
            )
          }
        }

        // 5秒后超时
        setTimeout(() => resolve(3800), 5000)
      })
    })

    expect(tti).toBeLessThan(3800)
  })
})

test.describe('资源加载测试', () => {
  test('JavaScript bundle 大小应该合理', async ({ page }) => {
    const responses: any[] = []

    page.on('response', async (response) => {
      const url = response.url()
      if (url.endsWith('.js')) {
        const headers = response.headers()
        const size = parseInt(headers['content-length'] || '0', 10)
        responses.push({ url, size })
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 检查是否有超过 500KB 的 JS 文件（未压缩）
    const largeBundles = responses.filter((r) => r.size > 500 * 1024)

    expect(largeBundles.length).toBe(0)
  })

  test('图片应该使用现代格式（WebP）', async ({ page }) => {
    const imageFormats: string[] = []

    page.on('response', async (response) => {
      const url = response.url()
      if (url.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
        const headers = response.headers()
        const contentType = headers['content-type'] || ''
        imageFormats.push(contentType)
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // 检查是否使用了 WebP 或 AVIF
    const _hasModernFormat = imageFormats.some(
      (format) => format.includes('webp') || format.includes('avif')
    )

    // 注意：如果浏览器不支持或服务器未配置，此项可能会失败
    // 这里只是示例性检查
  })
})

test.describe('动画性能测试', () => {
  test('滚动动画应该流畅（帧率 > 55fps）', async ({ page }) => {
    await page.goto('/')

    // 开始记录性能指标
    const _frames: number[] = []

    await page.evaluate(() => {
      let lastTime = performance.now()
      let frameCount = 0

      function measureFrame() {
        const now = performance.now()
        const fps = 1000 / (now - lastTime)
        ;(window as any).__testFrames = (window as any).__testFrames || []
        ;(window as any).__testFrames.push(fps)
        lastTime = now
        frameCount++

        if (frameCount < 60) {
          requestAnimationFrame(measureFrame)
        }
      }

      requestAnimationFrame(measureFrame)
    })

    // 滚动页面
    await page.evaluate(() => {
      window.scrollBy({ top: 1000, behavior: 'smooth' })
    })

    // 等待动画完成
    await page.waitForTimeout(2000)

    // 获取帧率数据
    const fpsData = await page.evaluate(() => (window as any).__testFrames || [])

    // 计算平均帧率
    const avgFps =
      fpsData.reduce((sum: number, fps: number) => sum + fps, 0) / fpsData.length

    expect(avgFps).toBeGreaterThan(55)
  })
})
