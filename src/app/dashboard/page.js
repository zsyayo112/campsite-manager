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
  const [stats, setStats] = useState({
    totalPackages: 0,
    totalBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalStaff: 0,
    totalGuests: 0,
    todayCheckins: 0,
    todayCheckouts: 0,
    pendingBookings: 0
  })
  const [loading, setLoading] = useState(true)

  // 获取管理员统计数据
  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true)
        
        // 获取套餐数据
        const packagesResponse = await fetch('/api/packages', { credentials: 'include' })
        const packagesData = await packagesResponse.json()
        
        // 获取预订数据
        const bookingsResponse = await fetch('/api/bookings', { credentials: 'include' })
        const bookingsData = await bookingsResponse.json()
        
        // 获取客户数据
        const guestsResponse = await fetch('/api/guests', { credentials: 'include' })
        const guestsData = await guestsResponse.json()

        if (packagesData.success && bookingsData.success && guestsData.success) {
          const packages = packagesData.data.packages || []
          const bookings = bookingsData.data.bookings || []
          const guests = guestsData.data.guests || []
          
          // 计算统计数据
          const now = new Date()
          const today = now.toDateString()
          const currentMonth = now.getMonth()
          const currentYear = now.getFullYear()
          
          const totalRevenue = bookings.reduce((sum, booking) => 
            ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'].includes(booking.status) 
              ? sum + booking.totalPrice 
              : sum, 0
          )
          
          const monthlyRevenue = bookings
            .filter(booking => {
              const bookingDate = new Date(booking.createdAt)
              return bookingDate.getMonth() === currentMonth && 
                     bookingDate.getFullYear() === currentYear &&
                     ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'].includes(booking.status)
            })
            .reduce((sum, booking) => sum + booking.totalPrice, 0)
          
          const todayCheckins = bookings.filter(booking => 
            new Date(booking.checkIn).toDateString() === today && 
            booking.status === 'CONFIRMED'
          ).length
          
          const todayCheckouts = bookings.filter(booking => 
            new Date(booking.checkOut).toDateString() === today &&
            booking.status === 'CHECKED_IN'
          ).length
          
          const pendingBookings = bookings.filter(booking => 
            booking.status === 'PENDING'
          ).length

          setStats({
            totalPackages: packages.length,
            totalBookings: bookings.length,
            totalRevenue,
            monthlyRevenue,
            totalStaff: 12, // 模拟数据，可以后续从用户API获取
            totalGuests: guests.length,
            todayCheckins,
            todayCheckouts,
            pendingBookings
          })
        }
      } catch (error) {
        console.error('获取管理员统计数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminStats()
  }, [])

  const quickActions = [
    { 
      title: '套餐管理', 
      icon: '🏕️', 
      action: () => router.push('/packages'), 
      color: 'bg-blue-500',
      description: '管理营地套餐'
    },
    { 
      title: '预订管理', 
      icon: '📅', 
      action: () => router.push('/bookings'), 
      color: 'bg-green-500',
      description: '处理客户预订'
    },
    { 
      title: '客户管理', 
      icon: '👥', 
      action: () => router.push('/guests'), 
      color: 'bg-purple-500',
      description: '管理客户信息'
    },
    { 
      title: '数据导出', 
      icon: '📊', 
      action: () => router.push('/guests'), 
      color: 'bg-orange-500',
      description: '导出业务数据'
    }
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount / 100) // 假设金额以分为单位存储
  }

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            管理员控制台
          </h2>
          <p className="text-gray-600">系统总览和管理功能</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
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
                        <dt className="text-sm font-medium text-gray-500">套餐总数</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalPackages}</dd>
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
                        <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.monthlyRevenue)}</dd>
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
                        <span className="text-white text-sm">📋</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500">总预订</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalBookings}</dd>
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

            {/* 今日概览 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

            {/* 管理员快速操作 */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">管理功能</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`${action.color} hover:opacity-90 text-white p-4 rounded-lg transition-opacity group`}
                  >
                    <div className="text-center">
                      <span className="text-2xl mb-2 block">{action.icon}</span>
                      <span className="text-sm font-medium block">{action.title}</span>
                      <span className="text-xs opacity-90 block mt-1">{action.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 收入概览 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">收入概览</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">总收入</h4>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">本月收入</h4>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.monthlyRevenue)}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

// 员工仪表盘
function StaffDashboard({ user, currentTime }) {
  const router = useRouter()
  const [stats, setStats] = useState({
    todayCheckins: 0,
    todayCheckouts: 0,
    pendingBookings: 0,
    totalBookingsToday: 0,
    availablePackages: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // 获取员工统计数据
  useEffect(() => {
    const fetchStaffStats = async () => {
      try {
        setLoading(true)
        
        // 获取预订数据
        const bookingsResponse = await fetch('/api/bookings?limit=20', { credentials: 'include' })
        const bookingsData = await bookingsResponse.json()
        
        // 获取套餐数据
        const packagesResponse = await fetch('/api/packages?status=ACTIVE', { credentials: 'include' })
        const packagesData = await packagesResponse.json()

        if (bookingsData.success && packagesData.success) {
          const bookings = bookingsData.data.bookings || []
          const packages = packagesData.data.packages || []
          
          // 计算统计数据
          const now = new Date()
          const today = now.toDateString()
          
          const todayCheckins = bookings.filter(booking => 
            new Date(booking.checkIn).toDateString() === today && 
            booking.status === 'CONFIRMED'
          ).length
          
          const todayCheckouts = bookings.filter(booking => 
            new Date(booking.checkOut).toDateString() === today &&
            booking.status === 'CHECKED_IN'
          ).length
          
          const pendingBookings = bookings.filter(booking => 
            booking.status === 'PENDING'
          ).length

          const totalBookingsToday = bookings.filter(booking => 
            new Date(booking.createdAt).toDateString() === today
          ).length

          setStats({
            todayCheckins,
            todayCheckouts,
            pendingBookings,
            totalBookingsToday,
            availablePackages: packages.length
          })
          
          // 设置最近预订（最近5个待处理的）
          const recentPending = bookings
            .filter(booking => booking.status === 'PENDING')
            .slice(0, 5)
          setRecentBookings(recentPending)
        }
      } catch (error) {
        console.error('获取员工统计数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStaffStats()
  }, [])

  const quickActions = [
    { 
      title: '新增预订', 
      icon: '📅', 
      action: () => router.push('/bookings/new'), 
      color: 'bg-blue-500',
      description: '为客户创建预订'
    },
    { 
      title: '预订管理', 
      icon: '📋', 
      action: () => router.push('/bookings'), 
      color: 'bg-green-500',
      description: '管理所有预订'
    },
    { 
      title: '客户管理', 
      icon: '👥', 
      action: () => router.push('/guests'), 
      color: 'bg-purple-500',
      description: '查看客户信息'
    },
    { 
      title: '套餐管理', 
      icon: '🏕️', 
      action: () => router.push('/packages'), 
      color: 'bg-orange-500',
      description: '查看套餐信息'
    }
  ]

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { text: '待确认', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { text: '已确认', color: 'bg-blue-100 text-blue-800' },
      CHECKED_IN: { text: '已入住', color: 'bg-green-100 text-green-800' },
      CHECKED_OUT: { text: '已退房', color: 'bg-gray-100 text-gray-800' },
      CANCELLED: { text: '已取消', color: 'bg-red-100 text-red-800' },
      REFUNDED: { text: '已退款', color: 'bg-purple-100 text-purple-800' }
    }
    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    })
  }

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            员工工作台
          </h2>
          <p className="text-gray-600">今日工作概览和快速操作</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* 员工统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-sm">📋</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500">今日预订</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.totalBookingsToday}</dd>
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
                        <dt className="text-sm font-medium text-gray-500">可用套餐</dt>
                        <dd className="text-lg font-medium text-gray-900">{stats.availablePackages}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 主要内容区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* 员工快速操作 */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">快速操作</h3>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`${action.color} hover:opacity-90 text-white p-4 rounded-lg transition-opacity group`}
                    >
                      <div className="text-center">
                        <span className="text-2xl mb-2 block">{action.icon}</span>
                        <span className="text-sm font-medium block">{action.title}</span>
                        <span className="text-xs opacity-90 block mt-1">{action.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 今日任务提醒 */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">今日任务</h3>
                <div className="space-y-3">
                  {stats.todayCheckins > 0 && (
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-sm">✅</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          今日有 {stats.todayCheckins} 位客人需要办理入住
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {stats.todayCheckouts > 0 && (
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm">📤</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-800">
                          今日有 {stats.todayCheckouts} 位客人需要办理退房
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {stats.pendingBookings > 0 && (
                    <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-yellow-600 text-sm">⏳</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-yellow-800">
                          有 {stats.pendingBookings} 个预订等待确认
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {stats.todayCheckins === 0 && stats.todayCheckouts === 0 && stats.pendingBookings === 0 && (
                    <div className="text-center py-4">
                      <div className="text-gray-400 text-3xl mb-2">✨</div>
                      <p className="text-gray-500 text-sm">今日暂无紧急任务</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 待处理预订 */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">待处理预订</h3>
                <button
                  onClick={() => router.push('/bookings?status=PENDING')}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  查看全部 →
                </button>
              </div>
              
              {recentBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">确认码</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">客户</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">套餐</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入住日期</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {booking.confirmationCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.user?.firstName && booking.user?.lastName 
                              ? `${booking.user.firstName} ${booking.user.lastName}`
                              : booking.user?.username || '未知客户'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.package?.name || '未知套餐'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(booking.checkIn)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(booking.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button 
                              onClick={() => router.push(`/bookings/${booking.id}`)}
                              className="text-green-600 hover:text-green-900"
                            >
                              处理
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="text-gray-400 text-4xl mb-4">🎉</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">所有预订都已处理完毕</h4>
                  <p className="text-gray-500 mb-6">暂无待处理的预订</p>
                  <button
                    onClick={() => router.push('/bookings/new')}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    创建新预订
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

// 客户仪表盘
function GuestDashboard({ user, currentTime }) {
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    completedBookings: 0,
    upcomingBookings: 0
  })

  // 获取用户预订数据
  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/bookings', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            const userBookings = data.data.bookings || []
            setBookings(userBookings.slice(0, 5)) // 只显示最近5个预订
            
            // 计算统计数据
            const now = new Date()
            const stats = {
              totalBookings: userBookings.length,
              activeBookings: userBookings.filter(b => 
                ['CONFIRMED', 'CHECKED_IN'].includes(b.status)
              ).length,
              completedBookings: userBookings.filter(b => 
                ['CHECKED_OUT', 'REFUNDED'].includes(b.status)
              ).length,
              upcomingBookings: userBookings.filter(b => 
                new Date(b.checkIn) > now && b.status !== 'CANCELLED'
              ).length
            }
            setStats(stats)
          }
        }
      } catch (error) {
        console.error('获取预订数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserBookings()
  }, [])

  const quickActions = [
    { 
      title: '新预订', 
      icon: '📅', 
      action: () => router.push('/packages'), 
      color: 'bg-blue-500',
      description: '浏览套餐并预订'
    },
    { 
      title: '我的预订', 
      icon: '📋', 
      action: () => router.push('/bookings'), 
      color: 'bg-green-500',
      description: '查看预订历史'
    },
    { 
      title: '个人资料', 
      icon: '👤', 
      action: () => router.push('/profile'), 
      color: 'bg-purple-500',
      description: '管理个人信息'
    },
    { 
      title: '套餐介绍', 
      icon: '🏕️', 
      action: () => router.push('/packages'), 
      color: 'bg-orange-500',
      description: '了解更多套餐'
    }
  ]

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { text: '待确认', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { text: '已确认', color: 'bg-blue-100 text-blue-800' },
      CHECKED_IN: { text: '已入住', color: 'bg-green-100 text-green-800' },
      CHECKED_OUT: { text: '已退房', color: 'bg-gray-100 text-gray-800' },
      CANCELLED: { text: '已取消', color: 'bg-red-100 text-red-800' },
      REFUNDED: { text: '已退款', color: 'bg-purple-100 text-purple-800' }
    }
    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    })
  }

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            欢迎回来，{user.firstName || user.username}！
          </h2>
          <p className="text-gray-600">管理您的营地预订和个人信息</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm">📋</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">总预订数</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalBookings}</dd>
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
                    <span className="text-white text-sm">✅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">活跃预订</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activeBookings}</dd>
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
                    <span className="text-white text-sm">🏁</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">已完成</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.completedBookings}</dd>
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
                    <span className="text-white text-sm">🔜</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">即将到来</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.upcomingBookings}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 快速操作 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">快速操作</h3>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} hover:opacity-90 text-white p-4 rounded-lg transition-opacity group`}
                >
                  <div className="text-center">
                    <span className="text-2xl mb-2 block">{action.icon}</span>
                    <span className="text-sm font-medium block">{action.title}</span>
                    <span className="text-xs opacity-90 block mt-1">{action.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 账户信息 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">账户信息</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">用户名</span>
                <span className="text-sm font-medium">{user.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">姓名</span>
                <span className="text-sm font-medium">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : '未设置'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">邮箱</span>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">电话</span>
                  <span className="text-sm font-medium">{user.phone}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">注册时间</span>
                <span className="text-sm font-medium">
                  {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <button 
                  onClick={() => router.push('/profile')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  编辑个人信息
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 最近预订 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">最近预订</h3>
            <button
              onClick={() => router.push('/bookings')}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              查看全部 →
            </button>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <LoadingSpinner size="md" />
              <p className="text-gray-500 mt-2">加载中...</p>
            </div>
          ) : bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">确认码</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">套餐</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">入住日期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.confirmationCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.package?.name || '未知套餐'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          onClick={() => router.push(`/bookings/${booking.id}`)}
                          className="text-green-600 hover:text-green-900"
                        >
                          查看详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-4xl mb-4">🏕️</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">还没有预订记录</h4>
              <p className="text-gray-500 mb-6">开始您的第一次营地体验吧！</p>
              <div className="space-x-4">
                <button
                  onClick={() => router.push('/packages')}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  浏览套餐
                </button>
                <button
                  onClick={() => router.push('/bookings/new')}
                  className="border border-green-600 text-green-600 hover:bg-green-50 font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  立即预订
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
