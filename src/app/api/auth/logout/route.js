// src/app/api/auth/logout/route.js - 用户登出API
import { createResponse } from '../../../../../lib/auth'

export async function POST(request) {
  try {
    // 创建响应
    const response = createResponse(true, null, '登出成功', 200)

    // 清除Cookie - 设置过期时间为过去的时间
    response.headers.set('Set-Cookie',
      'token=; HttpOnly; Secure; SameSite=lax; Path=/; Max-Age=0'
    )

    return response

  } catch (error) {
    console.error('登出失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}

// 支持GET请求（用于某些客户端）
export async function GET(request) {
  return POST(request)
}
