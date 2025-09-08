'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, ErrorMessage, Input } from '../../../components/ui/FormComponents'
import { useAuth } from '../../contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuth()

  // 表单状态
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // 清除错误
    if (error) clearError()
  }

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      return
    }

    const result = await login(formData.email, formData.password)

    if (result.success) {
      router.push('/dashboard')
    }
  }

  // 演示登录
  const handleDemoLogin = async () => {
    const result = await login('admin@campsite.com', 'admin123')

    if (result.success) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* 头部 */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">🏕️</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            登录您的账户
          </h2>
          <p className="mt-2 text-sm text-gray-600">欢迎回到营地管理系统</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {error && <ErrorMessage error={error} className="mb-6" />}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 邮箱输入 */}
            <Input
              label="邮箱地址"
              id="email"
              name="email"
              type="email"
              required
              placeholder="请输入您的邮箱"
              value={formData.email}
              onChange={handleInputChange}
            />

            {/* 密码输入 */}
            <Input
              label="密码"
              id="password"
              name="password"
              type="password"
              required
              placeholder="请输入您的密码"
              value={formData.password}
              onChange={handleInputChange}
            />

            {/* 登录按钮 */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={isLoading || !formData.email || !formData.password}
              className="w-full"
            >
              {isLoading ? '登录中...' : '登录系统'}
            </Button>

            {/* 分割线 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">或者</span>
              </div>
            </div>

            {/* 演示登录 */}
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleDemoLogin}
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              演示登录（管理员账户）
            </Button>
          </form>

          {/* 注册链接 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              还没有账户？{' '}
              <Link
                href="/register"
                className="font-medium text-green-600 hover:text-green-500"
              >
                立即注册
              </Link>
            </p>
          </div>
        </div>

        {/* 返回首页 */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← 返回首页
          </Link>
        </div>

        {/* 测试账户信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-blue-600 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm text-blue-800 font-medium">测试账户</p>
              <p className="text-xs text-blue-700 mt-1">
                管理员：admin@campsite.com / admin123
              </p>
              <p className="text-xs text-blue-700">
                员工：staff@campsite.com / staff123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
