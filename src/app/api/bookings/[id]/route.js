// src/app/api/bookings/[id]/route.js - 单个预订管理 API
import {
  createResponse,
  extractTokenFromRequest,
  hasRoleLevel,
  verifyToken
} from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'
import {
  calculateBookingPrice,
  canChangeBookingStatus,
  checkAvailability,
  getBookingStatusText,
  validateBookingData
} from '../../../../../lib/utils/booking'
import { formatPrice } from '../../../../../lib/utils/price'

// GET /api/bookings/[id] - 获取预订详情
export async function GET(request, { params }) {
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

    const bookingId = params.id

    // 查询预订信息
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true
          }
        },
        package: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            capacity: true,
            duration: true,
            amenities: true,
            images: true,
            status: true
          }
        },
        guests: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!booking) {
      return createResponse(false, null, '预订不存在', 404)
    }

    // 权限检查：客户只能查看自己的预订
    if (!hasRoleLevel(decoded.role, 'staff') && booking.userId !== decoded.userId) {
      return createResponse(false, null, '权限不足', 403)
    }

    // 计算预订天数
    const days = Math.ceil((booking.checkOut - booking.checkIn) / (1000 * 60 * 60 * 24))

    // 计算价格详情
    const priceDetails = calculateBookingPrice(
      booking.package.price,
      days,
      booking.guestCount,
      booking.package.capacity
    )

    // 格式化返回数据
    const formattedBooking = {
      ...booking,
      totalPriceFormatted: formatPrice(booking.totalPrice),
      statusText: getBookingStatusText(booking.status),
      days,
      package: {
        ...booking.package,
        priceFormatted: formatPrice(booking.package.price),
        amenities: JSON.parse(booking.package.amenities || '[]'),
        images: JSON.parse(booking.package.images || '[]')
      },
      priceDetails: {
        ...priceDetails,
        basePriceFormatted: formatPrice(priceDetails.basePrice),
        extraFeeFormatted: formatPrice(priceDetails.extraFee),
        totalPriceFormatted: formatPrice(priceDetails.totalPrice),
        pricePerDayFormatted: formatPrice(priceDetails.pricePerDay)
      }
    }

    return createResponse(true, {
      booking: formattedBooking
    }, '获取预订详情成功', 200)

  } catch (error) {
    console.error('获取预订详情失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}

// PUT /api/bookings/[id] - 更新预订信息
export async function PUT(request, { params }) {
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

    const bookingId = params.id
    const body = await request.json()

    // 查询现有预订
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        package: true
      }
    })

    if (!existingBooking) {
      return createResponse(false, null, '预订不存在', 404)
    }

    // 权限检查
    const isOwner = existingBooking.userId === decoded.userId
    const isStaff = hasRoleLevel(decoded.role, 'staff')

    if (!isOwner && !isStaff) {
      return createResponse(false, null, '权限不足', 403)
    }

    // 检查预订状态是否允许修改
    if (!isStaff && !['PENDING'].includes(existingBooking.status)) {
      return createResponse(false, null, '只有待确认的预订可以修改', 400)
    }

    const updateData = {}

    // 处理状态更新（仅员工和管理员）
    if (body.status && isStaff) {
      const statusCheck = canChangeBookingStatus(existingBooking.status, body.status)
      if (!statusCheck.canChange) {
        return createResponse(false, null, statusCheck.message, 400)
      }
      updateData.status = body.status
    }

    // 处理日期和客人数量更新
    if (body.checkIn || body.checkOut || body.guestCount) {
      const newCheckIn = body.checkIn ? new Date(body.checkIn) : existingBooking.checkIn
      const newCheckOut = body.checkOut ? new Date(body.checkOut) : existingBooking.checkOut
      const newGuestCount = body.guestCount || existingBooking.guestCount

      // 验证输入
      const validation = validateBookingData({
        packageId: existingBooking.packageId,
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        guestCount: newGuestCount,
        userId: existingBooking.userId
      })

      if (!validation.valid) {
        return createResponse(false, null, validation.message, 400)
      }

      // 检查新日期的可用性（排除当前预订）
      const availability = await checkAvailability(
        existingBooking.packageId,
        newCheckIn,
        newCheckOut,
        newGuestCount,
        bookingId
      )

      if (!availability.available) {
        return createResponse(false, {
          reason: availability.reason,
          conflicts: availability.conflicts
        }, availability.message, 409)
      }

      // 重新计算价格
      const priceDetails = calculateBookingPrice(
        existingBooking.package.price,
        availability.bookingDetails.days,
        newGuestCount,
        existingBooking.package.capacity
      )

      updateData.checkIn = newCheckIn
      updateData.checkOut = newCheckOut
      updateData.guestCount = newGuestCount
      updateData.totalPrice = priceDetails.totalPrice
    }

    // 处理特殊要求更新
    if (body.specialRequests !== undefined) {
      updateData.specialRequests = body.specialRequests || null
    }

    // 执行更新
    if (Object.keys(updateData).length === 0) {
      return createResponse(false, null, '没有提供需要更新的数据', 400)
    }

    updateData.updatedAt = new Date()

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
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
            price: true,
            capacity: true,
            amenities: true,
            images: true
          }
        },
        guests: true
      }
    })

    // 计算最新的价格详情
    const days = Math.ceil((updatedBooking.checkOut - updatedBooking.checkIn) / (1000 * 60 * 60 * 24))
    const priceDetails = calculateBookingPrice(
      updatedBooking.package.price,
      days,
      updatedBooking.guestCount,
      updatedBooking.package.capacity
    )

    // 格式化返回数据
    const formattedBooking = {
      ...updatedBooking,
      totalPriceFormatted: formatPrice(updatedBooking.totalPrice),
      statusText: getBookingStatusText(updatedBooking.status),
      days,
      package: {
        ...updatedBooking.package,
        priceFormatted: formatPrice(updatedBooking.package.price),
        amenities: JSON.parse(updatedBooking.package.amenities || '[]'),
        images: JSON.parse(updatedBooking.package.images || '[]')
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
    }, '预订更新成功', 200)

  } catch (error) {
    console.error('更新预订失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}

// DELETE /api/bookings/[id] - 取消预订
export async function DELETE(request, { params }) {
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

    const bookingId = params.id

    // 查询预订
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) {
      return createResponse(false, null, '预订不存在', 404)
    }

    // 权限检查
    const isOwner = booking.userId === decoded.userId
    const isStaff = hasRoleLevel(decoded.role, 'staff')

    if (!isOwner && !isStaff) {
      return createResponse(false, null, '权限不足', 403)
    }

    // 检查是否可以取消
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      return createResponse(false, null, '只有待确认或已确认的预订可以取消', 400)
    }

    // 检查取消时间限制（可选业务规则）
    const checkInDate = new Date(booking.checkIn)
    const now = new Date()
    const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60)

    // 如果距离入住时间少于24小时，只有员工可以取消
    if (hoursUntilCheckIn < 24 && !isStaff) {
      return createResponse(false, null, '距离入住时间不足24小时，请联系客服取消', 400)
    }

    // 更新预订状态为已取消
    const cancelledBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      },
      include: {
        package: {
          select: {
            name: true
          }
        }
      }
    })

    return createResponse(true, {
      booking: {
        id: cancelledBooking.id,
        confirmationCode: cancelledBooking.confirmationCode,
        status: cancelledBooking.status,
        statusText: getBookingStatusText(cancelledBooking.status),
        packageName: cancelledBooking.package.name,
        totalPriceFormatted: formatPrice(cancelledBooking.totalPrice)
      }
    }, '预订已成功取消', 200)

  } catch (error) {
    console.error('取消预订失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}
