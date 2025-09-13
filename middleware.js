import { NextResponse } from 'next/server'

export function middleware(request) {
  // 获取路径
  const { pathname } = request.nextUrl

  // 获取认证token
  const token = request.cookies.get('auth-token')?.value

  // 定义需要认证的路径
  const protectedPaths = [
    '/dashboard',
    '/bookings',
    '/packages/add',
    '/packages/edit',
    '/guests',
    '/profile'
  ]

  // 定义管理员专用路径
  const adminPaths = [
    '/packages/add',
    '/guests'
  ]

  // 定义员工和管理员路径
  const staffPaths = [
    '/guests'
  ]

  // 检查是否是受保护的路径
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  )

  // 如果是受保护的路径但没有token，重定向到登录页
  if (isProtectedPath && !token) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 如果有token，验证权限（这里简化处理，实际应该解码JWT）
  if (token && isProtectedPath) {
    try {
      // 在实际应用中，这里应该解码JWT并检查用户角色
      // 现在我们简化处理，只做基本的路径保护
      
      // 检查管理员路径
      const isAdminPath = adminPaths.some(path => 
        pathname.startsWith(path)
      )

      // 检查员工路径
      const isStaffPath = staffPaths.some(path => 
        pathname.startsWith(path)
      )

      // 这里应该根据JWT中的角色信息进行更精确的权限控制
      // 现在先允许通过，实际权限检查在API层面进行
    } catch (error) {
      // Token无效，清除并重定向到登录页
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth-token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - api routes (api/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)',
  ],
}