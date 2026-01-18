import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

/**
 * 认证服务（生产级 - 使用 bcryptjs 进行密码哈希）
 * bcryptjs 是纯 JavaScript 实现，无需原生模块编译，跨平台兼容性更好
 */
export class AuthService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * 用户注册
   */
  async register(email: string, username: string, password: string) {
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email }
    })

    if (existingUserByEmail) {
      throw new Error('该邮箱已被注册')
    }

    const existingUserByUsername = await this.prisma.user.findUnique({
      where: { username }
    })

    if (existingUserByUsername) {
      throw new Error('该用户名已被使用')
    }

    if (password.length < 6) {
      throw new Error('密码长度至少为 6 位')
    }

    // 使用 bcryptjs 进行密码哈希（10 轮加盐）
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await this.prisma.user.create({
      data: { email, username, password: hashedPassword }
    })

    const { password: _password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  /**
   * 用户登录
   */
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error('邮箱或密码错误')
    }

    // 使用 bcryptjs 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      throw new Error('邮箱或密码错误')
    }

    const { password: _password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  /**
   * 根据 ID 获取用户信息
   */
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    const { password: _password, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}
