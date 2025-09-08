// lib/auth.js - 认证工具函数库
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const JWT_EXPIRES_IN = '7d' // Token过期时间

/**
 * 密码加密
 * @param {string} password - 明文密码
 * @returns {Promise<string>} 加密后的密码
 */
export async function hashPassword(password) {
  if (!password) {
    throw new Error('密码不能为空')
  }

  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

/**
 * 验证密码
 * @param {string} password - 明文密码
 * @param {string} hashedPassword - 加密的密码
 * @returns {Promise<boolean>} 是否匹配
 */
export async function verifyPassword(password, hashedPassword) {
  if (!password || !hashedPassword) {
    return false
  }

  return await bcrypt.compare(password, hashedPassword)
}

/**
 * 生成JWT Token
 * @param {Object} payload - Token负载数据
 * @returns {string} JWT Token
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * 验证JWT Token
 * @param {string} token - JWT Token
 * @returns {Object|null} 解码后的数据或null
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error('Token验证失败:', error.message)
    return null
  }
}

/**
 * 从请求中提取Token
 * @param {Request} request - Next.js请求对象
 * @returns {string|null} Token或null
 */
export function extractTokenFromRequest(request) {
  // 从Authorization header提取
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // 从Cookie提取
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(c => c.split('='))
    )
    return cookies.token || null
  }

  return null
}

/**
 * 验证用户权限
 * @param {string} userRole - 用户角色
 * @param {string|string[]} requiredRoles - 所需角色
 * @returns {boolean} 是否有权限
 */
export function hasPermission(userRole, requiredRoles) {
  if (!userRole) return false

  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
  return roles.includes(userRole)
}

/**
 * 角色等级检查（admin > staff > guest）
 * @param {string} userRole - 用户角色
 * @param {string} minimumRole - 最低要求角色
 * @returns {boolean} 是否满足等级要求
 */
export function hasRoleLevel(userRole, minimumRole) {
  const roleHierarchy = {
    guest: 1,
    staff: 2,
    admin: 3
  }

  const userLevel = roleHierarchy[userRole] || 0
  const requiredLevel = roleHierarchy[minimumRole] || 0

  return userLevel >= requiredLevel
}

/**
 * 输入验证函数
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: '密码至少需要8位字符' }
  }

  if (!/(?=.*[a-zA-Z])/.test(password)) {
    return { valid: false, message: '密码必须包含字母' }
  }

  return { valid: true }
}

export function validateUsername(username) {
  if (!username || username.length < 3) {
    return { valid: false, message: '用户名至少需要3个字符' }
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字、下划线和连字符' }
  }

  return { valid: true }
}

/**
 * 清理用户数据（移除敏感信息）
 * @param {Object} user - 用户对象
 * @returns {Object} 清理后的用户对象
 */
export function sanitizeUser(user) {
  if (!user) return null

  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}

/**
 * 生成响应格式
 */
export function createResponse(success, data = null, message = '', status = 200) {
  return new Response(
    JSON.stringify({
      success,
      data,
      message,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}

/**
 * 设置Cookie的通用函数
 */
export function createCookieHeader(token, options = {}) {
  const defaultOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7天
    path: '/',
    ...options
  }

  const cookieOptions = Object.entries(defaultOptions)
    .map(([key, value]) => {
      if (typeof value === 'boolean') {
        return value ? key : ''
      }
      return `${key}=${value}`
    })
    .filter(Boolean)
    .join('; ')

  return `token=${token}; ${cookieOptions}`
}
