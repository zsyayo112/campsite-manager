// src/app/api/guests/route.js - 客户信息管理 API
import {
  createResponse,
  extractTokenFromRequest,
  hasRoleLevel,
  verifyToken
} from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

// GET /api/guests - 获取客户列表
export async function GET(request) {
  try {
    // 验证身份和权限
    const token = extractTokenFromRequest(request)
    if (!token) {
      return createResponse(false, null, '未提供认证令牌', 401)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return createResponse(false, null, '无效或过期的令牌', 401)
    }

    // 检查员工或管理员权限
    if (!hasRoleLevel(decoded.role, 'staff')) {
      return createResponse(false, null, '权限不足，需要员工或管理员权限', 403)
    }

    const { searchParams } = new URL(request.url)

    // 分页参数
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit

    // 搜索和过滤参数
    const search = searchParams.get('search') || ''
    const bookingStatus = searchParams.get('bookingStatus') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 构建查询条件
    const where = {}
    const include = {
      booking: {
        include: {
          package: {
            select: {
              id: true,
              name: true
            }
          },
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }
    }

    // 搜索条件 - SQLite不支持insensitive
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { emergencyContact: { contains: search } },
        { emergencyPhone: { contains: search } }
      ]
    }

    // 预订状态过滤
    if (bookingStatus && ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'REFUNDED'].includes(bookingStatus)) {
      where.booking = {
        status: bookingStatus
      }
    }

    // 排序选项
    const orderBy = {}
    if (sortBy === 'bookingDate') {
      orderBy.booking = { createdAt: sortOrder }
    } else {
      orderBy[sortBy] = sortOrder
    }

    // 执行查询
    const [guests, total] = await Promise.all([
      prisma.guest.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include
      }),
      prisma.guest.count({ where })
    ])

    // 格式化返回数据
    const formattedGuests = guests.map(guest => ({
      ...guest,
      booking: {
        ...guest.booking,
        checkInFormatted: new Date(guest.booking.checkIn).toLocaleDateString('zh-CN'),
        checkOutFormatted: new Date(guest.booking.checkOut).toLocaleDateString('zh-CN'),
        statusText: getBookingStatusText(guest.booking.status)
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
      guests: formattedGuests,
      pagination
    }, '获取客户列表成功', 200)

  } catch (error) {
    console.error('获取客户列表失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}

// 辅助函数：获取预订状态文本
function getBookingStatusText(status) {
  const statusMap = {
    PENDING: '待确认',
    CONFIRMED: '已确认',
    CHECKED_IN: '已入住',
    CHECKED_OUT: '已退房',
    CANCELLED: '已取消',
    REFUNDED: '已退款'
  }
  return statusMap[status] || status
}