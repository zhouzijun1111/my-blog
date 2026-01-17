import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 哈希密码
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // 更新用户密码
  await prisma.user.update({
    where: { email: 'admin@example.com' },
    data: { password: hashedPassword }
  })

  console.log('✅ 用户密码已更新')
  console.log('📧 邮箱: admin@example.com')
  console.log('🔑 密码: admin123')
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
