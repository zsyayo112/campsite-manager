'use client'

// 旋转器组件
export const Spinner = ({
  size = 'md',
  color = 'green',
  className = ''
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const colors = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    white: 'text-white'
  }

  return (
    <svg
      className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// 骨架屏组件
export const Skeleton = ({
  variant = 'rectangular',
  width = 'w-full',
  height = 'h-4',
  className = ''
}) => {
  const baseStyles = 'animate-pulse bg-gray-200 rounded'

  const variants = {
    text: 'h-4',
    rectangular: 'h-12',
    circular: 'rounded-full h-12 w-12',
    avatar: 'rounded-full h-10 w-10'
  }

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${width} ${height} ${className}`}
    />
  )
}

// 加载覆盖层组件
export const LoadingOverlay = ({
  loading = false,
  children,
  text = '加载中...',
  className = ''
}) => {
  if (!loading) return children

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="flex flex-col items-center space-y-2">
          <Spinner size="lg" />
          <p className="text-sm text-gray-600">{text}</p>
        </div>
      </div>
    </div>
  )
}

// 页面加载组件
export const PageLoading = ({
  text = '页面加载中...',
  fullScreen = false
}) => {
  const containerClass = fullScreen
    ? 'fixed inset-0 bg-white z-50'
    : 'flex py-12'

  return (
    <div className={`${containerClass} flex items-center justify-center`}>
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="xl" />
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  )
}

// 内联加载组件
export const InlineLoading = ({
  text = '加载中',
  size = 'sm'
}) => {
  return (
    <div className="inline-flex items-center space-x-2">
      <Spinner size={size} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  )
}

// 按钮加载状态
export const ButtonLoading = ({
  loading = false,
  children,
  loadingText = '处理中...',
  ...props
}) => {
  return (
    <button
      disabled={loading}
      className={`inline-flex items-center justify-center ${loading ? 'cursor-wait opacity-75' : ''}`}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-2" />}
      {loading ? loadingText : children}
    </button>
  )
}

// 加载状态上下文
import { createContext, useContext, useState } from 'react'

const LoadingContext = createContext()

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('加载中...')

  const showLoading = (text = '加载中...') => {
    setLoadingText(text)
    setLoading(true)
  }

  const hideLoading = () => {
    setLoading(false)
  }

  return (
    <LoadingContext.Provider value={{
      loading,
      loadingText,
      showLoading,
      hideLoading
    }}>
      {children}
      {loading && <PageLoading text={loadingText} fullScreen />}
    </LoadingContext.Provider>
  )
}

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}

// 默认导出
const Loading = {
  Spinner,
  Skeleton,
  Overlay: LoadingOverlay,
  Page: PageLoading,
  Inline: InlineLoading,
  Button: ButtonLoading,
  Provider: LoadingProvider,
  useLoading
}

export default Loading
