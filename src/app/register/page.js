import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* 头部 */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">🏕️</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            创建新账户
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            加入营地管理系统
          </p>
        </div>

        {/* 注册表单 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <form className="space-y-6" action="#" method="POST">
            
            {/* 用户名输入 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                placeholder="请输入用户名"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 transition-colors duration-200"
              />
            </div>

            {/* 邮箱输入 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="请输入您的邮箱"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 transition-colors duration-200"
              />
            </div>

            {/* 角色选择 */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                账户类型
              </label>
              <select
                id="role"
                name="role"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 transition-colors duration-200"
              >
                <option value="">请选择账户类型</option>
                <option value="admin">系统管理员</option>
                <option value="staff">营地员工</option>
                <option value="customer">客户</option>
              </select>
            </div>

            {/* 密码输入 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="请输入密码（至少8位）"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 transition-colors duration-200"
              />
            </div>

            {/* 确认密码 */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                确认密码
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="请再次输入密码"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 transition-colors duration-200"
              />
            </div>

            {/* 协议同意 */}
            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700">
                我同意{' '}
                <a href="#" className="font-medium text-green-600 hover:text-green-500">
                  服务条款
                </a>
                {' '}和{' '}
                <a href="#" className="font-medium text-green-600 hover:text-green-500">
                  隐私政策
                </a>
              </label>
            </div>

            {/* 注册按钮 */}
            <div>
              <Link 
                href="/dashboard"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                创建账户
              </Link>
            </div>

            {/* 分割线 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或者</span>
              </div>
            </div>

            {/* 演示注册 */}
            <div>
              <Link 
                href="/dashboard"
                className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                快速体验（跳过注册）
              </Link>
            </div>
          </form>

          {/* 登录链接 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              已有账户？{' '}
              <Link href="/login" className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200">
                立即登录
              </Link>
            </p>
          </div>
        </div>

        {/* 返回首页 */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
            ← 返回首页
          </Link>
        </div>

        {/* 注册须知 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 14.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="text-sm text-yellow-800 font-medium">注册须知</p>
              <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                <li>• 管理员账户拥有所有系统权限</li>
                <li>• 员工账户可以管理预订和客户信息</li>
                <li>• 客户账户仅可查看自己的预订信息</li>
                <li>• 系统正在开发中，注册功能暂未完全实现</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}