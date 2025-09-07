// UI 组件导出
export { default as Button } from './Button'
export { default as Card } from './Card'
export { default as Input } from './Input'
export { default as Loading } from './Loading'

// 表单组件导出
export { default as Form } from '../form/Form'

// 批量导出
export const UI = {
  Button: require('./Button').default,
  Input: require('./Input').default,
  Card: require('./Card').default,
  Loading: require('./Loading').default,
  Form: require('../form/Form').default
}

// 类型定义（如果使用 TypeScript）
export const ComponentTypes = {
  ButtonVariants: ['primary', 'secondary', 'outline', 'danger', 'ghost', 'link'],
  ButtonSizes: ['sm', 'md', 'lg', 'xl'],
  InputTypes: ['text', 'email', 'password', 'number', 'tel', 'url'],
  InputSizes: ['sm', 'md', 'lg'],
  CardVariants: ['default', 'outlined', 'elevated', 'success', 'warning', 'error', 'info'],
  CardPaddings: ['none', 'sm', 'md', 'lg', 'xl'],
  LoadingSizes: ['sm', 'md', 'lg', 'xl'],
  LoadingColors: ['green', 'blue', 'gray', 'white']
}
