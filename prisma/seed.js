// prisma/seed.js - 数据库种子数据
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient()

async function main() {
  console.log('开始创建种子数据...')

  try {
    // 清理现有数据（可选，谨慎使用）
    // await prisma.user.deleteMany()

    // 创建管理员账户
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@campsite.com' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@campsite.com',
        password: adminPassword,
        role: 'admin',
        firstName: '系统',
        lastName: '管理员',
        isActive: true,
      },
    })

    // 创建员工账户
    const staffPassword = await bcrypt.hash('staff123', 12);
    const staff = await prisma.user.upsert({
      where: { email: 'staff@campsite.com' },
      update: {},
      create: {
        username: 'staff001',
        email: 'staff@campsite.com',
        password: staffPassword,
        role: 'staff',
        firstName: '营地',
        lastName: '员工',
        isActive: true,
      },
    })

    // 创建客户账户
    const guestPassword = await bcrypt.hash('guest123', 12);
    const guest = await prisma.user.upsert({
      where: { email: 'guest@campsite.com' },
      update: {},
      create: {
        username: 'guest001',
        email: 'guest@campsite.com',
        password: guestPassword,
        role: 'guest',
        firstName: '测试',
        lastName: '客户',
        isActive: true,
      },
    })

    console.log('种子数据创建成功:')
    console.log('管理员:', { id: admin.id, email: admin.email })
    console.log('员工:', { id: staff.id, email: staff.email })
    console.log('客户:', { id: guest.id, email: guest.email })

  } catch (error) {
    console.error('创建种子数据时出错:', error)
    throw error
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
