'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import Layout from '../../../components/layout/Layout'
import { Button, ErrorMessage, Input, LoadingSpinner, Select } from '../../../components/ui/FormComponents'
import { useAuth } from '../../contexts/AuthContext'

// 预订状态映射
const BOOKING_STATUS = {
  PENDING: { text: '待确认', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { text: '已确认', color: 'bg-blue-100 text-blue-800' },
  CHECKED_IN: { text: '已入住', color: 'bg-green-100 text-green-800' },
  CHECKED_OUT: { text: '已退房', color: 'bg-gray-100 text-gray-800' },
  CANCELLED: { text: '已取消', color: 'bg-red-100 text-red-800' },
  REFUNDED: { text: '已退款', color: 'bg-purple-100 text-purple-800' }
}

// 安全的 JSON 解析函数
const safeJsonParse = async (response) => {
  try {
    const text = await response.text()
    if (!text) throw new Error('Empty response')
    return JSON.parse(text)
  } catch (error) {
    console.error('JSON 解析错误:', error)
    throw new Error('服务器响应格式错误')
  }
}

export default function BookingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth()

  // 状态管理
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  // 筛选状态
  const [filters, setFilters] = useState({
    status: '',
    confirmationCode: '',
    packageId: '',
    checkInFrom: '',
    checkInTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // 检查认证状态 - 只有在非加载状态下才重定向
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent('/bookings'))
      return
    }
  }, [isAuthenticated, isLoading, router])

  // 初始化认证检查
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      checkAuth()
    }
  }, [checkAuth, isAuthenticated, isLoading])

  // 获取预订列表
  const fetchBookings = useCallback(async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      })

      // 移除空值
      Object.keys(filters).forEach(key => {
        if (!filters[key]) {
          searchParams.delete(key)
        }
      })

      const response = await fetch(`/api/bookings?${searchParams}`, {
        method: 'GET',
        credentials: 'include'
      })

      const data = await safeJsonParse(response)

      if (data.success) {
        setBookings(data.data.bookings)
        setPagination(data.data.pagination)
      } else {
        setError(data.message || '获取预订列表失败')
      }
    } catch (error) {
      console.error('获取预订列表失败:', error)
      setError(error.message || '网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.limit])

  // 初次加载
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings()
    }
  }, [isAuthenticated, fetchBookings])

  // 处理筛选变化
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // 应用筛选
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchBookings(1)
  }

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      status: '',
      confirmationCode: '',
      packageId: '',
      checkInFrom: '',
      checkInTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchBookings(1)
  }

  // 分页处理
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    fetchBookings(newPage)
  }

  // 状态更新
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      })

      const data = await safeJsonParse(response)

      if (data.success) {
        // 重新获取列表
        fetchBookings(pagination.page)
      } else {
        setError(data.message || '更新状态失败')
      }
    } catch (error) {
      console.error('更新预订状态失败:', error)
      setError('网络错误，请重试')
    }
  }

  // 预订状态徽章组件
  const StatusBadge = ({ status }) => {
    const statusInfo = BOOKING_STATUS[status] || { text: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    )
  }

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Layout title="预订管理" user={user}>
      {/* 筛选区域 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Select
            label="预订状态"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            options={[
              { value: '', label: '全部状态' },
              { value: 'PENDING', label: '待确认' },
              { value: 'CONFIRMED', label: '已确认' },
              { value: 'CHECKED_IN', label: '已入住' },
              { value: 'CHECKED_OUT', label: '已退房' },
              { value: 'CANCELLED', label: '已取消' },
              { value: 'REFUNDED', label: '已退款' }
            ]}
          />

          <Input
            label="确认码"
            value={filters.confirmationCode}
            onChange={(e) => handleFilterChange('confirmationCode', e.target.value)}
            placeholder="输入确认码搜索"
          />

          <Input
            label="入住日期从"
            type="date"
            value={filters.checkInFrom}
            onChange={(e) => handleFilterChange('checkInFrom', e.target.value)}
          />

          <Input
            label="入住日期到"
            type="date"
            value={filters.checkInTo}
            onChange={(e) => handleFilterChange('checkInTo', e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            <Button onClick={applyFilters} variant="primary">
              应用筛选
            </Button>
            <Button onClick={resetFilters} variant="secondary">
              重置
            </Button>
          </div>
          <Button
            onClick={() => router.push('/bookings/new')}
            variant="primary"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            新建预订
          </Button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && <ErrorMessage error={error} className="mb-6" />}

      {/* 预订列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500 text-lg">暂无预订记录</div>
            <span className="text-sm text-gray-600 mb-2">
              点击&quot;新建预订&quot;创建第一个预订
            </span>
          </div>
        ) : (
          <>
            {/* 桌面端表格 */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      确认码
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      客户信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      套餐
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      入住时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      客人数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      总价
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.confirmationCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.user.firstName} {booking.user.lastName}</div>
                        <div className="text-sm text-gray-500">{booking.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.package.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{formatDate(booking.checkIn)}</div>
                        <div className="text-gray-500">至 {formatDate(booking.checkOut)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.guestCount}人
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.totalPriceFormatted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/bookings/${booking.id}`)}
                            className="text-green-600 hover:text-green-900"
                          >
                            查看
                          </button>
                          {(user?.role === 'admin' || user?.role === 'staff') && booking.status === 'PENDING' && (
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              确认
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 移动端卡片 */}
            <div className="md:hidden">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.confirmationCode}
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {booking.user.firstName} {booking.user.lastName} • {booking.package.name}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)} • {booking.guestCount}人
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.totalPriceFormatted}
                    </div>
                    <button
                      onClick={() => router.push(`/bookings/${booking.id}`)}
                      className="text-green-600 hover:text-green-900 text-sm"
                    >
                      查看详情
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="secondary"
                    disabled={!pagination.hasPrev}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={!pagination.hasNext}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    下一页
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      显示第 <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> 到{' '}
                      <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                      </span>{' '}
                      条，共 <span className="font-medium">{pagination.total}</span> 条记录
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={!pagination.hasPrev}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className="rounded-l-md"
                      >
                        上一页
                      </Button>

                      {/* 页码 */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = i + 1
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === pagination.page
                                ? 'z-10 bg-green-50 border-green-500 text-green-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}

                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={!pagination.hasNext}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className="rounded-r-md"
                      >
                        下一页
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
