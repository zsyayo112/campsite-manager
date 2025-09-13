// src/app/api/bookings/route.js - 预订管理 API
import {
  createResponse,
  extractTokenFromRequest,
  hasRoleLevel,
  verifyToken
} from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import {
  calculateBookingPrice,
  checkAvailability,
  generateUniqueConfirmationCode,
  getBookingStatusText,
  validateBookingData
} from '../../../../lib/utils/booking'
import { formatPrice } from '../../../../lib/utils/price'

// GET /api/bookings - 获取预订列表
export async function GET(request) {
  try {
    // 验证身份
    const token = extractTokenFromRequest(request)
    if (!token) {
      return createResponse(false, null, '未提供认证令牌', 401)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return createResponse(false, null, '无效或过期的令牌', 401)
    }

    const { searchParams } = new URL(request.url)

    // 分页参数
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit

    // 搜索和过滤参数
    const status = searchParams.get('status') || ''
    const packageId = searchParams.get('packageId') || ''
    const userId = searchParams.get('userId') || ''
    const confirmationCode = searchParams.get('confirmationCode') || ''
    const checkInFrom = searchParams.get('checkInFrom')
    const checkInTo = searchParams.get('checkInTo')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 构建查询条件
    const where = {}

    // 权限控制：客户只能看自己的预订
    if (!hasRoleLevel(decoded.role, 'staff')) {
      where.userId = decoded.userId
    } else if (userId) {
      // 员工和管理员可以按用户ID过滤
      where.userId = userId
    }

    // 状态过滤
    if (status && ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'REFUNDED'].includes(status)) {
      where.status = status
    }

    // 套餐过滤
    if (packageId) {
      where.packageId = packageId
    }

    // 确认码搜索 - 去除SQLite不支持的insensitive
    if (confirmationCode) {
      where.confirmationCode = {
        contains: confirmationCode
      }
    }

    // 入住日期范围过滤
    if (checkInFrom || checkInTo) {
      where.checkIn = {}
      if (checkInFrom) {
        where.checkIn.gte = new Date(checkInFrom)
      }
      if (checkInTo) {
        where.checkIn.lte = new Date(checkInTo)
      }
    }

    // 排序
    const orderBy = {}
    orderBy[sortBy] = sortOrder

    // 执行查询
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          package: {
            select: {
              id: true,
              name: true,
              capacity: true,
              amenities: true,
              images: true
            }
          },
          guests: {
            select: {
              id: true,
              name: true,
              age: true,
              phone: true
            }
          }
        }
      }),
      prisma.booking.count({ where })
    ])

    // 格式化返回数据
    const formattedBookings = bookings.map(booking => ({
      ...booking,
      totalPriceFormatted: formatPrice(booking.totalPrice),
      statusText: getBookingStatusText(booking.status),
      package: {
        ...booking.package,
        amenities: JSON.parse(booking.package.amenities || '[]'),
        images: JSON.parse(booking.package.images || '[]')
      }
    }))

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }

    return createResponse(true, {
      bookings: formattedBookings,
      pagination
    }, '获取预订列表成功', 200)

  } catch (error) {
    console.error('获取预订列表失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}

// POST /api/bookings - 创建新预订
export async function POST(request) {
  try {
    // 验证身份
    const token = extractTokenFromRequest(request)
    if (!token) {
      return createResponse(false, null, '未提供认证令牌', 401)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return createResponse(false, null, '无效或过期的令牌', 401)
    }

    // 解析请求数据
    const body = await request.json()
    const {
      packageId,
      checkIn,
      checkOut,
      guestCount,
      specialRequests,
      guests = []
    } = body

    // 客户只能为自己创建预订，员工和管理员可以为其他用户创建
    const targetUserId = hasRoleLevel(decoded.role, 'staff') && body.userId
      ? body.userId
      : decoded.userId

    // 输入验证
    const validation = validateBookingData({
      packageId,
      checkIn,
      checkOut,
      guestCount,
      userId: targetUserId
    })

    if (!validation.valid) {
      return createResponse(false, null, validation.message, 400)
    }

    // 日期处理
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    // 检查可用性
    const availability = await checkAvailability(
      packageId,
      checkInDate,
      checkOutDate,
      guestCount
    )

    if (!availability.available) {
      return createResponse(false, {
        reason: availability.reason,
        conflicts: availability.conflicts
      }, availability.message, 409)
    }

    // 计算价格
    const priceDetails = calculateBookingPrice(
      availability.packageInfo.pricePerDay,
      availability.bookingDetails.days,
      guestCount,
      availability.packageInfo.capacity
    )

    // 生成确认码
    const confirmationCode = await generateUniqueConfirmationCode()

    // 创建预订
    const booking = await prisma.booking.create({
      data: {
        userId: targetUserId,
        packageId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guestCount,
        totalPrice: priceDetails.totalPrice,
        status: 'PENDING',
        specialRequests: specialRequests || null,
        confirmationCode
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true
          }
        },
        package: {
          select: {
            id: true,
            name: true,
            description: true,
            capacity: true,
            amenities: true,
            images: true
          }
        }
      }
    })

    // 如果提供了客人信息，创建客人记录
    if (guests.length > 0) {
      const guestData = guests.map(guest => ({
        bookingId: booking.id,
        name: guest.name,
        age: guest.age || null,
        phone: guest.phone || null,
        emergencyContact: guest.emergencyContact || null,
        emergencyPhone: guest.emergencyPhone || null,
        dietaryRequirements: guest.dietaryRequirements || null,
        idNumber: guest.idNumber || null
      }))

      await prisma.guest.createMany({
        data: guestData
      })
    }

    // 格式化返回数据
    const formattedBooking = {
      ...booking,
      totalPriceFormatted: formatPrice(booking.totalPrice),
      statusText: getBookingStatusText(booking.status),
      package: {
        ...booking.package,
        amenities: JSON.parse(booking.package.amenities || '[]'),
        images: JSON.parse(booking.package.images || '[]')
      },
      priceDetails: {
        ...priceDetails,
        basePriceFormatted: formatPrice(priceDetails.basePrice),
        extraFeeFormatted: formatPrice(priceDetails.extraFee),
        totalPriceFormatted: formatPrice(priceDetails.totalPrice)
      }
    }

    return createResponse(true, {
      booking: formattedBooking
    }, '预订创建成功', 201)

  } catch (error) {
    console.error('创建预订失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}

// PUT /api/bookings - 批量更新预订状态（员工和管理员）
export async function PUT(request) {
  try {
    // 验证身份和权限
    const token = extractTokenFromRequest(request)
    if (!token) {
      return createResponse(false, null, '未提供认证令牌', 401)
    }

    const decoded = verifyToken(token)
    if (!decoded || !hasRoleLevel(decoded.role, 'staff')) {
      return createResponse(false, null, '权限不足，需要员工或管理员权限', 403)
    }

    const body = await request.json()
    const { bookingIds, newStatus } = body

    // 输入验证
    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return createResponse(false, null, '预订ID列表不能为空', 400)
    }

    if (!['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'REFUNDED'].includes(newStatus)) {
      return createResponse(false, null, '无效的预订状态', 400)
    }

    // 批量更新
    const updateResult = await prisma.booking.updateMany({
      where: {
        id: { in: bookingIds }
      },
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    })

    return createResponse(true, {
      updatedCount: updateResult.count,
      newStatus,
      newStatusText: getBookingStatusText(newStatus)
    }, `成功更新${updateResult.count}个预订状态`, 200)

  } catch (error) {
    console.error('批量更新预订状态失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}
