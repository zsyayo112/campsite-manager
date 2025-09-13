'use client'

import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import Layout from '../../../../components/layout/Layout'
import { Button, ErrorMessage, LoadingSpinner, Modal } from '../../../../components/ui/FormComponents'
import { useAuth } from '../../../contexts/AuthContext'

// 预订状态映射
const BOOKING_STATUS = {
  PENDING: { text: '待确认', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { text: '已确认', color: 'bg-blue-100 text-blue-800' },
  CHECKED_IN: { text: '已入住', color: 'bg-green-100 text-green-800' },
  CHECKED_OUT: { text: '已退房', color: 'bg-gray-100 text-gray-800' },
  CANCELLED: { text: '已取消', color: 'bg-red-100 text-red-800' },
  REFUNDED: { text: '已退款', color: 'bg-purple-100 text-purple-800' }
}

// 可用的状态转换
const STATUS_TRANSITIONS = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['CHECKED_IN', 'CANCELLED'],
  CHECKED_IN: ['CHECKED_OUT'],
  CHECKED_OUT: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: []
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

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth()
  const bookingId = params.id

  // 状态管理
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // 模态框状态
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')

  // 检查认证状态 - 只有在非加载状态下才重定向
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(`/bookings/${bookingId}`))
      return
    }
  }, [isAuthenticated, isLoading, router, bookingId])

  // 初始化认证检查
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      checkAuth()
    }
  }, [checkAuth, isAuthenticated, isLoading])

  // 获取预订详情
  const fetchBooking = useCallback(async () => {
    if (!bookingId) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'GET',
        credentials: 'include'
      })

      const data = await safeJsonParse(response)

      if (data.success) {
        setBooking(data.data.booking)
      } else {
        setError(data.message || '获取预订详情失败')
      }
    } catch (error) {
      console.error('获取预订详情失败:', error)
      setError(error.message || '网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  // 初次加载
  useEffect(() => {
    if (isAuthenticated && bookingId) {
      fetchBooking()
    }
  }, [isAuthenticated, fetchBooking, bookingId])

  // 更新预订状态
  const updateBookingStatus = async (newStatus) => {
    try {
      setUpdating(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      })

      const data = await safeJsonParse(response)

      if (data.success) {
        setBooking(data.data.booking)
        setSuccess(`预订状态已更新为：${BOOKING_STATUS[newStatus].text}`)
        setShowStatusModal(false)
      } else {
        setError(data.message || '更新状态失败')
      }
    } catch (error) {
      console.error('更新预订状态失败:', error)
      setError('网络错误，请重试')
    } finally {
      setUpdating(false)
    }
  }

  // 取消预订
  const cancelBooking = async () => {
    try {
      setUpdating(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await safeJsonParse(response)

      if (data.success) {
        setBooking(prev => ({ ...prev, status: 'CANCELLED' }))
        setSuccess('预订已成功取消')
        setShowCancelModal(false)
      } else {
        setError(data.message || '取消预订失败')
      }
    } catch (error) {
      console.error('取消预订失败:', error)
      setError('网络错误，请重试')
    } finally {
      setUpdating(false)
    }
  }

  // 预订状态徽章组件
  const StatusBadge = ({ status }) => {
    const statusInfo = BOOKING_STATUS[status] || { text: status, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    )
  }

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short'
    })
  }

  // 格式化日期时间
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <Layout title="预订详情" user={user}>
        <div className="flex justify-center items-center min-h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    )
  }

  if (error && !booking) {
    return (
      <Layout title="预订详情" user={user}>
        <div className="bg-white rounded-lg shadow p-6">
          <ErrorMessage error={error} />
          <div className="mt-4">
            <Button onClick={() => router.push('/bookings')} variant="secondary">
              返回预订列表
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  if (!booking) {
    return (
      <Layout title="预订详情" user={user}>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-gray-500 text-lg">预订不存在</div>
          <div className="mt-4">
            <Button onClick={() => router.push('/bookings')} variant="secondary">
              返回预订列表
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  const canManageBooking = user?.role === 'admin' || user?.role === 'staff'
  const availableTransitions = STATUS_TRANSITIONS[booking.status] || []

  return (
    <Layout title="预订详情" user={user}>
      {/* 返回按钮 */}
      <div className="mb-6">
        <Button
          onClick={() => router.push('/bookings')}
          variant="secondary"
          className="flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回预订列表
        </Button>
      </div>

      {/* 错误和成功提示 */}
      {error && <ErrorMessage error={error} className="mb-6" />}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="text-green-800">{success}</div>
        </div>
      )}

      {/* 预订基本信息 */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">预订信息</h2>
            <StatusBadge status={booking.status} />
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">基本信息</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">确认码</dt>
                  <dd className="text-sm text-gray-900 font-mono">{booking.confirmationCode}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">入住日期</dt>
                  <dd className="text-sm text-gray-900">{formatDate(booking.checkIn)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">退房日期</dt>
                  <dd className="text-sm text-gray-900">{formatDate(booking.checkOut)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">入住天数</dt>
                  <dd className="text-sm text-gray-900">{booking.days} 天</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">客人数量</dt>
                  <dd className="text-sm text-gray-900">{booking.guestCount} 人</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">价格详情</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">套餐单价</dt>
                  <dd className="text-sm text-gray-900">{booking.package.priceFormatted}/天</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">基础费用</dt>
                  <dd className="text-sm text-gray-900">{booking.priceDetails.basePriceFormatted}</dd>
                </div>
                {booking.priceDetails.extraFee > 0 && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">额外费用</dt>
                    <dd className="text-sm text-gray-900">{booking.priceDetails.extraFeeFormatted}</dd>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200">
                  <dt className="text-sm font-medium text-gray-500">总价</dt>
                  <dd className="text-lg font-semibold text-gray-900">{booking.totalPriceFormatted}</dd>
                </div>
              </dl>
            </div>
          </div>

          {booking.specialRequests && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">特殊要求</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {booking.specialRequests}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 客户信息 */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">客户信息</h2>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-500">姓名</dt>
              <dd className="text-sm text-gray-900">{booking.user.firstName} {booking.user.lastName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">邮箱</dt>
              <dd className="text-sm text-gray-900">{booking.user.email}</dd>
            </div>
            {booking.user.phone && (
              <div>
                <dt className="text-sm font-medium text-gray-500">电话</dt>
                <dd className="text-sm text-gray-900">{booking.user.phone}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">用户名</dt>
              <dd className="text-sm text-gray-900">{booking.user.username}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* 套餐信息 */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">套餐信息</h2>
        </div>
        <div className="p-6">
          <div className="flex items-start space-x-4">
            {booking.package.images && booking.package.images.length > 0 && (
              <img
                src={booking.package.images[0]}
                alt={booking.package.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">{booking.package.name}</h3>
              {booking.package.description && (
                <p className="text-sm text-gray-600 mt-1">{booking.package.description}</p>
              )}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">容量</dt>
                  <dd className="text-sm text-gray-900">{booking.package.capacity} 人</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">价格</dt>
                  <dd className="text-sm text-gray-900">{booking.package.priceFormatted}/天</dd>
                </div>
              </div>
              {booking.package.amenities && booking.package.amenities.length > 0 && (
                <div className="mt-3">
                  <dt className="text-sm font-medium text-gray-500 mb-2">设施</dt>
                  <div className="flex flex-wrap gap-2">
                    {booking.package.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 客人信息 */}
      {booking.guests && booking.guests.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">客人信息</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {booking.guests.map((guest, index) => (
                <div key={guest.id} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900">客人 {index + 1}</h4>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">姓名</dt>
                      <dd className="text-sm text-gray-900">{guest.name}</dd>
                    </div>
                    {guest.age && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">年龄</dt>
                        <dd className="text-sm text-gray-900">{guest.age} 岁</dd>
                      </div>
                    )}
                    {guest.phone && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">电话</dt>
                        <dd className="text-sm text-gray-900">{guest.phone}</dd>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      {canManageBooking && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">管理操作</h2>
          <div className="flex flex-wrap gap-3">
            {availableTransitions.length > 0 && (
              <Button
                onClick={() => setShowStatusModal(true)}
                variant="primary"
                disabled={updating}
              >
                更新状态
              </Button>
            )}
            {['PENDING', 'CONFIRMED'].includes(booking.status) && (
              <Button
                onClick={() => setShowCancelModal(true)}
                variant="danger"
                disabled={updating}
              >
                取消预订
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 状态更新模态框 */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="更新预订状态"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            当前状态：<StatusBadge status={booking.status} />
          </p>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">选择新状态</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">请选择状态</option>
              {availableTransitions.map(status => (
                <option key={status} value={status}>
                  {BOOKING_STATUS[status].text}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setShowStatusModal(false)}
              variant="secondary"
              disabled={updating}
            >
              取消
            </Button>
            <Button
              onClick={() => updateBookingStatus(selectedStatus)}
              variant="primary"
              disabled={!selectedStatus || updating}
              loading={updating}
            >
              确认更新
            </Button>
          </div>
        </div>
      </Modal>

      {/* 取消预订确认模态框 */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="取消预订"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            确定要取消此预订吗？此操作不可撤销。
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-800">
              预订信息：{booking.confirmationCode} - {booking.package.name}
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setShowCancelModal(false)}
              variant="secondary"
              disabled={updating}
            >
              保留预订
            </Button>
            <Button
              onClick={cancelBooking}
              variant="danger"
              disabled={updating}
              loading={updating}
            >
              确认取消
            </Button>
          </div>
        </div>
      </Modal>

      {/* 时间戳信息 */}
      <div className="mt-6 text-center text-sm text-gray-500">
        创建时间：{formatDateTime(booking.createdAt)}
        {booking.updatedAt !== booking.createdAt && (
          <span className="ml-4">
            更新时间：{formatDateTime(booking.updatedAt)}
          </span>
        )}
      </div>
    </Layout>
  )
}