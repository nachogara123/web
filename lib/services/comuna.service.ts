import { neon } from "@neondatabase/serverless"
import { getDatabaseUrl } from "../database"

const sql = neon(getDatabaseUrl())

export interface Comuna {
  id_comuna: number
  nombre: string
  codigo_postal?: string
  region: string
}

export interface CreateComunaData {
  nombre: string
  codigo_postal?: string
  region: string
}

export interface UpdateComunaData extends Partial<CreateComunaData> {}

export class ComunaService {
  static async obtenerTodas(): Promise<Comuna[]> {
    try {
      return await sql`
        SELECT * FROM comunas 
        ORDER BY region, nombre ASC
      `
    } catch (error) {
      console.error("Error obteniendo comunas:", error)
      throw new Error("Error al obtener comunas")
    }
  }

  static async obtenerPorId(id: number): Promise<Comuna | null> {
    try {
      const result = await sql`
        SELECT * FROM comunas WHERE id_comuna = ${id}
      `
      return result[0] || null
    } catch (error) {
      console.error("Error obteniendo comuna:", error)
      throw new Error("Error al obtener comuna")
    }
  }

  static async obtenerPorRegion(region: string): Promise<Comuna[]> {
    try {
      return await sql`
        SELECT * FROM comunas 
        WHERE region = ${region}
        ORDER BY nombre ASC
      `
    } catch (error) {
      console.error("Error obteniendo comunas por región:", error)
      throw new Error("Error al obtener comunas por región")
    }
  }

  static async obtenerRegiones(): Promise<string[]> {
    try {
      const result = await sql`
        SELECT DISTINCT region FROM comunas 
        ORDER BY region ASC
      `
      return result.map((row) => row.region)
    } catch (error) {
      console.error("Error obteniendo regiones:", error)
      throw new Error("Error al obtener regiones")
    }
  }

  static async crear(datos: CreateComunaData): Promise<Comuna> {
    try {
      const result = await sql`
        INSERT INTO comunas (nombre, codigo_postal, region)
        VALUES (${datos.nombre}, ${datos.codigo_postal || null}, ${datos.region})
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error("Error creando comuna:", error)
      throw new Error("Error al crear comuna")
    }
  }

  static async actualizar(id: number, datos: UpdateComunaData): Promise<Comuna> {
    try {
      const result = await sql`
        UPDATE comunas 
        SET ${sql(datos)}
        WHERE id_comuna = ${id}
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error("Error actualizando comuna:", error)
      throw new Error("Error al actualizar comuna")
    }
  }

  static async eliminar(id: number): Promise<void> {
    try {
      await sql`DELETE FROM comunas WHERE id_comuna = ${id}`
    } catch (error) {
      console.error("Error eliminando comuna:", error)
      throw new Error("Error al eliminar comuna")
    }
  }
}
