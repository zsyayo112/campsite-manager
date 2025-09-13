'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useEffect, useState } from 'react'
import { Button, LoadingSpinner } from '../../../../components/ui/FormComponents'
import { useAuth } from '../../../contexts/AuthContext'

export default function PackageDetailPage({ params }) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [packageData, setPackageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 解包 params Promise
  const resolvedParams = use(params)

  // 获取套餐详情
  const fetchPackageDetail = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/packages/${resolvedParams.id}`)
      const data = await response.json()

      if (data.success) {
        setPackageData(data.data.package)
      } else {
        setError(data.message || '获取套餐详情失败')
      }
    } catch (error) {
      console.error('获取套餐详情失败:', error)
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (resolvedParams.id) {
      fetchPackageDetail()
    }
  }, [resolvedParams.id])

  // 图片查看器状态
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={fetchPackageDetail} variant="primary">
              重试
            </Button>
            <Link href="/packages">
              <Button variant="secondary">
                返回套餐列表
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">套餐不存在</h2>
          <Link href="/packages">
            <Button variant="primary">
              返回套餐列表
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑导航 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-400 hover:text-gray-500">
                  首页
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <Link href="/packages" className="text-gray-400 hover:text-gray-500">
                  套餐列表
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900 font-medium">{packageData.name}</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* 图片区域 */}
            <div>
              {/* 主图片 */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden mb-4">
                {packageData.images && packageData.images.length > 0 ? (
                  <img
                    src={packageData.images[selectedImageIndex] || packageData.images[0]}
                    alt={packageData.name}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = '/images/packages/default-package.jpg'
                    }}
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center text-gray-400 bg-gray-100 rounded-lg">
                    <span className="text-6xl">🏕️</span>
                  </div>
                )}
              </div>

              {/* 图片缩略图 */}
              {packageData.images && packageData.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {packageData.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-w-16 aspect-h-9 rounded-md overflow-hidden border-2 ${
                        selectedImageIndex === index ? 'border-green-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${packageData.name} ${index + 1}`}
                        className="w-full h-16 object-cover"
                        onError={(e) => {
                          e.target.src = '/images/packages/default-package.jpg'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 信息区域 */}
            <div>
              {/* 套餐标题和状态 */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {packageData.name}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>ID: {packageData.id.slice(-8)}</span>
                    <span>创建时间: {new Date(packageData.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>

                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  packageData.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  packageData.status === 'INACTIVE' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {packageData.status === 'ACTIVE' ? '可预订' :
                   packageData.status === 'INACTIVE' ? '暂停' : '草稿'}
                </span>
              </div>

              {/* 价格和基本信息 */}
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {packageData.priceFormatted}
                    </p>
                    <p className="text-sm text-gray-600">总价</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {packageData.duration}天
                    </p>
                    <p className="text-sm text-gray-600">时长</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {packageData.capacity}人
                    </p>
                    <p className="text-sm text-gray-600">容量</p>
                  </div>
                </div>
              </div>

              {/* 套餐描述 */}
              {packageData.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">套餐描述</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {packageData.description}
                  </p>
                </div>
              )}

              {/* 包含设施 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">包含设施</h3>
                <div className="grid grid-cols-2 gap-2">
                  {packageData.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              {/* 预订统计（仅员工和管理员可见） */}
              {(user?.role === 'admin' || user?.role === 'staff') && packageData.bookingStats && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">预订统计</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">总预订数:</span>
                      <span className="ml-2 font-semibold">{packageData.bookingStats.total}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">已确认:</span>
                      <span className="ml-2 font-semibold">{packageData.bookingStats.confirmed}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">待确认:</span>
                      <span className="ml-2 font-semibold">{packageData.bookingStats.pending}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">本月预订:</span>
                      <span className="ml-2 font-semibold">{packageData.bookingStats.currentMonth}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="space-y-3">
                {packageData.status === 'ACTIVE' && (
                  <Link href={`/bookings/new?packageId=${packageData.id}`} className="block">
                    <Button variant="primary" size="lg" className="w-full">
                      立即预订
                    </Button>
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <div className="flex gap-3">
                    <Link href={`/packages/${packageData.id}/edit`} className="flex-1">
                      <Button variant="secondary" className="w-full">
                        编辑套餐
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (confirm('确定要删除这个套餐吗？')) {
                          // 删除逻辑
                        }
                      }}
                    >
                      删除
                    </Button>
                  </div>
                )}

                <Link href="/packages">
                  <Button variant="secondary" className="w-full">
                    返回套餐列表
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* 即将到来的预订（仅员工和管理员可见） */}
          {(user?.role === 'admin' || user?.role === 'staff') &&
           packageData.upcomingBookings &&
           packageData.upcomingBookings.length > 0 && (
            <div className="border-t px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">即将到来的预订</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">客户</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">入住日期</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">退房日期</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">人数</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {packageData.upcomingBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {booking.guestName}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {new Date(booking.checkIn).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {new Date(booking.checkOut).toLocaleDateString('zh-CN')}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {booking.guestCount}人
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {booking.status === 'CONFIRMED' ? '已确认' :
                             booking.status === 'PENDING' ? '待确认' : '已入住'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 相关推荐（可选实现） */}
        <div className="mt-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              其他推荐套餐
            </h2>
            <Link href="/packages">
              <Button variant="primary">
                查看更多套餐
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
