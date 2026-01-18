import { FastifyInstance } from 'fastify'

/**
 * Sitemap 路由
 * 动态生成 XML sitemap
 */
export async function sitemapRoutes(fastify: FastifyInstance) {
  // 生成 sitemap.xml
  fastify.get('/sitemap.xml', async (request, reply) => {
    try {
      const host = request.headers.host || 'localhost:3000'
      const protocol = request.protocol || 'http'
      const baseUrl = `${protocol}://${host}`

      // 获取所有已发布的文章、分类、标签
      const [articles, categories, tags] = await Promise.all([
        fastify.prisma.article.findMany({
          where: { published: true },
          select: { slug: true, updatedAt: true }
        }),
        fastify.prisma.category.findMany({
          select: { slug: true }
        }),
        fastify.prisma.tag.findMany({
          select: { slug: true }
        })
      ])

      // 生成 XML
      const xml = generateSitemapXML(baseUrl, articles, categories, tags)

      reply.type('application/xml').send(xml)
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        error: {
          code: 'SITEMAP_GENERATE_FAILED',
          message: error.message || '生成 sitemap 失败'
        }
      })
    }
  })
}

/**
 * 生成 sitemap XML
 */
function generateSitemapXML(
  baseUrl: string,
  articles: any[],
  categories: any[],
  tags: any[]
): string {
  const urls = [
    // 首页
    { url: baseUrl, changefreq: 'daily', priority: 1.0 },
    // 文章列表
    { url: `${baseUrl}/articles`, changefreq: 'daily', priority: 0.9 },
    // 文章详情
    ...articles.map(article => ({
      url: `${baseUrl}/articles/${article.slug}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: article.updatedAt?.toISOString()
    })),
    // 分类页面
    ...categories.map(category => ({
      url: `${baseUrl}/categories/${category.slug}`,
      changefreq: 'weekly',
      priority: 0.7
    })),
    // 标签页面
    ...tags.map(tag => ({
      url: `${baseUrl}/tags/${tag.slug}`,
      changefreq: 'weekly',
      priority: 0.6
    }))
  ]

  // 生成 XML
  const urlElements = urls.map(u => {
    const lastmod = (u as any).lastmod ? `  <lastmod>${(u as any).lastmod}</lastmod>` : ''
    return `  <url>
    <loc>${u.url}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${lastmod}
  </url>`
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`
}
