// src/app/api/users/route.js - 用户管理 API
import {
  createResponse,
  extractTokenFromRequest,
  hashPassword,
  hasRoleLevel,
  sanitizeUser,
  validateEmail,
  validatePassword,
  validateUsername,
  verifyToken
} from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'

// GET /api/users - 获取用户列表（仅员工和管理员）
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

    // 检查员工权限
    if (!hasRoleLevel(decoded.role, 'staff')) {
      return createResponse(false, null, '权限不足，需要员工或管理员权限', 403)
    }

    const { searchParams } = new URL(request.url)

    // 分页参数
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const skip = (page - 1) * limit

    // 搜索和过滤参数
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const isActive = searchParams.get('isActive')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 构建查询条件
    const where = {}

    // 搜索条件
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 角色过滤
    if (role && ['admin', 'staff', 'guest'].includes(role)) {
      where.role = role
    }

    // 激活状态过滤
    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    // 排序
    const orderBy = {}
    orderBy[sortBy] = sortOrder

    // 执行查询
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          // 不包含密码
        }
      }),
      prisma.user.count({ where })
    ])

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }

    return createResponse(true, {
      users,
      pagination
    }, '获取用户列表成功', 200)

  } catch (error) {
    console.error('获取用户列表失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}

// POST /api/users - 创建新用户（仅管理员）
export async function POST(request) {
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

    // 检查管理员权限
    if (!hasRoleLevel(decoded.role, 'admin')) {
      return createResponse(false, null, '权限不足，需要管理员权限', 403)
    }

    // 解析请求数据
    const body = await request.json()
    const {
      username,
      email,
      password,
      role = 'guest',
      firstName,
      lastName,
      phone,
      isActive = true
    } = body

    // 输入验证
    if (!username || !email || !password) {
      return createResponse(false, null, '用户名、邮箱和密码都是必填的', 400)
    }

    // 验证用户名
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.valid) {
      return createResponse(false, null, usernameValidation.message, 400)
    }

    // 验证邮箱
    if (!validateEmail(email)) {
      return createResponse(false, null, '邮箱格式不正确', 400)
    }

    // 验证密码
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return createResponse(false, null, passwordValidation.message, 400)
    }

    // 验证角色
    if (!['admin', 'staff', 'guest'].includes(role)) {
      return createResponse(false, null, '无效的用户角色', 400)
    }

    // 检查用户名和邮箱唯一性
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      const field = existingUser.username === username ? '用户名' : '邮箱'
      return createResponse(false, null, `${field}已被使用`, 409)
    }

    // 密码加密
    const hashedPassword = await hashPassword(password)

    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        isActive
      }
    })

    // 返回清理后的用户数据
    const sanitizedUser = sanitizeUser(newUser)

    return createResponse(true, {
      user: sanitizedUser
    }, '用户创建成功', 201)

  } catch (error) {
    console.error('创建用户失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}

// PUT /api/users - 批量更新用户状态（仅管理员）
export async function PUT(request) {
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

    // 检查管理员权限
    if (!hasRoleLevel(decoded.role, 'admin')) {
      return createResponse(false, null, '权限不足，需要管理员权限', 403)
    }

    const body = await request.json()
    const { userIds, isActive } = body

    // 输入验证
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return createResponse(false, null, '用户ID列表不能为空', 400)
    }

    if (typeof isActive !== 'boolean') {
      return createResponse(false, null, '激活状态必须是布尔值', 400)
    }

    // 防止管理员禁用自己
    if (!isActive && userIds.includes(decoded.userId)) {
      return createResponse(false, null, '不能禁用自己的账户', 400)
    }

    // 批量更新
    const updateResult = await prisma.user.updateMany({
      where: {
        id: { in: userIds }
      },
      data: {
        isActive,
        updatedAt: new Date()
      }
    })

    return createResponse(true, {
      updatedCount: updateResult.count,
      isActive
    }, `成功${isActive ? '激活' : '禁用'}${updateResult.count}个用户`, 200)

  } catch (error) {
    console.error('批量更新用户状态失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}
