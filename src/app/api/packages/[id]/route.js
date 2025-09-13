// src/app/api/packages/[id]/route.js - 套餐详情 API
import {
  createResponse,
  extractTokenFromRequest,
  hasRoleLevel,
  verifyToken
} from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'
import { formatPrice, parsePriceToDb, validatePrice } from '../../../../../lib/utils/price'

// GET /api/packages/[id] - 获取套餐详情
export async function GET(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return createResponse(false, null, '套餐ID不能为空', 400)
    }

    // 获取套餐信息
    const packageData = await prisma.package.findUnique({
      where: { id },
      include: {
        bookings: {
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
            status: true,
            guestCount: true,
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      }
    })

    if (!packageData) {
      return createResponse(false, null, '套餐不存在', 404)
    }

    // 检查访问权限
    const token = extractTokenFromRequest(request)
    const decoded = token ? verifyToken(token) : null

    // 如果套餐状态不是ACTIVE，需要员工或管理员权限
    if (packageData.status !== 'ACTIVE') {
      if (!decoded || !hasRoleLevel(decoded.role || 'guest', 'staff')) {
        return createResponse(false, null, '套餐不可用', 404)
      }
    }

    // 计算统计数据
    const now = new Date()
    const bookingStats = {
      total: packageData._count.bookings,
      confirmed: packageData.bookings.filter(b => b.status === 'CONFIRMED').length,
      pending: packageData.bookings.filter(b => b.status === 'PENDING').length,
      upcoming: packageData.bookings.filter(b =>
        ['CONFIRMED', 'PENDING'].includes(b.status) && new Date(b.checkIn) > now
      ).length,
      currentMonth: packageData.bookings.filter(b => {
        const bookingDate = new Date(b.checkIn)
        return bookingDate.getMonth() === now.getMonth() &&
               bookingDate.getFullYear() === now.getFullYear()
      }).length
    }

    // 计算可用性（简单版本 - 未来可以增强）
    const upcomingBookings = packageData.bookings.filter(b =>
      ['CONFIRMED', 'CHECKED_IN'].includes(b.status) && new Date(b.checkOut) > now
    )

    // 格式化返回数据
    const formattedPackage = {
      ...packageData,
      priceFormatted: formatPrice(packageData.price),
      amenities: JSON.parse(packageData.amenities || '[]'),
      images: JSON.parse(packageData.images || '[]'),
      bookingStats,
      upcomingBookings: upcomingBookings.map(booking => ({
        id: booking.id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: booking.status,
        guestCount: booking.guestCount,
        guestName: booking.user.firstName && booking.user.lastName
          ? `${booking.user.firstName}${booking.user.lastName}`
          : booking.user.username
      }))
    }

    // 根据用户权限决定返回的预订信息
    if (!decoded || !hasRoleLevel(decoded.role || 'guest', 'staff')) {
      // 普通用户不能看到预订详情
      delete formattedPackage.bookings
      delete formattedPackage.upcomingBookings
    }

    return createResponse(true, {
      package: formattedPackage
    }, '获取套餐详情成功', 200)

  } catch (error) {
    console.error('获取套餐详情失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}

// PUT /api/packages/[id] - 更新套餐（仅管理员）
export async function PUT(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return createResponse(false, null, '套餐ID不能为空', 400)
    }

    // 验证身份和权限
    const token = extractTokenFromRequest(request)
    if (!token) {
      return createResponse(false, null, '未提供认证令牌', 401)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return createResponse(false, null, '无效或过期的令牌', 401)
    }

    // 检查管理员权限
    if (!hasRoleLevel(decoded.role, 'admin')) {
      return createResponse(false, null, '权限不足，需要管理员权限', 403)
    }

    // 检查套餐是否存在
    const existingPackage = await prisma.package.findUnique({
      where: { id }
    })

    if (!existingPackage) {
      return createResponse(false, null, '套餐不存在', 404)
    }

    // 解析请求数据
    const body = await request.json()
    const {
      name,
      description,
      price,
      duration,
      capacity,
      amenities,
      images,
      status
    } = body

    // 构建更新数据
    const updateData = {}

    // 验证并更新各字段
    if (name !== undefined) {
      if (!name || name.length < 2 || name.length > 100) {
        return createResponse(false, null, '套餐名称长度必须在2-100个字符之间', 400)
      }

      // 检查名称是否与其他套餐冲突
      if (name !== existingPackage.name) {
        const nameConflict = await prisma.package.findFirst({
          where: {
            name,
            id: { not: id }
          }
        })

        if (nameConflict) {
          return createResponse(false, null, '套餐名称已存在', 409)
        }
      }

      updateData.name = name
    }

    if (description !== undefined) {
      updateData.description = description || null
    }

    if (price !== undefined) {
      const priceValidation = validatePrice(price)
      if (!priceValidation.valid) {
        return createResponse(false, null, priceValidation.message, 400)
      }
      updateData.price = parsePriceToDb(price)
    }

    if (duration !== undefined) {
      if (!Number.isInteger(duration) || duration < 1 || duration > 365) {
        return createResponse(false, null, '时长必须是1-365之间的整数', 400)
      }
      updateData.duration = duration
    }

    if (capacity !== undefined) {
      if (!Number.isInteger(capacity) || capacity < 1 || capacity > 50) {
        return createResponse(false, null, '容量必须是1-50之间的整数', 400)
      }
      updateData.capacity = capacity
    }

    if (amenities !== undefined) {
      updateData.amenities = JSON.stringify(amenities)
    }

    if (images !== undefined) {
      updateData.images = JSON.stringify(images)
    }

    if (status !== undefined) {
      if (!['ACTIVE', 'INACTIVE', 'DRAFT'].includes(status)) {
        return createResponse(false, null, '无效的套餐状态', 400)
      }
      updateData.status = status
    }

    // 执行更新
    const updatedPackage = await prisma.package.update({
      where: { id },
      data: updateData
    })

    // 格式化返回数据
    const formattedPackage = {
      ...updatedPackage,
      priceFormatted: formatPrice(updatedPackage.price),
      amenities: JSON.parse(updatedPackage.amenities),
      images: JSON.parse(updatedPackage.images)
    }

    return createResponse(true, {
      package: formattedPackage
    }, '套餐更新成功', 200)

  } catch (error) {
    console.error('更新套餐失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}

// DELETE /api/packages/[id] - 删除套餐（仅管理员）
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return createResponse(false, null, '套餐ID不能为空', 400)
    }

    // 验证身份和权限
    const token = extractTokenFromRequest(request)
    if (!token) {
      return createResponse(false, null, '未提供认证令牌', 401)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return createResponse(false, null, '无效或过期的令牌', 401)
    }

    // 检查管理员权限
    if (!hasRoleLevel(decoded.role, 'admin')) {
      return createResponse(false, null, '权限不足，需要管理员权限', 403)
    }

    // 检查套餐是否存在
    const existingPackage = await prisma.package.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    })

    if (!existingPackage) {
      return createResponse(false, null, '套餐不存在', 404)
    }

    // 检查是否有关联的预订
    if (existingPackage._count.bookings > 0) {
      // 有关联预订时，使用软删除（设置为INACTIVE）
      const updatedPackage = await prisma.package.update({
        where: { id },
        data: { status: 'INACTIVE' }
      })

      return createResponse(true, {
        package: updatedPackage,
        note: '由于存在关联预订，套餐已设置为不可用状态而非完全删除'
      }, '套餐已停用', 200)
    } else {
      // 没有关联预订时，可以安全删除
      await prisma.package.delete({
        where: { id }
      })

      return createResponse(true, null, '套餐删除成功', 200)
    }

  } catch (error) {
    console.error('删除套餐失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}
