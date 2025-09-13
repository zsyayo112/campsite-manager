'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button, LoadingSpinner } from '../../components/ui/FormComponents'

interface Package {
  id: string
  name: string
  description?: string
  capacity: number
  duration: number
  priceFormatted: string
  amenities: string[]
  images: string[]
}

export default function Home() {
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(false)

  // 获取热门套餐
  useEffect(() => {
    const fetchPopularPackages = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/packages?limit=3&status=active')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setPackages(data.data.packages || [])
          }
        }
      } catch (error) {
        console.error('获取套餐失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPopularPackages()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* 顶部导航区域 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">🏕️</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                营地管理系统
              </h1>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/packages"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                浏览套餐
              </Link>
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                注册
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 欢迎区域 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            欢迎来到
            <span className="text-green-600 block">营地管理系统</span>
          </h2>
          <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-600">
            专业的营地预订管理平台，提供舒适的户外住宿体验
          </p>
          <div className="mt-10 flex justify-center space-x-6">
            <Link
              href="/packages"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-200"
            >
              立即预订
            </Link>
            <Link
              href="/login"
              className="border-2 border-green-600 text-green-600 hover:bg-green-50 font-bold py-3 px-8 rounded-lg text-lg transition duration-200"
            >
              管理登录
            </Link>
          </div>
        </div>

        {/* 热门套餐展示 */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900">
              热门套餐推荐
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              精选最受欢迎的营地住宿套餐
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {packages.map((pkg: Package) => (
                <div key={pkg.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  {/* 套餐图片 */}
                  {pkg.images && pkg.images.length > 0 && (
                    <div className="h-48 bg-gray-200">
                      <img
                        src={pkg.images[0]}
                        alt={pkg.name}
                        className="w-full h-full object-cover"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-semibold text-gray-900">{pkg.name}</h4>
                      <span className="text-2xl font-bold text-green-600">{pkg.priceFormatted}</span>
                    </div>
                    
                    {pkg.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>
                    )}
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {pkg.capacity} 人
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {pkg.duration} 天
                      </div>
                    </div>
                    
                    {pkg.amenities && pkg.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {pkg.amenities.slice(0, 3).map((amenity: string, index: number) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {amenity}
                          </span>
                        ))}
                        {pkg.amenities.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{pkg.amenities.length - 3} 更多
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex space-x-3">
                      <Link
                        href={`/packages/${pkg.id}`}
                        className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-200"
                      >
                        查看详情
                      </Link>
                      <Link
                        href={`/bookings/new?packageId=${pkg.id}`}
                        className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                      >
                        立即预订
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>暂无套餐信息</p>
              <Link href="/login" className="text-green-600 hover:text-green-700 font-medium mt-2 inline-block">
                管理员登录后添加套餐 →
              </Link>
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/packages"
              className="inline-flex items-center px-6 py-3 border border-green-600 text-green-600 hover:bg-green-50 font-medium rounded-lg transition duration-200"
            >
              查看所有套餐
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* 功能特性区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* 在线预订 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              在线预订
            </h3>
            <p className="text-gray-600">
              24小时在线预订系统，实时查看可用性，即时确认
            </p>
          </div>

          {/* 多样套餐 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
            <div className="text-3xl mb-4">🏕️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              多样套餐
            </h3>
            <p className="text-gray-600">
              从基础露营到豪华体验，多种套餐满足不同需求
            </p>
          </div>

          {/* 专业服务 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              专业服务
            </h3>
            <p className="text-gray-600">
              专业团队提供7x24小时服务，确保您的户外体验
            </p>
          </div>

          {/* 安全保障 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
            <div className="text-3xl mb-4">🛡️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              安全保障
            </h3>
            <p className="text-gray-600">
              完善的安全设施和应急预案，保障您的安全
            </p>
          </div>
        </div>

        {/* 预订流程 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900">
              简单的预订流程
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              只需四步，即可完成预订
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">选择套餐</h4>
              <p className="text-gray-600">浏览套餐，选择心仪的住宿体验</p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">填写信息</h4>
              <p className="text-gray-600">输入住宿日期和客人信息</p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">确认预订</h4>
              <p className="text-gray-600">确认预订信息，获得确认码</p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-green-600">4</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">入住体验</h4>
              <p className="text-gray-600">按时到达，享受美好的户外时光</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/packages"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-200"
            >
              开始预订
            </Link>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">🏕️</span>
                </div>
                <h3 className="text-xl font-bold">营地管理系统</h3>
              </div>
              <p className="text-gray-300 mb-4">
                专业的营地预订管理平台，提供舒适的户外住宿体验。
              </p>
              <p className="text-sm text-gray-400">
                技术栈：Next.js, React, Tailwind CSS, Prisma
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">快速链接</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/packages" className="hover:text-white transition-colors">浏览套餐</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">用户登录</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">注册账户</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">用户中心</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2 text-gray-300">
                <li>📞 客服电话: 400-123-4567</li>
                <li>📧 邮箱: info@campsite.com</li>
                <li>🕒 服务时间: 24小时</li>
                <li>📍 地址: 示例地址</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 营地管理系统 - 学习项目，持续开发中
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
