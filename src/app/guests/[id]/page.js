'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import Layout from '../../../../components/layout/Layout'
import { Button, ErrorMessage, Input, LoadingSpinner, SuccessMessage } from '../../../../components/ui/FormComponents'
import { useAuth } from '../../../contexts/AuthContext'

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

export default function GuestDetailPage({ params }) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { id } = params

  // 状态管理
  const [guest, setGuest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [editMode, setEditMode] = useState(false)

  // 编辑表单数据
  const [editData, setEditData] = useState({
    name: '',
    age: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    dietaryRequirements: '',
    idNumber: ''
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

  // 获取客户详情
  const fetchGuestDetail = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/guests/${id}`, {
        method: 'GET',
        credentials: 'include'
      })

      const data = await safeJsonParse(response)

      if (data.success) {
        setGuest(data.data.guest)
        // 设置编辑表单的初始值
        setEditData({
          name: data.data.guest.name || '',
          age: data.data.guest.age || '',
          phone: data.data.guest.phone || '',
          emergencyContact: data.data.guest.emergencyContact || '',
          emergencyPhone: data.data.guest.emergencyPhone || '',
          dietaryRequirements: data.data.guest.dietaryRequirements || '',
          idNumber: data.data.guest.idNumber || ''
        })
      } else {
        setError(data.message || '获取客户详情失败')
      }
    } catch (error) {
      console.error('获取客户详情失败:', error)
      setError(error.message || '网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }, [id])

  // 初次加载
  useEffect(() => {
    if (isAuthenticated && user && ['admin', 'staff'].includes(user.role) && id) {
      fetchGuestDetail()
    }
  }, [isAuthenticated, user, id, fetchGuestDetail])

  // 处理编辑模式切换
  const handleEditToggle = () => {
    if (editMode) {
      // 退出编辑模式，重置数据
      setEditData({
        name: guest?.name || '',
        age: guest?.age || '',
        phone: guest?.phone || '',
        emergencyContact: guest?.emergencyContact || '',
        emergencyPhone: guest?.emergencyPhone || '',
        dietaryRequirements: guest?.dietaryRequirements || '',
        idNumber: guest?.idNumber || ''
      })
    }
    setEditMode(!editMode)
    setError(null)
    setSuccess(null)
  }

  // 处理表单数据变化
  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  // 保存更新
  const handleSave = async () => {
    try {
      setUpdating(true)
      setError(null)
      setSuccess(null)

      // 只发送有变化的数据
      const updateData = {}
      Object.keys(editData).forEach(key => {
        if (editData[key] !== (guest[key] || '')) {
          updateData[key] = editData[key] || null
        }
      })

      if (Object.keys(updateData).length === 0) {
        setError('没有修改任何数据')
        return
      }

      const response = await fetch(`/api/guests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData)
      })

      const data = await safeJsonParse(response)

      if (data.success) {
        setSuccess('客户信息更新成功')
        setEditMode(false)
        fetchGuestDetail() // 重新获取最新数据
      } else {
        setError(data.message || '更新失败')
      }
    } catch (error) {
      console.error('更新客户信息失败:', error)
      setError('网络错误，请重试')
    } finally {
      setUpdating(false)
    }
  }

  // 预订状态徽章
  const StatusBadge = ({ status }) => {
    const statusInfo = {
      PENDING: { text: '待确认', color: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { text: '已确认', color: 'bg-blue-100 text-blue-800' },
      CHECKED_IN: { text: '已入住', color: 'bg-green-100 text-green-800' },
      CHECKED_OUT: { text: '已退房', color: 'bg-gray-100 text-gray-800' },
      CANCELLED: { text: '已取消', color: 'bg-red-100 text-red-800' },
      REFUNDED: { text: '已退款', color: 'bg-purple-100 text-purple-800' }
    }[status] || { text: status, color: 'bg-gray-100 text-gray-800' }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    )
  }

  if (!isAuthenticated || !user || !['admin', 'staff'].includes(user.role)) {
    return null
  }

  if (loading) {
    return (
      <Layout title="客户详情" user={user}>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    )
  }

  if (!guest) {
    return (
      <Layout title="客户详情" user={user}>
        <div className="text-center py-12">
          <div className="text-red-600 text-lg mb-4">客户不存在</div>
          <Button onClick={() => router.push('/guests')} variant="primary">
            返回客户列表
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="客户详情" user={user}>
      <div className="max-w-4xl mx-auto">
        {/* 页面头部 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">客户详情</h1>
              <p className="text-gray-600 mt-1">查看和编辑客户信息</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => router.push('/guests')} variant="secondary">
                返回列表
              </Button>
              <Button 
                onClick={handleEditToggle} 
                variant={editMode ? "secondary" : "primary"}
                disabled={updating}
              >
                {editMode ? '取消编辑' : '编辑信息'}
              </Button>
              {editMode && (
                <Button 
                  onClick={handleSave} 
                  variant="primary"
                  loading={updating}
                  disabled={updating}
                >
                  保存更改
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 消息提示 */}
        {error && <ErrorMessage error={error} className="mb-6" />}
        {success && <SuccessMessage message={success} className="mb-6" />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 客户基本信息 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="姓名"
                  value={editMode ? editData.name : guest.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  readOnly={!editMode}
                  required
                />

                <Input
                  label="年龄"
                  type="number"
                  value={editMode ? editData.age : guest.age || ''}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || '')}
                  readOnly={!editMode}
                  placeholder="未提供"
                />

                <Input
                  label="手机号码"
                  value={editMode ? editData.phone : guest.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  readOnly={!editMode}
                  placeholder="未提供"
                />

                <Input
                  label="身份证号"
                  value={editMode ? editData.idNumber : guest.idNumber || ''}
                  onChange={(e) => handleInputChange('idNumber', e.target.value)}
                  readOnly={!editMode}
                  placeholder="未提供"
                />

                <Input
                  label="应急联系人"
                  value={editMode ? editData.emergencyContact : guest.emergencyContact || ''}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  readOnly={!editMode}
                  placeholder="未提供"
                />

                <Input
                  label="应急联系电话"
                  value={editMode ? editData.emergencyPhone : guest.emergencyPhone || ''}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  readOnly={!editMode}
                  placeholder="未提供"
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  饮食要求
                </label>
                {editMode ? (
                  <textarea
                    value={editData.dietaryRequirements}
                    onChange={(e) => handleInputChange('dietaryRequirements', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="特殊饮食要求或过敏信息"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-900">
                    {guest.dietaryRequirements || '无特殊要求'}
                  </div>
                )}
              </div>
            </div>

            {/* 预订历史 */}
            {guest.bookingHistory && guest.bookingHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">预订历史</h2>
                <div className="space-y-4">
                  {guest.bookingHistory.map((booking, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.package.name}
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>
                      <div className="text-sm text-gray-600">
                        入住时间: {booking.checkInFormatted} - {booking.checkOutFormatted}
                      </div>
                      <div className="text-sm text-gray-600">
                        预订人: {booking.customerName}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        确认码: {booking.confirmationCode}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 当前预订信息 */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">当前预订</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">预订状态:</span>
                  <StatusBadge status={guest.booking.status} />
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">套餐名称:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {guest.booking.package.name}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">确认码:</span>
                  <span className="text-sm font-mono text-gray-900">
                    {guest.booking.confirmationCode}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">入住日期:</span>
                  <span className="text-sm text-gray-900">
                    {guest.booking.checkInFormatted}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">退房日期:</span>
                  <span className="text-sm text-gray-900">
                    {guest.booking.checkOutFormatted}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">客人数量:</span>
                  <span className="text-sm text-gray-900">
                    {guest.booking.guestCount}人
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">预订用户:</span>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {guest.booking.user.firstName} {guest.booking.user.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {guest.booking.user.email}
                    </div>
                  </div>
                </div>
              </div>

              {guest.booking.package.amenities && guest.booking.package.amenities.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-700 mb-2 block">套餐设施:</span>
                  <div className="flex flex-wrap gap-1">
                    {guest.booking.package.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => router.push(`/bookings/${guest.booking.id}`)}
                  variant="secondary"
                  className="w-full"
                >
                  查看完整预订信息
                </Button>
              </div>
            </div>

            {/* 同行客人信息 */}
            {guest.booking.guests && guest.booking.guests.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">同行客人</h2>
                <div className="space-y-3">
                  {guest.booking.guests.map((otherGuest) => (
                    <div key={otherGuest.id} className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {otherGuest.name}
                        </div>
                        {otherGuest.age && (
                          <div className="text-xs text-gray-500">
                            {otherGuest.age}岁
                          </div>
                        )}
                      </div>
                      {otherGuest.phone && (
                        <div className="text-sm text-gray-600">
                          {otherGuest.phone}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}