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

// Función para verificar conexión
export async function verificarConexion() {
  try {
    await prisma.$connect()
    console.log("[v0] Conexión a base de datos exitosa")
    return true
  } catch (error) {
    console.error("[v0] Error conectando a base de datos:", error)
    return false
  }
}

// Función para obtener estadísticas generales
export async function obtenerEstadisticasGenerales() {
  try {
    const [usuarios, direcciones, equipos, planes] = await Promise.all([
      prisma.usuario.count(),
      prisma.direccion.count(),
      prisma.equipo.count(),
      prisma.planTrabajo.count(),
    ])

    return {
      usuarios,
      direcciones,
      equipos,
      planes,
    }
  } catch (error) {
    console.error("[v0] Error obteniendo estadísticas:", error)
    return {
      usuarios: 0,
      direcciones: 0,
      equipos: 0,
      planes: 0,
    }
  }
}

export default prisma
