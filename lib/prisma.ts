import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Conectado a la base de datos')
    return true
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error)
    return false
  }
}

export async function disconnectFromDatabase() {
  await prisma.$disconnect()
}
