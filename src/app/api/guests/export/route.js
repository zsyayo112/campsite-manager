// src/app/api/guests/export/route.js - 客户数据导出 API
import {
  createResponse,
  extractTokenFromRequest,
  hasRoleLevel,
  verifyToken
} from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

// GET /api/guests/export - 导出客户数据
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

    // 检查管理员权限（数据导出需要更高权限）
    if (!hasRoleLevel(decoded.role, 'admin')) {
      return createResponse(false, null, '权限不足，需要管理员权限', 403)
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const bookingStatus = searchParams.get('bookingStatus') || ''

    // 构建查询条件
    const where = {}
    if (bookingStatus && ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'REFUNDED'].includes(bookingStatus)) {
      where.booking = {
        status: bookingStatus
      }
    }

    // 获取所有客户数据
    const guests = await prisma.guest.findMany({
      where,
      include: {
        booking: {
          include: {
            package: {
              select: {
                id: true,
                name: true,
                capacity: true
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
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 格式化数据
    const formattedGuests = guests.map(guest => ({
      客户ID: guest.id,
      姓名: guest.name,
      年龄: guest.age || '未提供',
      电话: guest.phone || '未提供',
      应急联系人: guest.emergencyContact || '未提供',
      应急电话: guest.emergencyPhone || '未提供',
      饮食要求: guest.dietaryRequirements || '无特殊要求',
      身份证号: guest.idNumber || '未提供',
      预订编号: guest.booking.confirmationCode || '无',
      套餐名称: guest.booking.package.name,
      预订用户: guest.booking.user.firstName && guest.booking.user.lastName
        ? `${guest.booking.user.firstName}${guest.booking.user.lastName}`
        : guest.booking.user.username,
      用户邮箱: guest.booking.user.email,
      用户电话: guest.booking.user.phone || '未提供',
      入住日期: new Date(guest.booking.checkIn).toLocaleDateString('zh-CN'),
      退房日期: new Date(guest.booking.checkOut).toLocaleDateString('zh-CN'),
      预订状态: getBookingStatusText(guest.booking.status),
      客人数量: guest.booking.guestCount,
      创建时间: new Date(guest.createdAt).toLocaleString('zh-CN'),
      更新时间: new Date(guest.updatedAt).toLocaleString('zh-CN')
    }))

    if (format === 'csv') {
      // 生成CSV格式
      const csvHeader = Object.keys(formattedGuests[0] || {}).join(',')
      const csvRows = formattedGuests.map(guest => 
        Object.values(guest).map(value => 
          typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value
        ).join(',')
      )
      const csvContent = [csvHeader, ...csvRows].join('\n')

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="guests-export-${new Date().toISOString().split('T')[0]}.csv"`,
          'Access-Control-Expose-Headers': 'Content-Disposition'
        }
      })
    } else {
      // 返回JSON格式
      return createResponse(true, {
        guests: formattedGuests,
        exportTime: new Date().toISOString(),
        totalCount: guests.length,
        format: 'json'
      }, '客户数据导出成功', 200)
    }

  } catch (error) {
    console.error('导出客户数据失败:', error)
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