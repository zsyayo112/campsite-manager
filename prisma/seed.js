// prisma/seed.js - 扩展的种子数据
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient()

async function main() {
  console.log('开始创建种子数据...')

  try {
    // 清理现有数据（开发环境）
    // await prisma.guest.deleteMany()
    // await prisma.booking.deleteMany()
    // await prisma.package.deleteMany()
    // await prisma.user.deleteMany()

    // 创建用户数据
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
        phone: '13800138000',
        isActive: true,
      },
    })

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
        phone: '13800138001',
        isActive: true,
      },
    })

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
        phone: '13800138002',
        isActive: true,
      },
    })

    // 创建额外的客户用户
    const customer1Password = await bcrypt.hash('customer123', 12);
    const customer1 = await prisma.user.upsert({
      where: { email: 'zhang.wei@example.com' },
      update: {},
      create: {
        username: 'zhangwei',
        email: 'zhang.wei@example.com',
        password: customer1Password,
        role: 'guest',
        firstName: '张',
        lastName: '伟',
        phone: '13812345678',
        isActive: true,
      },
    })

    console.log('用户创建完成')

    // 创建营地套餐数据
    const packages = [
      {
        name: '标准帐篷套餐',
        description: '适合2-3人的标准帐篷，包含基础设施和装备。位置优越，靠近公共设施。',
        price: 12000,
        duration: 1,
        capacity: 3,
        amenities: JSON.stringify([
          '双人帐篷',
          '睡袋租借',
          '公共洗手间',
          '24小时安保',
          '免费WiFi',
          '篝火区域'
        ]),
        images: JSON.stringify([
          '/images/packages/standard-tent-1.jpg',
          '/images/packages/standard-tent-2.jpg'
        ]),
        status: 'ACTIVE',
      },
      {
        name: '豪华露营套餐',
        description: '豪华帐篷配备独立卫浴，适合4-6人家庭。包含三餐和户外活动。',
        price: 28000,
        duration: 2,
        capacity: 6,
        amenities: JSON.stringify([
          '豪华帐篷',
          '独立卫浴',
          '空调设备',
          '三餐包含',
          '户外烧烤',
          '徒步向导',
          '免费WiFi',
          '24小时服务'
        ]),
        images: JSON.stringify([
          '/images/packages/luxury-camping-1.jpg',
          '/images/packages/luxury-camping-2.jpg',
          '/images/packages/luxury-camping-3.jpg'
        ]),
        status: 'ACTIVE',
      },
      {
        name: '探险者套餐',
        description: '专为户外探险爱好者设计，包含专业装备和探险活动。',
        price: 35000,
        duration: 3,
        capacity: 4,
        amenities: JSON.stringify([
          '专业帐篷',
          '探险装备',
          '专业向导',
          '攀岩体验',
          '溯溪活动',
          '野外求生课程',
          '应急医疗包',
          '卫星通讯'
        ]),
        images: JSON.stringify([
          '/images/packages/adventure-1.jpg',
          '/images/packages/adventure-2.jpg'
        ]),
        status: 'ACTIVE',
      },
      {
        name: '家庭亲子套餐',
        description: '专为家庭设计的亲子活动套餐，寓教于乐，适合带孩子的家庭。',
        price: 20000,
        duration: 2,
        capacity: 5,
        amenities: JSON.stringify([
          '家庭帐篷',
          '儿童游乐设施',
          '亲子活动',
          '自然教育',
          '手工制作',
          '篝火晚会',
          '儿童餐',
          '安全监护'
        ]),
        images: JSON.stringify([
          '/images/packages/family-1.jpg',
          '/images/packages/family-2.jpg'
        ]),
        status: 'ACTIVE',
      },
      {
        name: '团队建设套餐',
        description: '企业团队建设专用套餐，包含团队活动和会议设施。',
        price: 45000,
        duration: 2,
        capacity: 15,
        amenities: JSON.stringify([
          '团队帐篷',
          '会议设施',
          '团建活动',
          '拓展训练',
          '商务餐饮',
          '音响设备',
          '投影仪',
          '专业教练'
        ]),
        images: JSON.stringify([
          '/images/packages/team-building-1.jpg',
          '/images/packages/team-building-2.jpg'
        ]),
        status: 'ACTIVE',
      },
      {
        name: '浪漫情侣套餐',
        description: '为情侣专门设计的浪漫露营体验，私密性好，环境优美。',
        price: 18000,
        duration: 1,
        capacity: 2,
        amenities: JSON.stringify([
          '情侣帐篷',
          '私人空间',
          '浪漫布置',
          '烛光晚餐',
          '观星设备',
          '私人向导',
          'SPA服务',
          '摄影服务'
        ]),
        images: JSON.stringify([
          '/images/packages/romantic-1.jpg',
          '/images/packages/romantic-2.jpg'
        ]),
        status: 'ACTIVE',
      }
    ]

    const createdPackages = []
    for (const packageData of packages) {
      const pkg = await prisma.package.create({
        data: packageData
      })
      createdPackages.push(pkg)
    }

    console.log('套餐数据创建完成')

    // 创建预订数据
    const bookings = [
      {
        userId: guest.id,
        packageId: createdPackages[0].id, // 标准帐篷套餐
        checkIn: new Date('2025-09-15'),
        checkOut: new Date('2025-09-16'),
        guestCount: 2,
        totalPrice: 12000,
        status: 'CONFIRMED',
        specialRequests: '希望安排在安静的区域',
        confirmationCode: 'CAMP-2025-001'
      },
      {
        userId: customer1.id,
        packageId: createdPackages[1].id, // 豪华露营套餐
        checkIn: new Date('2025-09-20'),
        checkOut: new Date('2025-09-22'),
        guestCount: 4,
        totalPrice: 28000,
        status: 'PENDING',
        specialRequests: '有小孩，需要安全措施',
        confirmationCode: 'CAMP-2025-002'
      },
      {
        userId: guest.id,
        packageId: createdPackages[3].id, // 家庭亲子套餐
        checkIn: new Date('2025-10-01'),
        checkOut: new Date('2025-10-03'),
        guestCount: 3,
        totalPrice: 20000,
        status: 'CONFIRMED',
        specialRequests: '孩子对坚果过敏',
        confirmationCode: 'CAMP-2025-003'
      },
      {
        userId: customer1.id,
        packageId: createdPackages[5].id, // 浪漫情侣套餐
        checkIn: new Date('2025-08-15'),
        checkOut: new Date('2025-08-16'),
        guestCount: 2,
        totalPrice: 18000, // ¥180.00
        status: 'CHECKED_OUT',
        specialRequests: null,
        confirmationCode: 'CAMP-2025-004'
      }
    ]

    const createdBookings = []
    for (const bookingData of bookings) {
      const booking = await prisma.booking.create({
        data: bookingData
      })
      createdBookings.push(booking)
    }

    console.log('预订数据创建完成')

    // 创建客户信息数据
    const guests = [
      // 预订1的客户
      {
        bookingId: createdBookings[0].id,
        name: '李明',
        age: 28,
        phone: '13812345678',
        emergencyContact: '李华',
        emergencyPhone: '13812345679',
        dietaryRequirements: '无特殊要求',
        idNumber: '110101199501011234'
      },
      {
        bookingId: createdBookings[0].id,
        name: '王丽',
        age: 26,
        phone: '13912345678',
        emergencyContact: '王强',
        emergencyPhone: '13912345679',
        dietaryRequirements: '素食主义者',
        idNumber: '110101199701011234'
      },
      // 预订2的客户
      {
        bookingId: createdBookings[1].id,
        name: '张伟',
        age: 35,
        phone: '13712345678',
        emergencyContact: '张丽',
        emergencyPhone: '13712345679',
        dietaryRequirements: null,
        idNumber: '110101198801011234'
      },
      {
        bookingId: createdBookings[1].id,
        name: '刘芳',
        age: 32,
        phone: '13612345678',
        emergencyContact: '刘强',
        emergencyPhone: '13612345679',
        dietaryRequirements: null,
        idNumber: '110101199101011234'
      },
      {
        bookingId: createdBookings[1].id,
        name: '张小明',
        age: 8,
        phone: null,
        emergencyContact: '张伟',
        emergencyPhone: '13712345678',
        dietaryRequirements: '不吃辣',
        idNumber: null
      },
      {
        bookingId: createdBookings[1].id,
        name: '张小丽',
        age: 6,
        phone: null,
        emergencyContact: '刘芳',
        emergencyPhone: '13612345678',
        dietaryRequirements: '牛奶过敏',
        idNumber: null
      }
    ]

    for (const guestData of guests) {
      await prisma.guest.create({
        data: guestData
      })
    }

    console.log('客户信息数据创建完成')

    console.log('种子数据创建成功:')
    console.log('- 用户: 4个 (1管理员, 1员工, 2客户)')
    console.log('- 套餐: 6个营地套餐')
    console.log('- 预订: 4个预订记录')
    console.log('- 客户: 6个客户信息记录')

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
