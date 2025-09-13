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

export default function GuestsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  // 状态管理
  const [guests, setGuests] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
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
    search: '',
    bookingStatus: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // 检查认证状态和权限
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!user || !['admin', 'staff'].includes(user.role)) {
      router.push('/dashboard')
      return
    }
  }, [isAuthenticated, user, router])

  // 获取客户列表
  const fetchGuests = useCallback(async (page = 1) => {
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

      const response = await fetch(`/api/guests?${searchParams}`, {
        method: 'GET',
        credentials: 'include'
      })

      const data = await safeJsonParse(response)

      if (data.success) {
        setGuests(data.data.guests)
        setPagination(data.data.pagination)
      } else {
        setError(data.message || '获取客户列表失败')
      }
    } catch (error) {
      console.error('获取客户列表失败:', error)
      setError(error.message || '网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.limit])

  // 初次加载
  useEffect(() => {
    if (isAuthenticated && user && ['admin', 'staff'].includes(user.role)) {
      fetchGuests()
    }
  }, [isAuthenticated, user, fetchGuests])

  // 处理筛选变化
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // 应用筛选
  const applyFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchGuests(1)
  }

  // 重置筛选
  const resetFilters = () => {
    setFilters({
      search: '',
      bookingStatus: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchGuests(1)
  }

  // 分页处理
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    fetchGuests(newPage)
  }

  // 导出数据
  const exportData = async (format = 'json') => {
    try {
      setExporting(true)
      
      const searchParams = new URLSearchParams({
        format,
        ...(filters.bookingStatus && { bookingStatus: filters.bookingStatus })
      })

      const response = await fetch(`/api/guests/export?${searchParams}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `guests-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        const data = await safeJsonParse(response)
        if (data.success) {
          const jsonStr = JSON.stringify(data.data.guests, null, 2)
          const blob = new Blob([jsonStr], { type: 'application/json' })
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `guests-export-${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        } else {
          setError(data.message || '导出失败')
        }
      }
    } catch (error) {
      console.error('导出数据失败:', error)
      setError('导出失败，请重试')
    } finally {
      setExporting(false)
    }
  }

  // 状态徽章组件
  const StatusBadge = ({ status }) => {
    const statusInfo = BOOKING_STATUS[status] || { text: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    )
  }

  if (!isAuthenticated || !user || !['admin', 'staff'].includes(user.role)) {
    return null
  }

  return (
    <Layout title="客户信息管理" user={user}>
      {/* 筛选区域 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          <Input
            label="搜索客户"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="搜索姓名、电话或联系人"
          />

          <Select
            label="预订状态"
            value={filters.bookingStatus}
            onChange={(e) => handleFilterChange('bookingStatus', e.target.value)}
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

          <Select
            label="排序方式"
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-')
              handleFilterChange('sortBy', sortBy)
              handleFilterChange('sortOrder', sortOrder)
            }}
            options={[
              { value: 'createdAt-desc', label: '最新创建' },
              { value: 'createdAt-asc', label: '最早创建' },
              { value: 'name-asc', label: '姓名A-Z' },
              { value: 'name-desc', label: '姓名Z-A' },
              { value: 'bookingDate-desc', label: '预订时间' }
            ]}
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
          
          {user?.role === 'admin' && (
            <div className="flex space-x-2">
              <Button
                onClick={() => exportData('json')}
                variant="secondary"
                disabled={exporting}
                loading={exporting}
              >
                导出JSON
              </Button>
              <Button
                onClick={() => exportData('csv')}
                variant="secondary"
                disabled={exporting}
                loading={exporting}
              >
                导出CSV
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 错误提示 */}
      {error && <ErrorMessage error={error} className="mb-6" />}

      {/* 客户列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : guests.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500 text-lg">暂无客户记录</div>
            <p className="text-gray-400 mt-2">当有预订时会自动创建客户记录</p>
          </div>
        ) : (
          <>
            {/* 桌面端表格 */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      客户信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      预订信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      套餐
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      入住时间
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
                  {guests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                        <div className="text-sm text-gray-500">
                          {guest.age && `${guest.age}岁`}
                          {guest.phone && ` • ${guest.phone}`}
                        </div>
                        {guest.emergencyContact && (
                          <div className="text-xs text-gray-400">
                            应急联系: {guest.emergencyContact}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {guest.booking.user.firstName} {guest.booking.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{guest.booking.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {guest.booking.package.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>{guest.booking.checkInFormatted}</div>
                        <div className="text-gray-500">至 {guest.booking.checkOutFormatted}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={guest.booking.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => router.push(`/guests/${guest.id}`)}
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

            {/* 移动端卡片 */}
            <div className="md:hidden">
              {guests.map((guest) => (
                <div key={guest.id} className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-gray-900">
                      {guest.name}
                      {guest.age && <span className="text-gray-500 ml-2">{guest.age}岁</span>}
                    </div>
                    <StatusBadge status={guest.booking.status} />
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {guest.booking.user.firstName} {guest.booking.user.lastName} • {guest.booking.package.name}
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    {guest.booking.checkInFormatted} - {guest.booking.checkOutFormatted}
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => router.push(`/guests/${guest.id}`)}
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