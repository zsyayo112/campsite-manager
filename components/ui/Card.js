import { forwardRef } from 'react'

const Card = forwardRef(({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  hover = false,  // 提取 hover 属性
  className = '',
  ...props  // 其余属性
}, ref) => {

  // 基础样式
  const baseStyles = 'bg-white rounded-lg border transition-all duration-200'

  // 变体样式
  const variants = {
    default: 'border-gray-200',
    outlined: 'border-gray-300',
    elevated: 'border-gray-100',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50'
  }

  // 内边距样式
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }

  // 阴影样式
  const shadows = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }

  // 悬停效果
  const hoverStyles = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : ''

  // 组合样式
  const cardClasses = [
    baseStyles,
    variants[variant],
    paddings[padding],
    shadows[shadow],
    hoverStyles,
    className
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={ref}
      className={cardClasses}
      {...props}  // 现在 props 中不包含 hover 了
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

// 子组件定义保持不变
const CardHeader = ({ children, className = '' }) => (
  <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`}>
    {children}
  </div>
)

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
)

const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
)

const CardFooter = ({ children, className = '' }) => (
  <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`}>
    {children}
  </div>
)

// 附加子组件
Card.Header = CardHeader
Card.Title = CardTitle
Card.Content = CardContent
Card.Footer = CardFooter

export default Card
