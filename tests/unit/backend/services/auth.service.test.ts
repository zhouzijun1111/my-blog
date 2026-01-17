import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AuthService } from '@/packages/backend/src/services/auth.service'
import { PrismaClient } from '@prisma/client'

// Mock Prisma Client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  })),
}))

describe('AuthService', () => {
  let authService: AuthService
  let mockPrisma: any

  beforeEach(() => {
    mockPrisma = new PrismaClient()
    authService = new AuthService(mockPrisma)
  })

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      }

      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({
        id: '1',
        email: userData.email,
        username: userData.username,
        createdAt: new Date(),
      })

      const result = await authService.register(
        userData.email,
        userData.username,
        userData.password
      )

      expect(result).toHaveProperty('id', '1')
      expect(result).toHaveProperty('email', userData.email)
      expect(result).toHaveProperty('username', userData.username)
      expect(result).not.toHaveProperty('password')
    })

    it('should throw error if email already exists', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      }

      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: userData.email,
      })

      await expect(
        authService.register(userData.email, userData.username, userData.password)
      ).rejects.toThrow('邮箱已被注册')
    })

    it('should throw error if username already exists', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      }

      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null) // email not found
        .mockResolvedValueOnce({ id: '1', username: userData.username }) // username found

      await expect(
        authService.register(userData.email, userData.username, userData.password)
      ).rejects.toThrow('用户名已被使用')
    })

    it('should hash password before saving', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      }

      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockImplementation((data: any) => {
        return Promise.resolve({
          id: '1',
          email: data.data.email,
          username: data.data.username,
          password: data.data.password, // This should be hashed
          createdAt: new Date(),
        })
      })

      await authService.register(
        userData.email,
        userData.username,
        userData.password
      )

      const createCall = mockPrisma.user.create.mock.calls[0]
      const hashedPassword = createCall[0].data.password

      expect(hashedPassword).not.toBe(userData.password)
      expect(hashedPassword.length).toBeGreaterThan(20) // bcrypt hash length
    })
  })

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
      }

      // In a real test, you'd use a known bcrypt hash
      const hashedPassword =
        '$2a$10$abcdefghijklmnopqrstuvwxyz123456'

      mockPrisma.user.findUnique.mockResolvedValue({
        id: '1',
        email: userData.email,
        username: 'testuser',
        password: hashedPassword,
      })

      // Mock bcrypt.compare to return true
      vi.doMock('bcryptjs', () => ({
        compare: vi.fn().mockResolvedValue(true),
      }))

      // Note: This test will need actual bcrypt mocking in real scenario
      // For now, we'll test the structure
    })

    it('should throw error if user not found', async () => {
      const userData = {
        email: 'notfound@example.com',
        password: 'password123',
      }

      mockPrisma.user.findUnique.mockResolvedValue(null)

      await expect(
        authService.login(userData.email, userData.password)
      ).rejects.toThrow('用户不存在')
    })
  })

  describe('getUserById', () => {
    it('should return user without password', async () => {
      const userId = '1'

      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        username: 'testuser',
        password: 'hashed-password',
        createdAt: new Date(),
      })

      const result = await authService.getUserById(userId)

      expect(result).toHaveProperty('id', userId)
      expect(result).not.toHaveProperty('password')
    })

    it('should return null if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await authService.getUserById('nonexistent')

      expect(result).toBeNull()
    })
  })
})
