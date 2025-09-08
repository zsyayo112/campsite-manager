'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button, LoadingSpinner } from '../../../components/ui/FormComponents'
import { useAuth } from '../../contexts/AuthContext'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 认证检查
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // 登出处理
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('登出失败:', error)
      router.push('/login')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  // 根据用户角色渲染不同的仪表盘
  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard user={user} currentTime={currentTime} />
      case 'staff':
        return <StaffDashboard user={user} currentTime={currentTime} />
      case 'guest':
        return <GuestDashboard user={user} currentTime={currentTime} />
      default:
        return <GuestDashboard user={user} currentTime={currentTime} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">🏕️</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">营地管理系统</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {currentTime.toLocaleString('zh-CN')}
              </div>
              <div className="text-sm text-gray-600">
                欢迎，{user?.firstName || user?.username || '用户'}
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {user?.role === 'admin' ? '管理员' : user?.role === 'staff' ? '员工' : '客户'}
                </span>
              </div>
              <Button onClick={handleLogout} variant="secondary" size="sm">
                登出
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* 渲染对应角色的仪表盘 */}
      {renderDashboard()}
    </div>
  )
}

// 管理员仪表盘
function AdminDashboard({ user, currentTime }) {
  const router = useRouter()

  const stats = {
    totalSites: 45,
    occupiedSites: 32,
    availableSites: 13,
    todayCheckins: 8,
    todayCheckouts: 5,
    totalRevenue: 25680,
    monthlyRevenue: 156780,
    totalStaff: 12,
    totalGuests: 156
  }

  const quickActions = [
    { title: '员工管理', icon: '👥', action: () => router.push('/admin/staff'), color: 'bg-blue-500' },
    { title: '系统设置', icon: '⚙️', action: () => router.push('/admin/settings'), color: 'bg-gray-500' },
    { title: '财务报表', icon: '📊', action: () => router.push('/admin/reports'), color: 'bg-green-500' },
    { title: '营地管理', icon: '🏕️', action: () => router.push('/admin/sites'), color: 'bg-purple-500' }
  ]

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            管理员控制台
          </h2>
          <p className="text-gray-600">系统总览和管理功能</p>
        </div>

        {/* 管理员统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">🏕️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">营地总数</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalSites}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">💰</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">月收入</dt>
                    <dd className="text-lg font-medium text-gray-900">¥{stats.monthlyRevenue.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">员工总数</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalStaff}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">🎪</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">注册客户</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalGuests}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 管理员快速操作 */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">管理功能</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} hover:opacity-90 text-white p-4 rounded-lg flex flex-col items-center justify-center transition-opacity`}
              >
                <span className="text-2xl mb-2">{action.icon}</span>
                <span className="text-sm font-medium">{action.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

// 员工仪表盘
function StaffDashboard({ user, currentTime }) {
  const router = useRouter()

  const stats = {
    todayCheckins: 8,
    todayCheckouts: 5,
    availableSites: 13,
    pendingBookings: 6
  }

  const quickActions = [
    { title: '新增预订', icon: '📅', action: () => router.push('/bookings/new'), color: 'bg-blue-500' },
    { title: '营地状态', icon: '🗺️', action: () => router.push('/sites'), color: 'bg-green-500' },
    { title: '入住登记', icon: '✅', action: () => router.push('/checkin'), color: 'bg-purple-500' },
    { title: '退房处理', icon: '📤', action: () => router.push('/checkout'), color: 'bg-orange-500' }
  ]

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            员工工作台
          </h2>
          <p className="text-gray-600">今日工作概览和快速操作</p>
        </div>

        {/* 员工统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">✅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">今日入住</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.todayCheckins}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">📤</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">今日退房</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.todayCheckouts}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">🏕️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">可用营地</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.availableSites}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">⏳</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">待处理</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pendingBookings}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 员工快速操作 */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">快速操作</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} hover:opacity-90 text-white p-4 rounded-lg flex flex-col items-center justify-center transition-opacity`}
              >
                <span className="text-2xl mb-2">{action.icon}</span>
                <span className="text-sm font-medium">{action.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

// 客户仪表盘
function GuestDashboard({ user, currentTime }) {
  const router = useRouter()

  // 模拟客户的预订数据
  const userBookings = [
    { id: 1, siteNumber: 'A-12', checkIn: '2025-09-15', checkOut: '2025-09-17', status: '已确认' },
    { id: 2, siteNumber: 'B-05', checkIn: '2025-10-02', checkOut: '2025-10-04', status: '待付款' }
  ]

  const quickActions = [
    { title: '新预订', icon: '📅', action: () => router.push('/book'), color: 'bg-blue-500' },
    { title: '我的预订', icon: '📋', action: () => router.push('/my-bookings'), color: 'bg-green-500' },
    { title: '个人资料', icon: '👤', action: () => router.push('/profile'), color: 'bg-purple-500' },
    { title: '营地介绍', icon: '🏕️', action: () => router.push('/sites/info'), color: 'bg-orange-500' }
  ]

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            欢迎回来，{user.firstName || user.username}！
          </h2>
          <p className="text-gray-600">管理您的营地预订和个人信息</p>
        </div>

        {/* 客户快速操作 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">快速操作</h3>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} hover:opacity-90 text-white p-4 rounded-lg flex flex-col items-center justify-center transition-opacity`}
                >
                  <span className="text-2xl mb-2">{action.icon}</span>
                  <span className="text-sm font-medium">{action.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">账户信息</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">用户名</span>
                <span className="text-sm font-medium">{user.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">邮箱</span>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">注册时间</span>
                <span className="text-sm font-medium">
                  {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">预订总数</span>
                <span className="text-sm font-medium">{userBookings.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 我的预订 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">我的预订</h3>
          </div>
          {userBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">营地编号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入住日期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">退房日期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.siteNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.checkIn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.checkOut}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === '已确认' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-indigo-600 hover:text-indigo-900">查看详情</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">您还没有任何预订</p>
              <button
                onClick={() => router.push('/book')}
                className="mt-4 text-indigo-600 hover:text-indigo-900 font-medium"
              >
                立即预订 →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
