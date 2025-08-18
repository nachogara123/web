import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Función para verificar la conexión
export async function verificarConexion() {
  try {
    await prisma.$connect()
    console.log("[v0] Conexión a la base de datos establecida correctamente")
    return true
  } catch (error) {
    console.error("[v0] Error al conectar con la base de datos:", error)
    return false
  }
}

// Función para cerrar la conexión
export async function cerrarConexion() {
  await prisma.$disconnect()
}
