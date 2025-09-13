// contexts/AuthContext.js - 增强错误处理
'use client'

import { createContext, useCallback, useContext, useReducer, useEffect } from 'react'

// 认证状态的初始值
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  initialized: false
}

// 认证状态的Action类型
const AuthActionTypes = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_INITIALIZED: 'SET_INITIALIZED'
}

// 认证状态的Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AuthActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload }

    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }

    case AuthActionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }

    case AuthActionTypes.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false }

    case AuthActionTypes.CLEAR_ERROR:
      return { ...state, error: null }

    case AuthActionTypes.SET_INITIALIZED:
      return { ...state, initialized: true, isLoading: false }

    default:
      return state
  }
}

// 安全的 JSON 解析函数
const safeJsonParse = async (response) => {
  try {
    const text = await response.text()
    if (!text) {
      throw new Error('Empty response')
    }
    return JSON.parse(text)
  } catch (error) {
    console.error('JSON 解析错误:', error)
    throw new Error('服务器响应格式错误')
  }
}

// 创建Context
const AuthContext = createContext()

// AuthProvider组件
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // 清除错误
  const clearError = useCallback(() => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR })
  }, [])

  // 登录函数
  const login = useCallback(async (email, password, rememberMe = false) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true })
      clearError()

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include'
      })

      const data = await safeJsonParse(response)

      if (data.success) {
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: { user: data.data.user }
        })
        return { success: true, user: data.data.user }
      } else {
        dispatch({
          type: AuthActionTypes.SET_ERROR,
          payload: data.message || '登录失败'
        })
        return { success: false, error: data.message }
      }
    } catch (error) {
      console.error('登录错误:', error)
      const errorMessage = error.message || '网络错误，请重试'
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }, [clearError])

  // 注册函数
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true })
      clearError()

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include'
      })

      const data = await safeJsonParse(response)

      if (data.success) {
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: { user: data.data.user }
        })
        return { success: true, user: data.data.user }
      } else {
        dispatch({
          type: AuthActionTypes.SET_ERROR,
          payload: data.message || '注册失败'
        })
        return { success: false, error: data.message }
      }
    } catch (error) {
      console.error('注册错误:', error)
      const errorMessage = error.message || '网络错误，请重试'
      dispatch({ type: AuthActionTypes.SET_ERROR, payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }, [clearError])

  // 修复后的登出函数
  const logout = useCallback(async () => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true })

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('登出API调用失败:', error)
    } finally {
      dispatch({ type: AuthActionTypes.LOGOUT })
      window.location.href = '/login'
    }
  }, [])

  // 检查认证状态
  const checkAuth = useCallback(async () => {
    if (state.initialized) {
      return { success: state.isAuthenticated, user: state.user }
    }

    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true })

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      })

      if (response.status === 401) {
        dispatch({ type: AuthActionTypes.SET_INITIALIZED })
        return { success: false }
      }

      const data = await safeJsonParse(response)

      if (data.success && data.data.user) {
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: { user: data.data.user }
        })
        dispatch({ type: AuthActionTypes.SET_INITIALIZED })
        return { success: true, user: data.data.user }
      } else {
        dispatch({ type: AuthActionTypes.SET_INITIALIZED })
        return { success: false }
      }
    } catch (error) {
      console.error('检查认证状态失败:', error)
      dispatch({ type: AuthActionTypes.SET_INITIALIZED })
      return { success: false }
    }
  }, [state.initialized, state.isAuthenticated, state.user])

  // 初始化时检查认证状态
  useEffect(() => {
    if (!state.initialized) {
      checkAuth()
    }
  }, [checkAuth, state.initialized])

  // Context值
  const value = {
    // 状态
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    initialized: state.initialized,

    // 方法
    login,
    register,
    logout,
    checkAuth,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 使用认证Context的Hook
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用')
  }

  return context
}

export default AuthContext
