// lib/utils/price.js - 价格处理工具函数
/**
 * 将分为单位的价格转换为人民币格式
 * @param {number} priceInCents - 以分为单位的价格
 * @returns {string} 格式化的价格字符串
 */
export function formatPrice(priceInCents) {
  if (!priceInCents || priceInCents < 0) {
    return '¥0.00'
  }
  return `¥${(priceInCents / 100).toFixed(2)}`
}

/**
 * 将人民币价格转换为分为单位存储
 * @param {string|number} price - 价格（可以是字符串或数字）
 * @returns {number} 以分为单位的价格
 */
export function parsePriceToDb(price) {
  if (!price) return 0

  // 如果是字符串，先移除货币符号和空格
  if (typeof price === 'string') {
    price = price.replace(/[¥$,\s]/g, '')
  }

  const numPrice = parseFloat(price)
  if (isNaN(numPrice)) return 0

  return Math.round(numPrice * 100)
}

/**
 * 验证价格格式
 * @param {string|number} price - 价格
 * @returns {object} 验证结果
 */
export function validatePrice(price) {
  if (!price) {
    return { valid: false, message: '价格不能为空' }
  }

  const numPrice = typeof price === 'string'
    ? parseFloat(price.replace(/[¥$,\s]/g, ''))
    : price

  if (isNaN(numPrice)) {
    return { valid: false, message: '价格格式不正确' }
  }

  if (numPrice < 0) {
    return { valid: false, message: '价格不能为负数' }
  }

  if (numPrice > 999999) {
    return { valid: false, message: '价格不能超过999,999元' }
  }

  return { valid: true, value: numPrice }
}

/**
 * 计算总价（包含天数）
 * @param {number} dailyPrice - 每日价格（分为单位）
 * @param {number} duration - 天数
 * @returns {number} 总价（分为单位）
 */
export function calculateTotalPrice(dailyPrice, duration) {
  if (!dailyPrice || !duration || dailyPrice < 0 || duration < 0) {
    return 0
  }
  return dailyPrice * duration
}

/**
 * 格式化价格范围
 * @param {number} minPrice - 最低价格（分为单位）
 * @param {number} maxPrice - 最高价格（分为单位）
 * @returns {string} 格式化的价格范围
 */
export function formatPriceRange(minPrice, maxPrice) {
  if (!minPrice && !maxPrice) return '价格面议'
  if (!maxPrice || minPrice === maxPrice) return formatPrice(minPrice)
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
}
