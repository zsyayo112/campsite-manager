'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button, Checkbox, ErrorMessage, Input, LoadingSpinner, Select } from '../../../components/ui/FormComponents'
import { useAuth } from '../../contexts/AuthContext'

const roleOptions = [
  { value: 'admin', label: '系统管理员' },
  { value: 'staff', label: '营地员工' },
  { value: 'guest', label: '客户' }
]

export default function RegisterPage() {
  const router = useRouter()
  const { register, login, isAuthenticated, isLoading, error, clearError } = useAuth()

  // 表单状态
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    agreeTerms: false
  })

  // 表单验证错误
  const [formErrors, setFormErrors] = useState({})

  // 提交状态
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 如果已登录，重定向到仪表板
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  // 清除错误当组件挂载时
  useEffect(() => {
    clearError()
  }, [clearError])

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // 清除对应字段的错误
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // 清除全局错误
    if (error) {
      clearError()
    }
  }

  // 表单验证
  const validateForm = () => {
    const errors = {}

    // 用户名验证
    if (!formData.username) {
      errors.username = '用户名不能为空'
    } else if (formData.username.length < 3) {
      errors.username = '用户名至少需要3个字符'
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = '用户名只能包含字母、数字、下划线和连字符'
    }

    // 邮箱验证
    if (!formData.email) {
      errors.email = '邮箱不能为空'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '邮箱格式不正确'
    }

    // 角色验证
    if (!formData.role) {
      errors.role = '请选择账户类型'
    }

    // 密码验证
    if (!formData.password) {
      errors.password = '密码不能为空'
    } else if (formData.password.length < 8) {
      errors.password = '密码至少需要8位字符'
    } else if (!/(?=.*[a-zA-Z])/.test(formData.password)) {
      errors.password = '密码必须包含字母'
    }

    // 确认密码验证
    if (!formData.confirmPassword) {
      errors.confirmPassword = '请确认密码'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致'
    }

    // 协议同意验证
    if (!formData.agreeTerms) {
      errors.agreeTerms = '请同意服务条款和隐私政策'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const { confirmPassword, agreeTerms, ...userData } = formData
      const result = await register(userData)

      if (result.success) {
        // 注册成功，重定向将由useEffect处理
        router.push('/dashboard')
      }
      // 错误处理由AuthContext处理
    } catch (error) {
      console.error('注册时发生错误:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  //在注册页面的 handleQuickDemo 函数中使用强制跳转
  const handleQuickDemo = async () => {
  setIsSubmitting(true)
  try {
    const result = await login('guest@campsite.com', 'guest123')
    console.log('登录结果:', result)

    if (result.success) {
      // 直接强制跳转，绕过 React 状态管理
      window.location.href = '/dashboard'
    }
  } catch (error) {
    console.error('演示登录失败:', error)
  } finally {
    setIsSubmitting(false)
  }
}

  // 如果正在检查认证状态，显示加载
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 头部 */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">🏕️</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">创建新账户</h2>
          <p className="mt-2 text-sm text-gray-600">加入营地管理系统</p>
        </div>

        {/* 注册表单 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* 错误提示 */}
          {error && <ErrorMessage error={error} className="mb-6" />}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 用户名输入 */}
            <Input
              label="用户名"
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              placeholder="请输入用户名"
              value={formData.username}
              onChange={handleInputChange}
              error={formErrors.username}
            />

            {/* 邮箱输入 */}
            <Input
              label="邮箱地址"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="请输入您的邮箱"
              value={formData.email}
              onChange={handleInputChange}
              error={formErrors.email}
            />

            {/* 角色选择 */}
            <Select
              label="账户类型"
              id="role"
              name="role"
              required
              placeholder="请选择账户类型"
              value={formData.role}
              onChange={handleInputChange}
              options={roleOptions}
              error={formErrors.role}
            />

            {/* 密码输入 */}
            <Input
              label="密码"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="请输入密码（至少8位）"
              value={formData.password}
              onChange={handleInputChange}
              error={formErrors.password}
            />

            {/* 确认密码 */}
            <Input
              label="确认密码"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="请再次输入密码"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              error={formErrors.confirmPassword}
            />

            {/* 协议同意 */}
            <Checkbox
              id="agreeTerms"
              name="agreeTerms"
              required
              checked={formData.agreeTerms}
              onChange={handleInputChange}
              error={formErrors.agreeTerms}
              label={
                <>
                  我同意{' '}
                  <a
                    href="#"
                    className="font-medium text-green-600 hover:text-green-500"
                  >
                    服务条款
                  </a>{' '}
                  和{' '}
                  <a
                    href="#"
                    className="font-medium text-green-600 hover:text-green-500"
                  >
                    隐私政策
                  </a>
                </>
              }
            />

            {/* 注册按钮 */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              {isSubmitting ? '创建中...' : '创建账户'}
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

            {/* 修复后的快速体验 */}
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleQuickDemo}
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {isSubmitting ? '登录中...' : '快速体验（客户账户）'}
            </Button>
          </form>

          {/* 登录链接 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              已有账户？{' '}
              <Link
                href="/login"
                className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200"
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>

        {/* 返回首页 */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            ← 返回首页
          </Link>
        </div>

        {/* 更新后的注册须知 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-yellow-600 mr-2 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 14.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <p className="text-sm text-yellow-800 font-medium">演示账户信息</p>
              <ul className="text-xs text-yellow-700 mt-1 space-y-1">
                <li>• 快速体验使用客户账户：guest@campsite.com</li>
                <li>• 管理员账户：admin@campsite.com / admin123</li>
                <li>• 员工账户：staff@campsite.com / staff123</li>
                <li>• 客户账户：guest@campsite.com / guest123</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
