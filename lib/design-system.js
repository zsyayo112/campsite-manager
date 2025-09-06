// lib/design-system.js
// 营地管理系统设计系统配置

export const designSystem = {
  // 颜色主题
  colors: {
    // 主要颜色 - 营地绿色主题
    primary: {
      50: '#f0fdf4',   // 很浅的绿色
      100: '#dcfce7',  // 浅绿色
      200: '#bbf7d0',  // 
      300: '#86efac',  // 
      400: '#4ade80',  // 
      500: '#22c55e',  // 标准绿色
      600: '#16a34a',  // 深绿色
      700: '#15803d',  // 很深的绿色
      800: '#166534',  // 
      900: '#14532d',  // 最深绿色
    },
    
    // 次要颜色 - 大自然蓝色
    secondary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',  // 标准蓝色
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // 中性色
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    
    // 状态颜色
    success: '#10b981',  // 成功 - 绿色
    warning: '#f59e0b',  // 警告 - 橙色
    error: '#ef4444',    // 错误 - 红色
    info: '#3b82f6',     // 信息 - 蓝色
  },
  
  // 字体规范
  typography: {
    // 字体大小
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    },
    
    // 字体粗细
    fontWeight: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    
    // 行高
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    }
  },
  
  // 间距系统 (基于 4px)
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    7: '28px',
    8: '32px',
    9: '36px',
    10: '40px',
    12: '48px',
    14: '56px',
    16: '64px',
    20: '80px',
    24: '96px',
    28: '112px',
    32: '128px',
  },
  
  // 圆角规范
  borderRadius: {
    none: '0px',
    sm: '2px',
    base: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
  },
  
  // 阴影规范
  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // 响应式断点
  breakpoints: {
    sm: '640px',   // 手机横屏及以上
    md: '768px',   // 平板及以上  
    lg: '1024px',  // 笔记本及以上
    xl: '1280px',  // 台式机及以上
    '2xl': '1536px' // 大屏幕
  },
  
  // 动画时间
  animation: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  }
}

// 导出常用的工具函数
export const getColor = (color, shade = 500) => {
  return designSystem.colors[color]?.[shade] || designSystem.colors[color]
}

export const getSpacing = (size) => {
  return designSystem.spacing[size]
}

export default designSystem