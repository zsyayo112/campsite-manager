import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* 顶部导航区域 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                🏕️ 营地管理系统
              </h1>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                注册
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 欢迎区域 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            欢迎来到
            <span className="text-green-600 block">营地管理系统</span>
          </h2>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600">
            专业的营地客人信息管理平台，让营地运营更简单、更高效
          </p>
          <div className="mt-10 flex justify-center space-x-6">
            <Link
              href="/dashboard"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-200"
            >
              进入系统
            </Link>
            <button className="border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold py-3 px-8 rounded-lg text-lg transition duration-200">
              了解更多
            </button>
          </div>
        </div>

        {/* 功能特性区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 用户管理 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              用户管理
            </h3>
            <p className="text-gray-600">
              完善的用户认证和权限管理系统，支持多角色管理
            </p>
          </div>

          {/* 套餐预订 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              套餐预订
            </h3>
            <p className="text-gray-600">
              灵活的套餐管理和在线预订系统，实时查看可用性
            </p>
          </div>

          {/* 客户信息 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              客户管理
            </h3>
            <p className="text-gray-600">
              详细的客户信息记录和管理，支持搜索和数据导出
            </p>
          </div>

          {/* 数据统计 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              数据统计
            </h3>
            <p className="text-gray-600">
              实时数据分析和报表生成，帮助优化营地运营
            </p>
          </div>
        </div>

        {/* 系统特色 */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900">
              为什么选择我们？
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              专为营地行业定制的管理解决方案
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-6">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                快速部署
              </h4>
              <p className="text-gray-600">
                基于现代技术栈，快速部署上线，零维护成本，专注业务发展
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-6">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                安全可靠
              </h4>
              <p className="text-gray-600">
                企业级安全保障，数据加密存储，多重备份，保护您的业务数据
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-6">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                智能分析
              </h4>
              <p className="text-gray-600">
                数据驱动决策，智能报表分析，帮助您洞察业务趋势和机会
              </p>
            </div>
          </div>
        </div>

        {/* 状态信息 */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            项目开发状态
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">✅</div>
              <h4 className="font-semibold text-gray-900 mt-2">布局系统完成</h4>
              <p className="text-gray-600 text-sm">响应式布局 + 组件系统</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600">🚧</div>
              <h4 className="font-semibold text-gray-900 mt-2">功能开发中</h4>
              <p className="text-gray-600 text-sm">核心业务功能逐步实现</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-400">⏳</div>
              <h4 className="font-semibold text-gray-900 mt-2">高级功能</h4>
              <p className="text-gray-600 text-sm">数据分析和智能推荐</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
            >
              体验演示系统
              <svg
                className="ml-2 -mr-1 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">🏕️</span>
                </div>
                <h3 className="text-xl font-bold">营地管理系统</h3>
              </div>
              <p className="text-gray-300 mb-4">
                专业的营地客人信息管理平台，让营地运营更简单、更高效。
              </p>
              <p className="text-sm text-gray-400">
                技术栈：Next.js, React, Tailwind CSS, Prisma
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">功能模块</h4>
              <ul className="space-y-2 text-gray-300">
                <li>客户管理</li>
                <li>预订管理</li>
                <li>套餐管理</li>
                <li>财务统计</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">技术支持</h4>
              <ul className="space-y-2 text-gray-300">
                <li>在线文档</li>
                <li>视频教程</li>
                <li>技术支持</li>
                <li>社区论坛</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 营地管理系统 - 学习项目，持续开发中
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
