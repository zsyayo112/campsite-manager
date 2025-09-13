// lib/utils/booking.js - 预订业务逻辑工具函数
import { prisma } from '../prisma'
import { calculateTotalPrice } from './price'

/**
 * 生成预订确认码
 * @returns {string} 唯一的确认码
 */
export function generateConfirmationCode() {
  const prefix = 'CAMP'
  const year = new Date().getFullYear()
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}-${year}-${randomNum}`
}

/**
 * 检查预订确认码是否唯一
 * @param {string} code - 确认码
 * @returns {Promise<boolean>} 是否唯一
 */
export async function isConfirmationCodeUnique(code) {
  const existing = await prisma.booking.findUnique({
    where: { confirmationCode: code }
  })
  return !existing
}

/**
 * 生成唯一的确认码
 * @returns {Promise<string>} 唯一的确认码
 */
export async function generateUniqueConfirmationCode() {
  let code
  let isUnique = false
  let attempts = 0
  const maxAttempts = 10

  while (!isUnique && attempts < maxAttempts) {
    code = generateConfirmationCode()
    isUnique = await isConfirmationCodeUnique(code)
    attempts++
  }

  if (!isUnique) {
    throw new Error('生成唯一确认码失败')
  }

  return code
}

/**
 * 检查套餐在指定日期范围内的可用性
 * @param {string} packageId - 套餐ID
 * @param {Date} checkIn - 入住日期
 * @param {Date} checkOut - 退房日期
 * @param {number} guestCount - 客人数量
 * @param {string} excludeBookingId - 排除的预订ID（编辑时使用）
 * @returns {Promise<Object>} 可用性检查结果
 */
export async function checkAvailability(packageId, checkIn, checkOut, guestCount, excludeBookingId = null) {
  try {
    // 1. 验证日期参数
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      return {
        available: false,
        reason: 'INVALID_DATES',
        message: '入住日期必须早于退房日期'
      }
    }

    const now = new Date()
    if (checkIn < now) {
      return {
        available: false,
        reason: 'PAST_DATE',
        message: '入住日期不能是过去的日期'
      }
    }

    // 2. 获取套餐信息
    const packageInfo = await prisma.package.findUnique({
      where: { id: packageId },
      select: {
        id: true,
        name: true,
        capacity: true,
        status: true,
        price: true,
        duration: true
      }
    })

    if (!packageInfo) {
      return {
        available: false,
        reason: 'PACKAGE_NOT_FOUND',
        message: '套餐不存在'
      }
    }

    if (packageInfo.status !== 'ACTIVE') {
      return {
        available: false,
        reason: 'PACKAGE_UNAVAILABLE',
        message: '套餐当前不可预订'
      }
    }

    // 3. 检查容量
    if (guestCount > packageInfo.capacity) {
      return {
        available: false,
        reason: 'CAPACITY_EXCEEDED',
        message: `客人数量超过套餐容量限制（最多${packageInfo.capacity}人）`
      }
    }

    // 4. 检查日期冲突
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        packageId: packageId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] // 只检查有效状态的预订
        },
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        OR: [
          // 新预订的入住日期在现有预订期间
          {
            AND: [
              { checkIn: { lte: checkIn } },
              { checkOut: { gt: checkIn } }
            ]
          },
          // 新预订的退房日期在现有预订期间
          {
            AND: [
              { checkIn: { lt: checkOut } },
              { checkOut: { gte: checkOut } }
            ]
          },
          // 新预订完全包含现有预订
          {
            AND: [
              { checkIn: { gte: checkIn } },
              { checkOut: { lte: checkOut } }
            ]
          },
          // 现有预订完全包含新预订
          {
            AND: [
              { checkIn: { lte: checkIn } },
              { checkOut: { gte: checkOut } }
            ]
          }
        ]
      },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        guestCount: true,
        confirmationCode: true,
        status: true
      }
    })

    if (conflictingBookings.length > 0) {
      return {
        available: false,
        reason: 'DATE_CONFLICT',
        message: '所选日期与现有预订冲突',
        conflicts: conflictingBookings.map(booking => ({
          id: booking.id,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          confirmationCode: booking.confirmationCode,
          status: booking.status
        }))
      }
    }

    // 5. 计算预订天数和价格
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
    const totalPrice = calculateTotalPrice(packageInfo.price, days)

    return {
      available: true,
      packageInfo: {
        id: packageInfo.id,
        name: packageInfo.name,
        capacity: packageInfo.capacity,
        pricePerDay: packageInfo.price,
        duration: packageInfo.duration
      },
      bookingDetails: {
        days,
        totalPrice,
        pricePerDay: packageInfo.price
      }
    }

  } catch (error) {
    console.error('可用性检查失败:', error)
    return {
      available: false,
      reason: 'SYSTEM_ERROR',
      message: '系统错误，请稍后重试'
    }
  }
}

/**
 * 计算预订的详细价格信息
 * @param {number} dailyPrice - 每日价格（分为单位）
 * @param {number} days - 天数
 * @param {number} guestCount - 客人数量
 * @param {number} capacity - 套餐容量
 * @returns {Object} 价格详情
 */
export function calculateBookingPrice(dailyPrice, days, guestCount, capacity) {
  // 基础价格
  const basePrice = calculateTotalPrice(dailyPrice, days)

  // 超员费用计算（如果客人数量超过基础容量的80%）
  const baseCapacity = Math.ceil(capacity * 0.8)
  let extraFee = 0

  if (guestCount > baseCapacity) {
    const extraGuests = guestCount - baseCapacity
    const extraFeePerDay = Math.round(dailyPrice * 0.2) // 额外客人费用为每日价格的20%
    extraFee = extraFeePerDay * extraGuests * days
  }

  const totalPrice = basePrice + extraFee

  return {
    basePrice,
    extraFee,
    totalPrice,
    days,
    pricePerDay: dailyPrice,
    breakdown: {
      baseAmount: basePrice,
      extraGuestFee: extraFee,
      extraGuests: guestCount > baseCapacity ? guestCount - baseCapacity : 0
    }
  }
}

/**
 * 验证预订输入数据
 * @param {Object} bookingData - 预订数据
 * @returns {Object} 验证结果
 */
export function validateBookingData(bookingData) {
  const { packageId, checkIn, checkOut, guestCount, userId } = bookingData

  // 必填字段检查
  if (!packageId || !checkIn || !checkOut || !guestCount || !userId) {
    return {
      valid: false,
      message: '套餐ID、入住日期、退房日期、客人数量和用户ID都是必填的'
    }
  }

  // 日期格式检查
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return {
      valid: false,
      message: '日期格式不正确'
    }
  }

  // 客人数量检查
  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 50) {
    return {
      valid: false,
      message: '客人数量必须是1-50之间的整数'
    }
  }

  return { valid: true }
}

/**
 * 获取预订状态的中文描述
 * @param {string} status - 预订状态
 * @returns {string} 中文描述
 */
export function getBookingStatusText(status) {
  const statusMap = {
    PENDING: '待确认',
    CONFIRMED: '已确认',
    CHECKED_IN: '已入住',
    CHECKED_OUT: '已退房',
    CANCELLED: '已取消',
    REFUNDED: '已退款'
  }
  return statusMap[status] || '未知状态'
}

/**
 * 检查预订状态是否可以变更
 * @param {string} currentStatus - 当前状态
 * @param {string} newStatus - 新状态
 * @returns {Object} 检查结果
 */
export function canChangeBookingStatus(currentStatus, newStatus) {
  // 定义允许的状态转换
  const allowedTransitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['CHECKED_IN', 'CANCELLED'],
    CHECKED_IN: ['CHECKED_OUT'],
    CHECKED_OUT: ['REFUNDED'],
    CANCELLED: ['REFUNDED'],
    REFUNDED: [] // 最终状态，不能再变更
  }

  const allowed = allowedTransitions[currentStatus] || []

  if (!allowed.includes(newStatus)) {
    return {
      canChange: false,
      message: `不能从"${getBookingStatusText(currentStatus)}"状态变更为"${getBookingStatusText(newStatus)}"`
    }
  }

  return { canChange: true }
}
