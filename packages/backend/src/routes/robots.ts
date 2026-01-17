import { FastifyInstance } from 'fastify'

/**
 * Robots.txt 路由
 * 返回 robots.txt 文件内容
 */
export async function robotsRoutes(fastify: FastifyInstance) {
  fastify.get('/robots.txt', async (request, reply) => {
    const host = request.headers.host || 'localhost:3000'
    const protocol = request.protocol || 'http'
    const baseUrl = `${protocol}://${host}`

    const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# 禁止爬取管理员后台
Disallow: /admin
Disallow: /api

# 禁止爬取私有路径
Disallow: /login
Disallow: /register
`

    reply.type('text/plain').send(robotsTxt)
  })
}
