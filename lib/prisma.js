// lib/prisma.js - Prisma客户端单例
import { PrismaClient } from '@prisma/client'

// 使用单例模式避免在开发环境中创建多个Prisma客户端实例
const globalForPrisma = globalThis

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma

// 在生产环境中防止创建多个实例
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
