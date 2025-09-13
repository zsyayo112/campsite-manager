// lib/utils/editHistory.js - 编辑历史工具函数

/**
 * 生成编辑历史记录
 * @param {Object} oldData - 原始数据
 * @param {Object} newData - 新数据
 * @param {string} userId - 用户ID
 * @param {string} userName - 用户名称
 * @returns {Array} 编辑历史记录数组
 */
export function generateEditHistory(oldData, newData, userId = 'system', userName = '系统') {
  const changes = []
  const timestamp = new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  // 比较基本字段
  const fieldMap = {
    name: '套餐名称',
    description: '套餐描述',
    price: '价格',
    duration: '天数',
    capacity: '容量',
    status: '状态'
  }

  for (const [field, label] of Object.entries(fieldMap)) {
    if (oldData[field] !== newData[field]) {
      let oldValue = oldData[field]
      let newValue = newData[field]
      
      // 格式化特殊字段
      if (field === 'price') {
        oldValue = `¥${(oldValue / 100).toFixed(2)}`
        newValue = `¥${(newValue / 100).toFixed(2)}`
      } else if (field === 'duration') {
        oldValue = `${oldValue}天`
        newValue = `${newValue}天`
      } else if (field === 'capacity') {
        oldValue = `${oldValue}人`
        newValue = `${newValue}人`
      } else if (field === 'status') {
        const statusMap = {
          ACTIVE: '启用',
          INACTIVE: '停用',
          DRAFT: '草稿'
        }
        oldValue = statusMap[oldValue] || oldValue
        newValue = statusMap[newValue] || newValue
      }

      changes.push({
        action: `修改${label}`,
        timestamp,
        userId,
        userName,
        details: `从 "${oldValue}" 改为 "${newValue}"`
      })
    }
  }

  // 比较设施
  if (JSON.stringify(oldData.amenities) !== JSON.stringify(newData.amenities)) {
    const oldAmenities = oldData.amenities || []
    const newAmenities = newData.amenities || []
    
    const added = newAmenities.filter(item => !oldAmenities.includes(item))
    const removed = oldAmenities.filter(item => !newAmenities.includes(item))
    
    if (added.length > 0) {
      changes.push({
        action: '添加设施',
        timestamp,
        userId,
        userName,
        details: `新增: ${added.join(', ')}`
      })
    }
    
    if (removed.length > 0) {
      changes.push({
        action: '移除设施',
        timestamp,
        userId,
        userName,
        details: `移除: ${removed.join(', ')}`
      })
    }
  }

  // 比较图片
  if (JSON.stringify(oldData.images) !== JSON.stringify(newData.images)) {
    const oldImages = oldData.images || []
    const newImages = newData.images || []
    
    const added = newImages.filter(item => !oldImages.includes(item))
    const removed = oldImages.filter(item => !newImages.includes(item))
    
    if (added.length > 0) {
      changes.push({
        action: '添加图片',
        timestamp,
        userId,
        userName,
        details: `新增 ${added.length} 张图片`
      })
    }
    
    if (removed.length > 0) {
      changes.push({
        action: '移除图片',
        timestamp,
        userId,
        userName,
        details: `移除 ${removed.length} 张图片`
      })
    }
  }

  return changes
}

/**
 * 格式化编辑历史显示
 * @param {Array} history - 编辑历史记录
 * @returns {Array} 格式化后的历史记录
 */
export function formatEditHistory(history) {
  if (!Array.isArray(history)) return []
  
  return history.map(entry => ({
    ...entry,
    relativeTime: getRelativeTime(entry.timestamp),
    icon: getActionIcon(entry.action)
  }))
}

/**
 * 获取相对时间描述
 * @param {string} timestamp - 时间戳
 * @returns {string} 相对时间描述
 */
function getRelativeTime(timestamp) {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  
  return timestamp
}

/**
 * 获取操作图标类型
 * @param {string} action - 操作类型
 * @returns {string} 图标类型
 */
function getActionIcon(action) {
  if (action.includes('创建')) return 'create'
  if (action.includes('修改')) return 'edit'
  if (action.includes('添加')) return 'add'
  if (action.includes('移除') || action.includes('删除')) return 'remove'
  if (action.includes('启用')) return 'activate'
  if (action.includes('停用')) return 'deactivate'
  return 'default'
}

/**
 * 合并编辑历史记录
 * @param {Array} existingHistory - 现有历史记录
 * @param {Array} newHistory - 新的历史记录
 * @returns {Array} 合并后的历史记录
 */
export function mergeEditHistory(existingHistory = [], newHistory = []) {
  const combined = [...existingHistory, ...newHistory]
  
  // 按时间排序（最新的在前）
  return combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

/**
 * 获取操作统计
 * @param {Array} history - 编辑历史记录
 * @returns {Object} 操作统计信息
 */
export function getEditStats(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return {
      totalEdits: 0,
      lastEdit: null,
      mostActiveDay: null,
      editsByAction: {}
    }
  }
  
  const editsByAction = {}
  const editsByDate = {}
  
  history.forEach(entry => {
    // 统计操作类型
    const actionType = entry.action.split(/修改|添加|移除/)[0] || entry.action
    editsByAction[actionType] = (editsByAction[actionType] || 0) + 1
    
    // 统计日期
    const dateKey = entry.timestamp.split(' ')[0]
    editsByDate[dateKey] = (editsByDate[dateKey] || 0) + 1
  })
  
  const mostActiveDay = Object.entries(editsByDate)
    .sort(([,a], [,b]) => b - a)[0]
  
  return {
    totalEdits: history.length,
    lastEdit: history[0]?.timestamp,
    mostActiveDay: mostActiveDay ? {
      date: mostActiveDay[0],
      count: mostActiveDay[1]
    } : null,
    editsByAction
  }
}

/**
 * 搜索编辑历史
 * @param {Array} history - 编辑历史记录
 * @param {string} query - 搜索关键词
 * @returns {Array} 搜索结果
 */
export function searchEditHistory(history, query) {
  if (!query || !Array.isArray(history)) return history
  
  const searchTerm = query.toLowerCase()
  
  return history.filter(entry => 
    entry.action.toLowerCase().includes(searchTerm) ||
    (entry.details && entry.details.toLowerCase().includes(searchTerm)) ||
    (entry.userName && entry.userName.toLowerCase().includes(searchTerm))
  )
}