'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button, Input, LoadingSpinner, ErrorMessage, SuccessMessage } from '../../../components/ui/FormComponents'
import DeletePackageModal, { useDeletePackage } from '../../../components/ui/DeletePackageModal'
import { useAuth } from '../../contexts/AuthContext'

export default function PackagesPage() {
  const router = useRouter()
  const { user, isAuthenticated, checkAuth, isLoading: authLoading } = useAuth()
  const { deletePackage, loading: deleteLoading } = useDeletePackage()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState('')

  // 删除相关状态
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    package: null
  })

  // 搜索和筛选状态
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [capacityRange, setCapacityRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [limit] = useState(9) // 每页显示9个套餐（3x3网格）

  // 初始化用户认证状态
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      checkAuth()
    }
  }, [isAuthenticated, authLoading, checkAuth])

  // 获取套餐列表
  const fetchPackages = async () => {
    try {
      setLoading(true)
      setError(null)

      // 构建查询参数
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      })

      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (priceRange.min) params.append('minPrice', priceRange.min)
      if (priceRange.max) params.append('maxPrice', priceRange.max)
      if (capacityRange.min) params.append('minCapacity', capacityRange.min)
      if (capacityRange.max) params.append('maxCapacity', capacityRange.max)

      const response = await fetch(`/api/packages?${params}`)
      const data = await response.json()

      if (data.success) {
        setPackages(data.data.packages)
        setPagination(data.data.pagination)
      } else {
        setError(data.message || '获取套餐列表失败')
      }
    } catch (error) {
      console.error('获取套餐列表失败:', error)
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 页面加载时获取数据
  useEffect(() => {
    fetchPackages()
  }, [currentPage, sortBy, sortOrder])

  // 处理URL参数中的消息
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const message = urlParams.get('message')
    if (message) {
      setSuccess(decodeURIComponent(message))
      // 清除URL参数
      const newUrl = window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    }
  }, [])

  // 搜索处理
  const handleSearch = () => {
    setCurrentPage(1) // 重置到第一页
    fetchPackages()
  }

  // 清除筛选
  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setPriceRange({ min: '', max: '' })
    setCapacityRange({ min: '', max: '' })
    setCurrentPage(1)
    fetchPackages()
  }

  // 分页处理
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  // 打开删除确认弹窗
  const handleDeleteClick = (pkg) => {
    setDeleteModal({
      isOpen: true,
      package: pkg
    })
  }

  // 关闭删除确认弹窗
  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      package: null
    })
  }

  // 确认删除套餐
  const handleDeleteConfirm = async () => {
    if (!deleteModal.package) return

    const result = await deletePackage(deleteModal.package.id)
    
    if (result.success) {
      setSuccess(result.message)
      setError(null)
      // 关闭弹窗
      handleDeleteCancel()
      // 刷新套餐列表
      fetchPackages()
    } else {
      setError(result.message)
      setSuccess('')
    }
  }

  // 套餐卡片组件
  const PackageCard = ({ pkg }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* 套餐图片 */}
      <div className="relative h-48 bg-gray-200">
        {pkg.images && pkg.images.length > 0 ? (
          <img
            src={pkg.images[0]}
            alt={pkg.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/images/packages/default-package.jpg'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">🏕️</span>
          </div>
        )}

        {/* 状态标签 */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            pkg.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
            pkg.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {pkg.status === 'ACTIVE' ? '可预订' :
             pkg.status === 'INACTIVE' ? '暂停' : '草稿'}
          </span>
        </div>
      </div>

      {/* 套餐信息 */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {pkg.name}
          </h3>
          <div className="text-right">
            <p className="text-xl font-bold text-green-600">
              {pkg.priceFormatted}
            </p>
            <p className="text-xs text-gray-500">
              {pkg.duration}天
            </p>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {pkg.description}
        </p>

        {/* 套餐特性 */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <span className="mr-1">👥</span>
            <span>{pkg.capacity}人</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">📅</span>
            <span>{pkg.duration}天</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">📋</span>
            <span>{pkg.bookingCount}预订</span>
          </div>
        </div>

        {/* 设施标签 */}
        <div className="flex flex-wrap gap-1 mb-3">
          {pkg.amenities.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {amenity}
            </span>
          ))}
          {pkg.amenities.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              +{pkg.amenities.length - 3}更多
            </span>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <Link href={`/packages/${pkg.id}`} className="flex-1">
            <Button variant="primary" size="sm" className="w-full">
              查看详情
            </Button>
          </Link>
          
          {pkg.status === 'ACTIVE' && (
            <Link href={`/bookings/new?packageId=${pkg.id}`} className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                立即预订
              </Button>
            </Link>
          )}
        </div>

        {/* 管理员操作按钮 */}
        {user?.role === 'admin' && (
          <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
            <Link href={`/packages/${pkg.id}/edit`} className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                编辑
              </Button>
            </Link>
            <Button 
              variant="danger" 
              size="sm" 
              className="flex-1"
              onClick={() => handleDeleteClick(pkg)}
            >
              {pkg.bookingCount > 0 ? '停用' : '删除'}
            </Button>
          </div>
        )}

        {/* 调试信息 - 临时添加 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-400 mt-2 p-2 bg-gray-50 rounded">
            <p>用户对象: {JSON.stringify(user)}</p>
            <p>是否认证: {String(isAuthenticated)}</p>
            <p>认证加载: {String(authLoading)}</p>
            <p>用户角色: {user?.role || 'undefined'}</p>
            <p>是否管理员: {String(user?.role === 'admin')}</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">营地套餐</h1>
              <p className="text-gray-600">发现最适合您的露营体验</p>
            </div>

            {/* 管理员操作 */}
            {user?.role === 'admin' && (
              <div className="flex gap-2">
                <Link href="/packages/add">
                  <Button variant="primary">
                    新增套餐
                  </Button>
                </Link>
                <Link href="/admin/packages">
                  <Button variant="secondary">
                    管理套餐
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 成功和错误消息 */}
        <SuccessMessage message={success} className="mb-6" />
        <ErrorMessage error={error} className="mb-6" />
        
        {/* 搜索和筛选区域 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* 搜索框 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                搜索套餐
              </label>
              <Input
                type="text"
                placeholder="输入套餐名称或描述"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            {/* 状态筛选 */}
            {(user?.role === 'admin' || user?.role === 'staff') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  状态
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">全部状态</option>
                  <option value="ACTIVE">可预订</option>
                  <option value="INACTIVE">暂停</option>
                  <option value="DRAFT">草稿</option>
                </select>
              </div>
            )}

            {/* 价格范围 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                价格范围（元）
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="最低"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="最高"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>
            </div>

            {/* 容量范围 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                容量（人）
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="最少"
                  value={capacityRange.min}
                  onChange={(e) => setCapacityRange(prev => ({ ...prev, min: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="最多"
                  value={capacityRange.max}
                  onChange={(e) => setCapacityRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* 排序和操作按钮 */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">排序：</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field)
                  setSortOrder(order)
                }}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="createdAt-desc">最新创建</option>
                <option value="createdAt-asc">最早创建</option>
                <option value="price-asc">价格从低到高</option>
                <option value="price-desc">价格从高到低</option>
                <option value="capacity-asc">容量从小到大</option>
                <option value="capacity-desc">容量从大到小</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button variant="primary" onClick={handleSearch}>
                搜索
              </Button>
              <Button variant="secondary" onClick={clearFilters}>
                清除筛选
              </Button>
            </div>
          </div>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* 套餐网格 */}
        {!loading && !error && (
          <>
            {packages.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {packages.map((pkg) => (
                    <PackageCard key={pkg.id} pkg={pkg} />
                  ))}
                </div>

                {/* 分页 */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <Button
                      variant="secondary"
                      disabled={!pagination.hasPrev}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      上一页
                    </Button>

                    <div className="flex space-x-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded ${
                            page === currentPage
                              ? 'bg-green-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="secondary"
                      disabled={!pagination.hasNext}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      下一页
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏕️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  没有找到匹配的套餐
                </h3>
                <p className="text-gray-500 mb-4">
                  尝试调整搜索条件或清除筛选器
                </p>
                <Button variant="primary" onClick={clearFilters}>
                  清除筛选
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 删除确认模态框 */}
      <DeletePackageModal
        packageData={deleteModal.package}
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        hasBookings={deleteModal.package?.bookingCount > 0}
      />
    </div>
  )
}
