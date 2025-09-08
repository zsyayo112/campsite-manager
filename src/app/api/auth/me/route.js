// src/app/api/auth/me/route.js - 获取当前用户信息API
import {
  createResponse,
  extractTokenFromRequest,
  sanitizeUser,
  verifyToken
} from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function GET(request) {
  try {
    // 从请求中提取Token
    const token = extractTokenFromRequest(request)

    if (!token) {
      return createResponse(false, null, '未提供认证令牌', 401)
    }

    // 验证Token
    const decoded = verifyToken(token)
    if (!decoded) {
      return createResponse(false, null, '无效或过期的令牌', 401)
    }

    // 从数据库获取最新的用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      return createResponse(false, null, '用户不存在', 404)
    }

    // 检查用户是否被禁用
    if (!user.isActive) {
      return createResponse(false, null, '账户已被禁用', 403)
    }

    // 清理用户数据（移除密码）
    const userResponse = sanitizeUser(user)

    return createResponse(true, { user: userResponse }, '获取用户信息成功', 200)

  } catch (error) {
    console.error('获取用户信息失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}

// 支持POST请求（某些客户端可能需要）
export async function POST(request) {
  return GET(request)
}
