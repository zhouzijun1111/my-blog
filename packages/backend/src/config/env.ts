import { z } from 'zod'

/**
 * 环境变量验证 Schema
 * 使用 Zod 进行类型安全和验证
 */
const envSchema = z.object({
  // 数据库配置
  DATABASE_URL: z.string().min(1, 'DATABASE_URL 是必需的'),

  // JWT 配置
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET 必须至少 32 个字符以确保安全')
    .describe('JWT 签名密钥，生产环境必须使用强随机字符串'),
  JWT_EXPIRES_IN: z.string().default('7d').describe('JWT 过期时间'),

  // CORS 配置
  CORS_ORIGIN: z
    .string()
    .url('CORS_ORIGIN 必须是有效的 URL')
    .default('http://localhost:3000')
    .describe('允许的跨域源'),

  // 邮件配置（可选）
  SMTP_HOST: z.string().optional().describe('SMTP 服务器地址'),
  SMTP_PORT: z.string().default('587').describe('SMTP 端口'),
  SMTP_USER: z.string().optional().describe('SMTP 用户名'),
  SMTP_PASS: z.string().optional().describe('SMTP 密码'),
  SMTP_FROM: z
    .string()
    .default('一剑轻安的博客 <noreply@blog.com>')
    .describe('发件人地址'),

  // 应用配置
  APP_URL: z
    .string()
    .url('APP_URL 必须是有效的 URL')
    .default('http://localhost:3000')
    .describe('应用 URL'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development')
    .describe('运行环境'),

  // 限流配置
  RATE_LIMIT_MAX: z.string().default('100').describe('限流最大请求数'),
  RATE_LIMIT_WINDOW: z.string().default('60000').describe('限流时间窗口（毫秒）'),

  // 日志配置
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
    .default('info')
    .describe('日志级别'),
})

/**
 * 验证并解析环境变量
 * 如果验证失败，抛出详细的错误信息
 */
export function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(
        (err) => `- ${err.path.join('.')}: ${err.message}`
      )

      console.error('❌ 环境变量验证失败：')
      console.error(errorMessages.join('\n'))
      console.error('\n请检查 .env 文件或参考 .env.example 配置')

      process.exit(1)
    }

    throw error
  }
}

// 导出验证后的环境变量
export const env = validateEnv()

// 导出类型供其他模块使用
export type Env = z.infer<typeof envSchema>
