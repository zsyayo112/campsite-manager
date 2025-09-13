// src/app/api/guests/[id]/route.js - 客户详情管理 API
import {
  createResponse,
  extractTokenFromRequest,
  hasRoleLevel,
  verifyToken
} from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

// GET /api/guests/[id] - 获取客户详情
export async function GET(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return createResponse(false, null, '客户ID不能为空', 400)
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

    // 检查员工或管理员权限
    if (!hasRoleLevel(decoded.role, 'staff')) {
      return createResponse(false, null, '权限不足，需要员工或管理员权限', 403)
    }

    // 获取客户详细信息
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            package: {
              select: {
                id: true,
                name: true,
                description: true,
                capacity: true,
                amenities: true
              }
            },
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            },
            guests: {
              where: {
                id: { not: id } // 排除当前客户
              },
              select: {
                id: true,
                name: true,
                age: true,
                phone: true
              }
            }
          }
        }
      }
    })

    if (!guest) {
      return createResponse(false, null, '客户不存在', 404)
    }

    // 获取该客户的预订历史
    const bookingHistory = await prisma.booking.findMany({
      where: {
        guests: {
          some: {
            name: guest.name,
            phone: guest.phone || undefined
          }
        }
      },
      include: {
        package: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 格式化返回数据
    const formattedGuest = {
      ...guest,
      booking: {
        ...guest.booking,
        checkInFormatted: new Date(guest.booking.checkIn).toLocaleDateString('zh-CN'),
        checkOutFormatted: new Date(guest.booking.checkOut).toLocaleDateString('zh-CN'),
        statusText: getBookingStatusText(guest.booking.status),
        package: {
          ...guest.booking.package,
          amenities: JSON.parse(guest.booking.package.amenities || '[]')
        }
      },
      bookingHistory: bookingHistory.map(booking => ({
        ...booking,
        checkInFormatted: new Date(booking.checkIn).toLocaleDateString('zh-CN'),
        checkOutFormatted: new Date(booking.checkOut).toLocaleDateString('zh-CN'),
        statusText: getBookingStatusText(booking.status),
        customerName: booking.user.firstName && booking.user.lastName
          ? `${booking.user.firstName}${booking.user.lastName}`
          : booking.user.username || '未知客户'
      }))
    }

    return createResponse(true, {
      guest: formattedGuest
    }, '获取客户详情成功', 200)

  } catch (error) {
    console.error('获取客户详情失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}

// PUT /api/guests/[id] - 更新客户信息
export async function PUT(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return createResponse(false, null, '客户ID不能为空', 400)
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

    // 检查员工或管理员权限
    if (!hasRoleLevel(decoded.role, 'staff')) {
      return createResponse(false, null, '权限不足，需要员工或管理员权限', 403)
    }

    // 检查客户是否存在
    const existingGuest = await prisma.guest.findUnique({
      where: { id }
    })

    if (!existingGuest) {
      return createResponse(false, null, '客户不存在', 404)
    }

    // 解析请求数据
    const body = await request.json()
    const {
      name,
      age,
      phone,
      emergencyContact,
      emergencyPhone,
      dietaryRequirements,
      idNumber
    } = body

    // 构建更新数据
    const updateData = {}

    if (name !== undefined) {
      if (!name || name.length < 1 || name.length > 50) {
        return createResponse(false, null, '姓名长度必须在1-50个字符之间', 400)
      }
      updateData.name = name
    }

    if (age !== undefined) {
      if (age !== null && (age < 0 || age > 150)) {
        return createResponse(false, null, '年龄必须在0-150之间', 400)
      }
      updateData.age = age
    }

    if (phone !== undefined) {
      if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
        return createResponse(false, null, '请输入有效的手机号码', 400)
      }
      updateData.phone = phone || null
    }

    if (emergencyContact !== undefined) {
      updateData.emergencyContact = emergencyContact || null
    }

    if (emergencyPhone !== undefined) {
      if (emergencyPhone && !/^1[3-9]\d{9}$/.test(emergencyPhone)) {
        return createResponse(false, null, '请输入有效的应急联系电话', 400)
      }
      updateData.emergencyPhone = emergencyPhone || null
    }

    if (dietaryRequirements !== undefined) {
      updateData.dietaryRequirements = dietaryRequirements || null
    }

    if (idNumber !== undefined) {
      if (idNumber && !/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(idNumber)) {
        return createResponse(false, null, '请输入有效的身份证号码', 400)
      }
      updateData.idNumber = idNumber || null
    }

    // 执行更新
    if (Object.keys(updateData).length === 0) {
      return createResponse(false, null, '没有提供需要更新的数据', 400)
    }

    updateData.updatedAt = new Date()

    const updatedGuest = await prisma.guest.update({
      where: { id },
      data: updateData,
      include: {
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
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    })

    return createResponse(true, {
      guest: updatedGuest
    }, '客户信息更新成功', 200)

  } catch (error) {
    console.error('更新客户信息失败:', error)
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