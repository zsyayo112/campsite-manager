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
              <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                登录
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                注册
              </button>
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
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-200">
              开始使用
            </button>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">用户管理</h3>
            <p className="text-gray-600">
              完善的用户认证和权限管理系统，支持多角色管理
            </p>
          </div>

          {/* 套餐预订 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">套餐预订</h3>
            <p className="text-gray-600">
              灵活的套餐管理和在线预订系统，实时查看可用性
            </p>
          </div>

          {/* 客户信息 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">客户管理</h3>
            <p className="text-gray-600">
              详细的客户信息记录和管理，支持搜索和数据导出
            </p>
          </div>

          {/* 数据统计 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">数据统计</h3>
            <p className="text-gray-600">
              实时数据分析和报表生成，帮助优化营地运营
            </p>
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
              <h4 className="font-semibold text-gray-900 mt-2">项目初始化</h4>
              <p className="text-gray-600 text-sm">Next.js + Tailwind CSS</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600">🚧</div>
              <h4 className="font-semibold text-gray-900 mt-2">开发中</h4>
              <p className="text-gray-600 text-sm">按计划逐步实现功能</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-400">⏳</div>
              <h4 className="font-semibold text-gray-900 mt-2">待开发</h4>
              <p className="text-gray-600 text-sm">更多高级功能</p>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-300">
              © 2024 营地管理系统 - 使用 Next.js 构建
            </p>
            <p className="text-sm text-gray-400 mt-2">
              这是一个学习项目，正在逐步开发中...
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}