'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, Suspense } from 'react'
import Layout from '../../../../components/layout/Layout'
import { Button, ErrorMessage, Input, LoadingSpinner, Select, SuccessMessage } from '../../../../components/ui/FormComponents'
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

function NewBookingPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading, checkAuth } = useAuth()

  // 从URL参数获取预选套餐
  const preselectedPackageId = searchParams.get('packageId')

  // 表单状态
  const [formData, setFormData] = useState({
    packageId: preselectedPackageId || '',
    checkIn: '',
    checkOut: '',
    guestCount: 1,
    specialRequests: '',
    userId: '' // 仅员工和管理员使用
  })

  // UI状态
  const [packages, setPackages] = useState([])
  const [users, setUsers] = useState([]) // 员工和管理员可选择用户
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [availability, setAvailability] = useState(null)
  const [priceEstimate, setPriceEstimate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  // 检查认证状态 - 只有在非加载状态下才重定向
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectUrl = '/bookings/new' + (preselectedPackageId ? `?packageId=${preselectedPackageId}` : '')
      router.push('/login?redirect=' + encodeURIComponent(redirectUrl))
      return
    }
  }, [isAuthenticated, isLoading, router, preselectedPackageId])

  // 初始化认证检查
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      checkAuth()
    }
  }, [checkAuth, isAuthenticated, isLoading])

  // 获取套餐列表
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/packages?status=ACTIVE', {
        credentials: 'include'
      })
      const data = await safeJsonParse(response)

      if (data.success) {
        const packagesList = data.data.packages || []
        setPackages(packagesList)
        
        // 如果有预选套餐，设置选中的套餐
        if (preselectedPackageId) {
          const preselected = packagesList.find(pkg => pkg.id === preselectedPackageId)
          if (preselected) {
            setSelectedPackage(preselected)
          }
        }
      }
    } catch (error) {
      console.error('获取套餐列表失败:', error)
      setError('获取套餐列表失败，请刷新页面重试')
    } finally {
      setLoading(false)
    }
  }, [preselectedPackageId])

  // 获取用户列表（员工和管理员用）
  const fetchUsers = useCallback(async () => {
    if (!user || !['admin', 'staff'].includes(user.role)) return

    try {
      const response = await fetch('/api/users?role=guest&limit=100', {
        credentials: 'include'
      })
      const data = await safeJsonParse(response)

      if (data.success) {
        setUsers(data.data.users || [])
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
    }
  }, [user])

  // 初始化数据
  useEffect(() => {
    if (isAuthenticated) {
      fetchPackages()
      fetchUsers()
    }
  }, [isAuthenticated, fetchPackages, fetchUsers])

  // 设置最小日期（今天）
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  // 设置最小退房日期（入住日期的下一天）
  const getMinCheckOutDate = () => {
    if (!formData.checkIn) return getMinDate()
    const checkInDate = new Date(formData.checkIn)
    checkInDate.setDate(checkInDate.getDate() + 1)
    return checkInDate.toISOString().split('T')[0]
  }

  // 处理表单输入变化
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 清除相关错误
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }))
    }
    
    // 如果是套餐变化，更新选中的套餐
    if (field === 'packageId') {
      const pkg = packages.find(p => p.id === value)
      setSelectedPackage(pkg)
      setAvailability(null)
      setPriceEstimate(null)
    }
    
    // 如果是入住日期变化，清空退房日期（如果它早于新入住日期）
    if (field === 'checkIn' && formData.checkOut) {
      const checkInDate = new Date(value)
      const checkOutDate = new Date(formData.checkOut)
      if (checkOutDate <= checkInDate) {
        setFormData(prev => ({ ...prev, checkOut: '' }))
      }
    }
    
    // 清除可用性检查结果当日期或客人数量变化时
    if (['packageId', 'checkIn', 'checkOut', 'guestCount'].includes(field)) {
      setAvailability(null)
      setPriceEstimate(null)
    }
  }

  // 检查可用性
  const checkAvailability = async () => {
    if (!formData.packageId || !formData.checkIn || !formData.checkOut || !formData.guestCount) {
      setError('请先完整填写套餐、入住时间和客人数量')
      return
    }

    try {
      setChecking(true)
      setError(null)
      
      const response = await fetch('/api/bookings/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          packageId: formData.packageId,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          guestCount: parseInt(formData.guestCount)
        })
      })

      const data = await safeJsonParse(response)

      if (data.success) {
        setAvailability(data.data)
        setPriceEstimate(data.data.priceDetails)
      } else {
        setError(data.message || '可用性检查失败')
        setAvailability(null)
        setPriceEstimate(null)
      }
    } catch (error) {
      console.error('检查可用性失败:', error)
      setError('网络错误，请重试')
    } finally {
      setChecking(false)
    }
  }

  // 表单验证
  const validateForm = () => {
    const errors = {}
    
    if (!formData.packageId) errors.packageId = '请选择套餐'
    if (!formData.checkIn) errors.checkIn = '请选择入住日期'
    if (!formData.checkOut) errors.checkOut = '请选择退房日期'
    if (!formData.guestCount || formData.guestCount < 1) errors.guestCount = '客人数量至少为1'
    
    // 检查日期逻辑
    if (formData.checkIn && formData.checkOut) {
      const checkInDate = new Date(formData.checkIn)
      const checkOutDate = new Date(formData.checkOut)
      if (checkOutDate <= checkInDate) {
        errors.checkOut = '退房日期必须晚于入住日期'
      }
    }
    
    // 检查客人数量是否超过套餐容量
    if (selectedPackage && formData.guestCount > selectedPackage.capacity) {
      errors.guestCount = `客人数量不能超过套餐容量（${selectedPackage.capacity}人）`
    }
    
    // 员工和管理员必须选择用户
    if (['admin', 'staff'].includes(user?.role) && !formData.userId) {
      errors.userId = '请选择预订用户'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 提交预订
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    if (!availability?.available) {
      setError('请先检查可用性确认可以预订')
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const submitData = {
        packageId: formData.packageId,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guestCount: parseInt(formData.guestCount),
        specialRequests: formData.specialRequests || null
      }

      // 员工和管理员可以为其他用户创建预订
      if (['admin', 'staff'].includes(user?.role) && formData.userId) {
        submitData.userId = formData.userId
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData)
      })

      const data = await safeJsonParse(response)

      if (data.success) {
        setSuccess(`预订创建成功！确认码：${data.data.booking.confirmationCode}`)
        
        // 3秒后跳转到预订详情页
        setTimeout(() => {
          router.push(`/bookings/${data.data.booking.id}`)
        }, 3000)
      } else {
        setError(data.message || '创建预订失败')
      }
    } catch (error) {
      console.error('创建预订失败:', error)
      setError('网络错误，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  // 格式化价格
  const formatPrice = (price) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(price / 100)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <Layout title="新建预订" user={user}>
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="secondary"
            className="flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </Button>
        </div>

        {/* 错误和成功提示 */}
        {error && <ErrorMessage error={error} className="mb-6" />}
        {success && <SuccessMessage message={success} className="mb-6" />}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 预订表单 */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">预订信息</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 套餐选择 */}
                  <Select
                    label="选择套餐"
                    value={formData.packageId}
                    onChange={(e) => handleInputChange('packageId', e.target.value)}
                    options={[
                      { value: '', label: '请选择套餐' },
                      ...packages.map(pkg => ({
                        value: pkg.id,
                        label: `${pkg.name} - ${pkg.priceFormatted}/天 (${pkg.capacity}人)`
                      }))
                    ]}
                    error={formErrors.packageId}
                    required
                  />

                  {/* 入住日期 */}
                  <Input
                    label="入住日期"
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => handleInputChange('checkIn', e.target.value)}
                    min={getMinDate()}
                    error={formErrors.checkIn}
                    required
                  />

                  {/* 退房日期 */}
                  <Input
                    label="退房日期"
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => handleInputChange('checkOut', e.target.value)}
                    min={getMinCheckOutDate()}
                    error={formErrors.checkOut}
                    required
                  />

                  {/* 客人数量 */}
                  <Input
                    label="客人数量"
                    type="number"
                    value={formData.guestCount}
                    onChange={(e) => handleInputChange('guestCount', parseInt(e.target.value) || 1)}
                    min="1"
                    max={selectedPackage?.capacity || 10}
                    error={formErrors.guestCount}
                    required
                  />

                  {/* 员工和管理员可以选择用户 */}
                  {['admin', 'staff'].includes(user?.role) && (
                    <Select
                      label="预订用户"
                      value={formData.userId}
                      onChange={(e) => handleInputChange('userId', e.target.value)}
                      options={[
                        { value: '', label: '请选择用户' },
                        ...users.map(u => ({
                          value: u.id,
                          label: `${u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.username} (${u.email})`
                        }))
                      ]}
                      error={formErrors.userId}
                      required
                    />
                  )}

                  {/* 特殊要求 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      特殊要求（可选）
                    </label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="请描述您的特殊需求，如饮食禁忌、无障碍需求等"
                    />
                  </div>

                  {/* 检查可用性按钮 */}
                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      onClick={checkAvailability}
                      variant="secondary"
                      loading={checking}
                      disabled={checking || !formData.packageId || !formData.checkIn || !formData.checkOut}
                    >
                      检查可用性
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="primary"
                      loading={submitting}
                      disabled={submitting || !availability?.available}
                    >
                      {submitting ? '创建中...' : '确认预订'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>

            {/* 预订摘要 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">预订摘要</h3>
                
                {selectedPackage ? (
                  <div className="space-y-4">
                    {/* 套餐信息 */}
                    <div>
                      <h4 className="font-medium text-gray-900">{selectedPackage.name}</h4>
                      <p className="text-sm text-gray-600">{selectedPackage.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        容量：{selectedPackage.capacity}人 | 价格：{selectedPackage.priceFormatted}/天
                      </p>
                    </div>

                    {/* 预订详情 */}
                    {formData.checkIn && formData.checkOut && (
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">入住日期</span>
                          <span className="font-medium">{formData.checkIn}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">退房日期</span>
                          <span className="font-medium">{formData.checkOut}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">客人数量</span>
                          <span className="font-medium">{formData.guestCount}人</span>
                        </div>
                      </div>
                    )}

                    {/* 可用性检查结果 */}
                    {availability && (
                      <div className="border-t pt-4">
                        {availability.available ? (
                          <div className="text-green-600 text-sm font-medium flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            可以预订
                          </div>
                        ) : (
                          <div className="text-red-600 text-sm font-medium flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            不可预订
                          </div>
                        )}
                      </div>
                    )}

                    {/* 价格估算 */}
                    {priceEstimate && (
                      <div className="border-t pt-4">
                        <h5 className="font-medium text-gray-900 mb-2">价格详情</h5>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">基础费用</span>
                            <span>{formatPrice(priceEstimate.basePrice)}</span>
                          </div>
                          {priceEstimate.extraFee > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">额外费用</span>
                              <span>{formatPrice(priceEstimate.extraFee)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold text-lg border-t pt-2 mt-2">
                            <span>总计</span>
                            <span className="text-green-600">{formatPrice(priceEstimate.totalPrice)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">请先选择套餐</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    }>
      <NewBookingPageContent />
    </Suspense>
  )
}