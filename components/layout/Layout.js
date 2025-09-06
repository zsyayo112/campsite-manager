'use client'

import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout({
  children,
  title = '营地管理系统',
  user = null,
  showSidebar = true,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 检测屏幕尺寸
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
      // 桌面端默认显示侧边栏，移动端默认隐藏
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false) // 桌面端不需要覆盖模式
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // 切换侧边栏
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // 关闭侧边栏
  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <Navbar onMenuToggle={toggleSidebar} user={user} />

      <div className="flex h-[calc(100vh-4rem)]">
        {' '}
        {/* 减去导航栏高度 */}
        {/* 侧边栏 */}
        {showSidebar && <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />}
        {/* 主内容区域 */}
        <main
          className={`
          flex-1 overflow-auto
          ${showSidebar ? 'lg:ml-0' : ''}
        `}
        >
          {/* 内容容器 */}
          <div className="p-4 lg:p-6">
            {/* 页面标题区域 */}
            {title && (
              <div className="mb-6">
                <div className="sm:flex sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                      {title}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                      {getPageDescription(title)}
                    </p>
                  </div>

                  {/* 页面操作按钮区域 */}
                  <div className="mt-4 sm:mt-0">{getPageActions(title)}</div>
                </div>
              </div>
            )}

            {/* 页面内容 */}
            <div className="space-y-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}

// 根据页面标题获取描述
function getPageDescription(title) {
  const descriptions = {
    仪表板: '查看营地运营概况和关键指标',
    套餐管理: '管理营地套餐和价格配置',
    预订管理: '处理客户预订和入住安排',
    客户管理: '管理客户信息和联系记录',
    财务管理: '查看收入统计和财务报表',
    统计报表: '生成和查看各类数据报表',
    系统设置: '配置系统参数和权限设置',
    营地管理系统: '专业的营地客人信息管理平台',
  }
  return descriptions[title] || '管理您的营地业务'
}

// 根据页面标题获取操作按钮
function getPageActions(title) {
  const actions = {
    套餐管理: (
      <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
        <svg
          className="-ml-1 mr-2 h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        添加套餐
      </button>
    ),
    预订管理: (
      <div className="flex space-x-3">
        <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
          <svg
            className="-ml-1 mr-2 h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          筛选
        </button>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          新建预订
        </button>
      </div>
    ),
    客户管理: (
      <div className="flex space-x-3">
        <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
          <svg
            className="-ml-1 mr-2 h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          导出数据
        </button>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200">
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          添加客户
        </button>
      </div>
    ),
  }
  return actions[title] || null
}

// 导出一个简化版本，用于不需要侧边栏的页面
export function SimpleLayout({ children, title, className = '' }) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {title && (
          <div className="text-center mb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {title}
            </h1>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
