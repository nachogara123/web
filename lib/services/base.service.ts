import { prisma } from "../prisma"

export abstract class BaseService {
  protected static prisma = prisma

  protected static handleError(error: any, operation: string): never {
    console.error(`Error en ${operation}:`, error)
    throw new Error(`Falló la operación: ${operation}`)
  }
}
