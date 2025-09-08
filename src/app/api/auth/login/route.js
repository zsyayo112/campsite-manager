// src/app/api/auth/login/route.js - 用户登录API
import {
  createCookieHeader,
  createResponse,
  generateToken,
  sanitizeUser,
  validateEmail,
  verifyPassword
} from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function POST(request) {
  try {
    // 解析请求数据
    const body = await request.json()
    const { email, password, rememberMe } = body

    // 输入验证
    if (!email || !password) {
      return createResponse(false, null, '邮箱和密码都是必填的', 400)
    }

    // 验证邮箱格式
    if (!validateEmail(email)) {
      return createResponse(false, null, '邮箱格式不正确', 400)
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return createResponse(false, null, '邮箱或密码错误', 401)
    }

    // 检查用户是否被禁用
    if (!user.isActive) {
      return createResponse(false, null, '账户已被禁用，请联系管理员', 403)
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      return createResponse(false, null, '邮箱或密码错误', 401)
    }

    // 生成JWT Token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }

    const token = generateToken(tokenPayload)

    // 更新用户最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    })

    // 清理用户数据（移除密码）
    const userResponse = sanitizeUser(user)

    // 创建响应
    const response = createResponse(true, {
      user: userResponse,
      token
    }, '登录成功', 200)

    // 设置Cookie（根据记住我选项调整过期时间）
    const cookieOptions = rememberMe
      ? { maxAge: 30 * 24 * 60 * 60 } // 30天
      : { maxAge: 7 * 24 * 60 * 60 }  // 7天

    response.headers.set('Set-Cookie', createCookieHeader(token, cookieOptions))

    return response

  } catch (error) {
    console.error('登录失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}
