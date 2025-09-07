// components/form/Form.js - 完全重写
'use client'

import { useState } from 'react'

export const Form = ({ children, onSubmit, className = '' }) => {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit(e)
    } catch (error) {
      console.error('Form error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {children}
    </form>
  )
}

export default Form
