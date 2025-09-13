'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Layout from '../../../../../components/layout/Layout'
import { Input, Select, Button, ErrorMessage, SuccessMessage, LoadingSpinner } from '../../../../../components/ui/FormComponents'
import EditHistory from '../../../../../components/ui/EditHistory'
import DeletePackageModal, { useDeletePackage } from '../../../../../components/ui/DeletePackageModal'
import { formatPrice, parsePriceToDb, validatePrice } from '../../../../../lib/utils/price'
import { generateEditHistory, mergeEditHistory } from '../../../../../lib/utils/editHistory'

// 预定义的设施选项 (复用自add页面)
const AMENITY_OPTIONS = [
  '双人帐篷', '豪华帐篷', '家庭帐篷', '专业帐篷',
  '睡袋租借', '独立卫浴', '公共洗手间', '空调设备',
  '三餐包含', '早餐包含', '户外烧烤', '篝火区域',
  '徒步向导', '专业向导', '探险装备', '攀岩体验',
  '溯溪活动', '野外求生课程', '亲子活动', '儿童乐园',
  '免费WiFi', '24小时安保', '24小时服务', '应急医疗包',
  '卫星通讯', '停车场', '洗衣服务', '行李寄存'
]

// 设施选择器组件 (复用)
function AmenitySelector({ selectedAmenities, onAmenitiesChange, error }) {
  const [customAmenity, setCustomAmenity] = useState('')

  const handleToggleAmenity = (amenity) => {
    const newAmenities = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(item => item !== amenity)
      : [...selectedAmenities, amenity]
    onAmenitiesChange(newAmenities)
  }

  const handleAddCustomAmenity = () => {
    if (customAmenity.trim() && !selectedAmenities.includes(customAmenity.trim())) {
      onAmenitiesChange([...selectedAmenities, customAmenity.trim()])
      setCustomAmenity('')
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        设施选择
      </label>
      
      {/* 预定义设施 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {AMENITY_OPTIONS.map(amenity => (
          <button
            key={amenity}
            type="button"
            onClick={() => handleToggleAmenity(amenity)}
            className={`px-3 py-2 text-sm border rounded-md transition-colors ${
              selectedAmenities.includes(amenity)
                ? 'bg-green-100 border-green-500 text-green-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {amenity}
          </button>
        ))}
      </div>

      {/* 自定义设施 */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="添加自定义设施"
          value={customAmenity}
          onChange={(e) => setCustomAmenity(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAmenity()}
        />
        <button
          type="button"
          onClick={handleAddCustomAmenity}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          添加
        </button>
      </div>

      {/* 已选设施 */}
      {selectedAmenities.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">已选设施 ({selectedAmenities.length}):</p>
          <div className="flex flex-wrap gap-2">
            {selectedAmenities.map(amenity => (
              <span
                key={amenity}
                className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => handleToggleAmenity(amenity)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

// 图片预览组件 (复用)
function ImagePreview({ images, onImagesChange, error }) {
  const [newImageUrl, setNewImageUrl] = useState('')

  const handleAddImage = () => {
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim())) {
      onImagesChange([...images, newImageUrl.trim()])
      setNewImageUrl('')
    }
  }

  const handleRemoveImage = (index) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        套餐图片
      </label>

      {/* 添加图片URL */}
      <div className="flex gap-2">
        <input
          type="url"
          placeholder="输入图片URL"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
          onKeyPress={(e) => e.key === 'Enter' && handleAddImage()}
        />
        <button
          type="button"
          onClick={handleAddImage}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          添加
        </button>
      </div>

      {/* 图片预览 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`预览图 ${index + 1}`}
                className="w-full h-24 object-cover rounded-md border"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNSA0MEg2NVY2MEgzNVY0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                }}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

// 实时价格预览组件 (复用)
function PricePreview({ price, duration }) {
  const dailyPrice = price ? parseFloat(price) : 0
  const totalPrice = dailyPrice * (duration || 1)

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-3">价格预览</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">单日价格:</span>
          <span className="font-medium">{formatPrice(parsePriceToDb(dailyPrice))}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">套餐天数:</span>
          <span className="font-medium">{duration || 1} 天</span>
        </div>
        <hr className="my-2" />
        <div className="flex justify-between text-base font-semibold">
          <span className="text-gray-900">总价:</span>
          <span className="text-green-600">{formatPrice(parsePriceToDb(totalPrice))}</span>
        </div>
      </div>
    </div>
  )
}

export default function EditPackagePage() {
  const router = useRouter()
  const params = useParams()
  const packageId = params.id
  const { deletePackage, loading: deleteLoading } = useDeletePackage()

  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [originalData, setOriginalData] = useState(null)

  // 删除相关状态
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    package: null
  })

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: 1,
    capacity: 1,
    amenities: [],
    images: [],
    status: 'DRAFT'
  })

  // 表单验证错误
  const [formErrors, setFormErrors] = useState({})

  // 模拟编辑历史 (实际项目中应从API获取)
  const [editHistory, setEditHistory] = useState([
    {
      action: '套餐创建',
      timestamp: '2024-09-08 10:00:00',
      userId: 'admin123',
      userName: '系统管理员',
      details: '创建了新套餐',
      icon: 'create'
    }
  ])

  // 载入套餐数据
  useEffect(() => {
    const fetchPackageData = async () => {
      if (!packageId) return

      setIsDataLoading(true)
      setError('')

      try {
        const response = await fetch(`/api/packages/${packageId}`, {
          credentials: 'include'
        })

        const result = await response.json()

        if (result.success) {
          const packageData = result.data.package
          
          // 预填充表单数据
          const formattedData = {
            name: packageData.name || '',
            description: packageData.description || '',
            price: (packageData.price / 100).toString(), // 转换为元
            duration: packageData.duration || 1,
            capacity: packageData.capacity || 1,
            amenities: packageData.amenities || [],
            images: packageData.images || [],
            status: packageData.status || 'DRAFT'
          }
          
          setFormData(formattedData)
          setOriginalData(packageData)
        } else {
          setError(result.message || '加载套餐数据失败')
        }
      } catch (err) {
        console.error('加载套餐数据失败:', err)
        setError('网络错误，请稍后重试')
      } finally {
        setIsDataLoading(false)
      }
    }

    fetchPackageData()
  }, [packageId])

  // 处理表单字段变化
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
    setError('')
    setSuccess('')
  }

  // 表单验证
  const validateForm = () => {
    const errors = {}

    // 套餐名称验证
    if (!formData.name.trim()) {
      errors.name = '套餐名称不能为空'
    } else if (formData.name.length < 2) {
      errors.name = '套餐名称至少需要2个字符'
    } else if (formData.name.length > 100) {
      errors.name = '套餐名称不能超过100个字符'
    }

    // 价格验证
    const priceValidation = validatePrice(formData.price)
    if (!priceValidation.valid) {
      errors.price = priceValidation.message
    }

    // 时长验证
    if (!formData.duration || formData.duration < 1) {
      errors.duration = '套餐时长必须至少1天'
    } else if (formData.duration > 365) {
      errors.duration = '套餐时长不能超过365天'
    }

    // 容量验证
    if (!formData.capacity || formData.capacity < 1) {
      errors.capacity = '容量必须至少1人'
    } else if (formData.capacity > 50) {
      errors.capacity = '容量不能超过50人'
    }

    // 状态验证
    if (!['ACTIVE', 'INACTIVE', 'DRAFT'].includes(formData.status)) {
      errors.status = '无效的套餐状态'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 检查是否有修改
  const hasChanges = () => {
    if (!originalData) return false
    
    return (
      formData.name !== originalData.name ||
      formData.description !== (originalData.description || '') ||
      parseFloat(formData.price) !== (originalData.price / 100) ||
      formData.duration !== originalData.duration ||
      formData.capacity !== originalData.capacity ||
      JSON.stringify(formData.amenities) !== JSON.stringify(originalData.amenities) ||
      JSON.stringify(formData.images) !== JSON.stringify(originalData.images) ||
      formData.status !== originalData.status
    )
  }

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setError('请检查表单中的错误')
      return
    }

    if (!hasChanges()) {
      setError('没有检测到任何修改')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('套餐更新成功！')
        // 生成编辑历史
        const newHistory = generateEditHistory(
          {
            ...originalData,
            price: originalData.price
          },
          {
            ...formData,
            price: parsePriceToDb(formData.price)
          },
          'current-user', // 实际应用中应从用户上下文获取
          '当前用户'
        )
        
        // 更新编辑历史
        if (newHistory.length > 0) {
          setEditHistory(prev => mergeEditHistory(prev, newHistory))
        }
        
        // 更新原始数据以反映更改
        setOriginalData(prev => ({
          ...prev,
          ...formData,
          price: parsePriceToDb(formData.price)
        }))
      } else {
        setError(result.message || '更新失败')
      }
    } catch (err) {
      console.error('更新套餐失败:', err)
      setError('网络错误，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 重置表单
  const handleReset = () => {
    if (originalData) {
      const formattedData = {
        name: originalData.name || '',
        description: originalData.description || '',
        price: (originalData.price / 100).toString(),
        duration: originalData.duration || 1,
        capacity: originalData.capacity || 1,
        amenities: originalData.amenities || [],
        images: originalData.images || [],
        status: originalData.status || 'DRAFT'
      }
      setFormData(formattedData)
      setFormErrors({})
      setError('')
      setSuccess('')
    }
  }

  // 删除功能
  const handleDeleteClick = () => {
    if (originalData) {
      setDeleteModal({
        isOpen: true,
        package: {
          ...originalData,
          priceFormatted: formatPrice(originalData.price),
          bookingCount: originalData.bookingStats?.total || 0
        }
      })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      package: null
    })
  }

  const handleDeleteConfirm = async () => {
    if (!originalData) return

    const result = await deletePackage(originalData.id)
    
    if (result.success) {
      // 删除成功，跳转到套餐列表
      router.push('/packages?message=' + encodeURIComponent(result.message))
    } else {
      setError(result.message)
      handleDeleteCancel()
    }
  }

  if (isDataLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="xl" />
        </div>
      </Layout>
    )
  }

  if (error && !originalData) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <ErrorMessage error={error} />
          <div className="mt-4">
            <Link
              href="/packages"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              返回套餐列表
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">编辑套餐</h1>
              <p className="text-gray-600 mt-2">修改 "{originalData?.name}" 的信息</p>
            </div>
            <div className="flex gap-2">
              <Link 
                href={`/packages/${packageId}`}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                查看详情
              </Link>
              <Link 
                href="/packages"
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                返回列表
              </Link>
            </div>
          </div>
        </div>

        {/* 错误和成功提示 */}
        <ErrorMessage error={error} className="mb-6" />
        <SuccessMessage message={success} className="mb-6" />

        {/* 修改提示 */}
        {hasChanges() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-yellow-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-yellow-800">您有未保存的修改</p>
            </div>
          </div>
        )}

        {/* 表单 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧：基本信息 */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">基本信息</h3>
                  
                  <Input
                    label="套餐名称"
                    id="name"
                    required
                    placeholder="输入套餐名称"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={formErrors.name}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      套餐描述
                    </label>
                    <textarea
                      placeholder="详细描述套餐内容和特色..."
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="单日价格 (元)"
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      error={formErrors.price}
                    />

                    <Input
                      label="套餐天数"
                      id="duration"
                      type="number"
                      min="1"
                      max="365"
                      required
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 1)}
                      error={formErrors.duration}
                    />

                    <Input
                      label="可容纳人数"
                      id="capacity"
                      type="number"
                      min="1"
                      max="50"
                      required
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 1)}
                      error={formErrors.capacity}
                    />
                  </div>

                  <Select
                    label="套餐状态"
                    id="status"
                    required
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    options={[
                      { value: 'DRAFT', label: '草稿' },
                      { value: 'ACTIVE', label: '启用' },
                      { value: 'INACTIVE', label: '停用' }
                    ]}
                    error={formErrors.status}
                  />
                </div>

                {/* 设施选择 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">设施配置</h3>
                  <AmenitySelector
                    selectedAmenities={formData.amenities}
                    onAmenitiesChange={(amenities) => handleInputChange('amenities', amenities)}
                    error={formErrors.amenities}
                  />
                </div>

                {/* 图片管理 */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">图片管理</h3>
                  <ImagePreview
                    images={formData.images}
                    onImagesChange={(images) => handleInputChange('images', images)}
                    error={formErrors.images}
                  />
                </div>
              </div>

              {/* 右侧：价格预览和操作 */}
              <div className="space-y-6">
                <PricePreview
                  price={formData.price}
                  duration={formData.duration}
                />

                {/* 编辑历史 */}
                <EditHistory 
                  history={editHistory} 
                  maxItems={5}
                  showStats={true}
                  showSearch={editHistory.length > 5}
                />

                {/* 操作按钮 */}
                <div className="space-y-3">
                  <Button
                    type="submit"
                    loading={isLoading}
                    disabled={isLoading || !hasChanges()}
                    className="w-full"
                  >
                    {isLoading ? '保存中...' : '保存修改'}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                    disabled={isLoading || !hasChanges()}
                    className="w-full"
                  >
                    撤销修改
                  </Button>

                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleDeleteClick}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {originalData?.bookingStats?.total > 0 ? '停用套餐' : '删除套餐'}
                  </Button>

                  <Link href={`/packages/${packageId}`}>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                    >
                      取消编辑
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* 删除确认模态框 */}
        <DeletePackageModal
          package={deleteModal.package}
          isOpen={deleteModal.isOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          loading={deleteLoading}
        />
      </div>
    </Layout>
  )
}