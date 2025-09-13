// src/app/api/bookings/availability/route.js - 预订可用性检查 API
import {
  createResponse
} from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'
import {
  calculateBookingPrice,
  checkAvailability
} from '../../../../../lib/utils/booking'
import { formatPrice } from '../../../../../lib/utils/price'

// POST /api/bookings/availability - 检查预订可用性
export async function POST(request) {
  try {
    // 解析请求数据
    const body = await request.json()
    const {
      packageId,
      checkIn,
      checkOut,
      guestCount,
      excludeBookingId = null
    } = body

    // 基础输入验证
    if (!packageId || !checkIn || !checkOut || !guestCount) {
      return createResponse(false, null, '套餐ID、入住日期、退房日期和客人数量都是必填的', 400)
    }

    // 验证客人数量
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 50) {
      return createResponse(false, null, '客人数量必须是1-50之间的整数', 400)
    }

    // 日期处理和验证
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return createResponse(false, null, '日期格式不正确', 400)
    }

    // 检查可用性
    const availability = await checkAvailability(
      packageId,
      checkInDate,
      checkOutDate,
      guestCount,
      excludeBookingId
    )

    if (!availability.available) {
      return createResponse(false, {
        available: false,
        reason: availability.reason,
        message: availability.message,
        conflicts: availability.conflicts || null
      }, availability.message, 200) // 注意：这里用200状态码，因为检查本身是成功的
    }

    // 计算详细价格信息
    const priceDetails = calculateBookingPrice(
      availability.packageInfo.pricePerDay,
      availability.bookingDetails.days,
      guestCount,
      availability.packageInfo.capacity
    )

    // 返回可用性和价格信息
    return createResponse(true, {
      available: true,
      packageInfo: {
        ...availability.packageInfo,
        pricePerDayFormatted: formatPrice(availability.packageInfo.pricePerDay)
      },
      bookingDetails: {
        days: availability.bookingDetails.days,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guestCount
      },
      priceDetails: {
        ...priceDetails,
        basePriceFormatted: formatPrice(priceDetails.basePrice),
        extraFeeFormatted: formatPrice(priceDetails.extraFee),
        totalPriceFormatted: formatPrice(priceDetails.totalPrice),
        pricePerDayFormatted: formatPrice(priceDetails.pricePerDay)
      }
    }, '预订可用，价格计算完成', 200)

  } catch (error) {
    console.error('检查预订可用性失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}

// GET /api/bookings/availability - 获取套餐可用日期范围
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const packageId = searchParams.get('packageId')
    const months = parseInt(searchParams.get('months')) || 3 // 默认查询3个月

    if (!packageId) {
      return createResponse(false, null, '套餐ID是必填的', 400)
    }

    // 检查套餐是否存在且有效
    const packageInfo = await prisma.package.findUnique({
      where: { id: packageId },
      select: {
        id: true,
        name: true,
        status: true
      }
    })

    if (!packageInfo) {
      return createResponse(false, null, '套餐不存在', 404)
    }

    if (packageInfo.status !== 'ACTIVE') {
      return createResponse(false, null, '套餐当前不可预订', 400)
    }

    // 计算查询日期范围
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + months)

    // 获取指定时间范围内的所有有效预订
    const existingBookings = await prisma.booking.findMany({
      where: {
        packageId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'CHECKED_IN']
        },
        OR: [
          {
            AND: [
              { checkIn: { gte: startDate } },
              { checkIn: { lte: endDate } }
            ]
          },
          {
            AND: [
              { checkOut: { gte: startDate } },
              { checkOut: { lte: endDate } }
            ]
          },
          {
            AND: [
              { checkIn: { lte: startDate } },
              { checkOut: { gte: endDate } }
            ]
          }
        ]
      },
      select: {
        checkIn: true,
        checkOut: true,
        status: true
      }
    })

    // 生成被占用的日期列表
    const occupiedDates = []
    existingBookings.forEach(booking => {
      const current = new Date(booking.checkIn)
      const end = new Date(booking.checkOut)

      while (current < end) {
        occupiedDates.push(current.toISOString().split('T')[0])
        current.setDate(current.getDate() + 1)
      }
    })

    // 生成可用日期列表（示例：简单实现）
    const availableDates = []
    const current = new Date(startDate)

    while (current <= endDate) {
      const dateString = current.toISOString().split('T')[0]
      if (!occupiedDates.includes(dateString)) {
        availableDates.push(dateString)
      }
      current.setDate(current.getDate() + 1)
    }

    return createResponse(true, {
      packageId,
      packageName: packageInfo.name,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      occupiedDates: [...new Set(occupiedDates)], // 去重
      availableDates,
      existingBookings: existingBookings.map(booking => ({
        checkIn: booking.checkIn.toISOString().split('T')[0],
        checkOut: booking.checkOut.toISOString().split('T')[0],
        status: booking.status
      }))
    }, '获取可用日期成功', 200)

  } catch (error) {
    console.error('获取可用日期失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}
