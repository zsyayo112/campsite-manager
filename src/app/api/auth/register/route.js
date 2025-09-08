// src/app/api/auth/register/route.js - 用户注册API

import {
  createCookieHeader,
  createResponse,
  generateToken,
  hashPassword,
  sanitizeUser,
  validateEmail,
  validatePassword,
  validateUsername
} from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function POST(request) {
  try {
    // 添加调试日志
    console.log('=== 注册 API 开始 ===')

    // 解析请求数据
    const body = await request.json()
    console.log('接收到的注册数据:', body)
    const { username, email, password, role } = body
    console.log('解析后的字段:', { username, email, password: password ? '***' : undefined, role })


    // 输入验证
    if (!username || !email || !password) {
      console.log('缺少必填字段')
      return createResponse(false, null, '所有字段都是必填的', 400)
    }

    // 验证用户名
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.valid) {
      return createResponse(false, null, usernameValidation.message, 400)
    }

    // 验证邮箱格式
    if (!validateEmail(email)) {
      return createResponse(false, null, '邮箱格式不正确', 400)
    }

    // 验证密码
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return createResponse(false, null, passwordValidation.message, 400)
    }

    // 验证密码确认（前端已处理，这里移除后端检查）

    // 验证角色
    const validRoles = ['admin', 'staff', 'guest']
    if (role && !validRoles.includes(role)) {
      return createResponse(false, null, '无效的用户角色', 400)
    }

    // 检查用户名是否已存在
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUsername) {
      return createResponse(false, null, '用户名已被占用', 409)
    }

    // 检查邮箱是否已存在
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return createResponse(false, null, '邮箱已被注册', 409)
    }

    // 加密密码
    const hashedPassword = await hashPassword(password)

    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || 'guest', // 默认角色为guest
      }
    })

    // 生成JWT Token
    const token = generateToken({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    })

    // 清理用户数据（移除密码）
    const userResponse = sanitizeUser(newUser)

    // 创建响应并设置Cookie
    const response = createResponse(true, {
      user: userResponse,
      token
    }, '注册成功', 201)

    // 设置HttpOnly Cookie
    response.headers.set('Set-Cookie', createCookieHeader(token))

    return response

  } catch (error) {
    console.error('注册失败:', error)

    // 处理数据库约束错误
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0]
      if (field === 'username') {
        return createResponse(false, null, '用户名已被占用', 409)
      }
      if (field === 'email') {
        return createResponse(false, null, '邮箱已被注册', 409)
      }
    }

    return createResponse(false, null, '服务器内部错误', 500)
  }
}
