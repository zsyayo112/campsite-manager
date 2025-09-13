// src/app/api/packages/route.js - 套餐管理 API
import {
  createResponse,
  extractTokenFromRequest,
  hasRoleLevel,
  verifyToken
} from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { formatPrice, parsePriceToDb, validatePrice } from '../../../../lib/utils/price'

// GET /api/packages - 获取套餐列表
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    // 分页参数
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit

    // 搜索和过滤参数
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minCapacity = searchParams.get('minCapacity')
    const maxCapacity = searchParams.get('maxCapacity')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 构建查询条件
    const where = {}

    // 搜索条件 - SQLite不支持insensitive，改为使用LIKE
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ]
    }

    // 状态过滤
    if (status && ['ACTIVE', 'INACTIVE', 'DRAFT'].includes(status)) {
      where.status = status
    } else if (!status) {
      // 默认只显示活跃状态的套餐（对客户）
      const token = extractTokenFromRequest(request)
      const decoded = token ? verifyToken(token) : null

      if (!decoded || !hasRoleLevel(decoded.role || 'guest', 'staff')) {
        where.status = 'ACTIVE'
      }
    }

    // 价格范围过滤
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) {
        where.price.gte = parsePriceToDb(minPrice)
      }
      if (maxPrice) {
        where.price.lte = parsePriceToDb(maxPrice)
      }
    }

    // 容量范围过滤
    if (minCapacity || maxCapacity) {
      where.capacity = {}
      if (minCapacity) {
        where.capacity.gte = parseInt(minCapacity)
      }
      if (maxCapacity) {
        where.capacity.lte = parseInt(maxCapacity)
      }
    }

    // 排序选项
    const orderBy = {}
    orderBy[sortBy] = sortOrder

    // 执行查询
    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: { bookings: true }
          }
        }
      }),
      prisma.package.count({ where })
    ])

    // 格式化返回数据
    const formattedPackages = packages.map(pkg => ({
      ...pkg,
      priceFormatted: formatPrice(pkg.price),
      amenities: JSON.parse(pkg.amenities || '[]'),
      images: JSON.parse(pkg.images || '[]'),
      bookingCount: pkg._count.bookings
    }))

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }

    return createResponse(true, {
      packages: formattedPackages,
      pagination
    }, '获取套餐列表成功', 200)

  } catch (error) {
    console.error('获取套餐列表失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}

// POST /api/packages - 创建新套餐（仅管理员）
export async function POST(request) {
  try {
    // 验证身份和权限
    const token = extractTokenFromRequest(request)
    if (!token) {
      return createResponse(false, null, '未提供认证令牌', 401)
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return createResponse(false, null, '无效或过期的令牌', 401)
    }

    // 检查管理员权限
    if (!hasRoleLevel(decoded.role, 'admin')) {
      return createResponse(false, null, '权限不足，需要管理员权限', 403)
    }

    // 解析请求数据
    const body = await request.json()
    const {
      name,
      description,
      price,
      duration,
      capacity,
      amenities = [],
      images = [],
      status = 'DRAFT'
    } = body

    // 输入验证
    if (!name || !price || !duration || !capacity) {
      return createResponse(false, null, '套餐名称、价格、时长和容量都是必填的', 400)
    }

    // 验证套餐名称
    if (name.length < 2 || name.length > 100) {
      return createResponse(false, null, '套餐名称长度必须在2-100个字符之间', 400)
    }

    // 验证价格
    const priceValidation = validatePrice(price)
    if (!priceValidation.valid) {
      return createResponse(false, null, priceValidation.message, 400)
    }

    // 验证时长
    if (!Number.isInteger(duration) || duration < 1 || duration > 365) {
      return createResponse(false, null, '时长必须是1-365之间的整数', 400)
    }

    // 验证容量
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 50) {
      return createResponse(false, null, '容量必须是1-50之间的整数', 400)
    }

    // 验证状态
    if (!['ACTIVE', 'INACTIVE', 'DRAFT'].includes(status)) {
      return createResponse(false, null, '无效的套餐状态', 400)
    }

    // 检查套餐名称是否已存在
    const existingPackage = await prisma.package.findFirst({
      where: { name }
    })

    if (existingPackage) {
      return createResponse(false, null, '套餐名称已存在', 409)
    }

    // 创建套餐
    const newPackage = await prisma.package.create({
      data: {
        name,
        description: description || null,
        price: parsePriceToDb(price),
        duration,
        capacity,
        amenities: JSON.stringify(amenities),
        images: JSON.stringify(images),
        status
      }
    })

    // 格式化返回数据
    const formattedPackage = {
      ...newPackage,
      priceFormatted: formatPrice(newPackage.price),
      amenities: JSON.parse(newPackage.amenities),
      images: JSON.parse(newPackage.images)
    }

    return createResponse(true, {
      package: formattedPackage
    }, '套餐创建成功', 201)

  } catch (error) {
    console.error('创建套餐失败:', error)
    return createResponse(false, null, '服务器内部错误', 500)
  }
}
