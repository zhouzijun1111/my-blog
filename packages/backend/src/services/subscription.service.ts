import { PrismaClient } from '@prisma/client'
import { randomBytes } from 'crypto'
import RSS from 'rss'

/**
 * 订阅服务
 * 处理邮件订阅和 RSS 订阅
 */
export class SubscriptionService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * 创建邮件订阅
   */
  async subscribe(email: string) {
    // 检查是否已订阅
    const existing = await this.prisma.subscription.findUnique({
      where: { email }
    })

    if (existing) {
      if (existing.verified) {
        throw new Error('该邮箱已订阅')
      } else {
        // 如果未验证，重新发送验证邮件（删除旧的）
        await this.prisma.subscription.delete({
          where: { email }
        })
      }
    }

    // 生成验证 token
    const token = randomBytes(32).toString('hex')

    // 创建订阅记录
    const subscription = await this.prisma.subscription.create({
      data: {
        email,
        verified: false,
        token
      }
    })

    // TODO: 发送验证邮件（需要配置 SMTP）
    // await this.sendVerificationEmail(email, token)

    return {
      email: subscription.email,
      verified: subscription.verified,
      message: '订阅成功，请查收验证邮件'
    }
  }

  /**
   * 验证邮箱
   */
  async verifyEmail(token: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { token }
    })

    if (!subscription) {
      throw new Error('验证链接无效或已过期')
    }

    if (subscription.verified) {
      throw new Error('该邮箱已验证过')
    }

    // 更新为已验证
    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { verified: true }
    })

    return {
      email: updated.email,
      message: '邮箱验证成功'
    }
  }

  /**
   * 取消订阅
   */
  async unsubscribe(email: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { email }
    })

    if (!subscription) {
      throw new Error('该邮箱未订阅')
    }

    await this.prisma.subscription.delete({
      where: { email }
    })

    return {
      message: '取消订阅成功'
    }
  }

  /**
   * 生成 RSS 订阅
   */
  async generateRSSFeed(baseUrl: string) {
    const feed = new RSS({
      title: '一剑轻安的博客',
      description: '探索技术深度，分享编程智慧',
      feed_url: `${baseUrl}/rss.xml`,
      site_url: baseUrl,
      language: 'zh-CN',
      pubDate: new Date(),
      ttl: 60 // 60 minutes cache
    })

    // 获取已发布的文章（最新的20篇）
    const articles = await this.prisma.article.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        author: {
          select: { username: true }
        },
        category: {
          select: { name: true }
        },
        tags: {
          select: { name: true }
        }
      }
    })

    // 添加文章到 RSS
    articles.forEach(article => {
      feed.item({
        title: article.title,
        description: article.excerpt || article.title,
        url: `${baseUrl}/articles/${article.slug}`,
        date: article.createdAt,
        author: article.author?.username || '一剑轻安',
        categories: [
          article.category?.name,
          ...article.tags.map(tag => tag.name)
        ].filter(Boolean)
      })
    })

    return feed.xml({ indent: true })
  }

  /**
   * 获取所有订阅者（管理员功能）
   */
  async getAllSubscribers(page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.subscription.count()
    ])

    return {
      items: subscriptions,
      pagination: {
        page,
        pageSize,
        total
      }
    }
  }

  /**
   * 发送验证邮件（TODO: 需要配置 SMTP）
   * 这是一个占位方法，实际使用时需要配置 nodemailer
   */
  private async sendVerificationEmail(email: string, token: string) {
    // TODO: 配置 nodemailer 后实现
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS
    //   }
    // })

    // const verificationUrl = `${process.env.APP_URL}/subscribe/verify?token=${token}`

    // await transporter.sendMail({
    //   from: '一剑轻安的博客 <noreply@blog.com>',
    //   to: email,
    //   subject: '确认订阅 - 一剑轻安的博客',
    //   html: `
    //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    //       <h2 style="color: #6366f1;">确认订阅</h2>
    //       <p>感谢您订阅一剑轻安的博客！</p>
    //       <p>请点击下方按钮确认您的订阅：</p>
    //       <a href="${verificationUrl}"
    //          style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
    //         确认订阅
    //       </a>
    //       <p style="color: #666; font-size: 14px;">如果按钮无法点击，请复制以下链接到浏览器：</p>
    //       <p style="color: #666; font-size: 14px;">${verificationUrl}</p>
    //       <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    //       <p style="color: #999; font-size: 12px;">这是一封自动发送的邮件，请勿回复。</p>
    //     </div>
    //   `
    // })

    console.log(`[TODO] 发送验证邮件到 ${email}, token: ${token}`)
  }
}
