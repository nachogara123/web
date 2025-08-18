import { neon } from "@neondatabase/serverless"
import { getDatabaseUrl } from "../database"

const sql = neon(getDatabaseUrl())

export interface Canal {
  id_canal: number
  nombre: string
  descripcion?: string
  activo: boolean
  created_at: Date
  updated_at: Date
}

export interface CreateCanalData {
  nombre: string
  descripcion?: string
  activo?: boolean
}

export interface UpdateCanalData extends Partial<CreateCanalData> {}

export class CanalService {
  static async obtenerTodos(): Promise<Canal[]> {
    try {
      return await sql`
        SELECT * FROM canales 
        ORDER BY nombre ASC
      `
    } catch (error) {
      console.error("Error obteniendo canales:", error)
      throw new Error("Error al obtener canales")
    }
  }

  static async obtenerPorId(id: number): Promise<Canal | null> {
    try {
      const result = await sql`
        SELECT * FROM canales WHERE id_canal = ${id}
      `
      return result[0] || null
    } catch (error) {
      console.error("Error obteniendo canal:", error)
      throw new Error("Error al obtener canal")
    }
  }

  static async crear(datos: CreateCanalData): Promise<Canal> {
    try {
      const result = await sql`
        INSERT INTO canales (nombre, descripcion, activo)
        VALUES (${datos.nombre}, ${datos.descripcion || null}, ${datos.activo ?? true})
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error("Error creando canal:", error)
      throw new Error("Error al crear canal")
    }
  }

  static async actualizar(id: number, datos: UpdateCanalData): Promise<Canal> {
    try {
      const result = await sql`
        UPDATE canales 
        SET ${sql(datos)}, updated_at = NOW()
        WHERE id_canal = ${id}
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error("Error actualizando canal:", error)
      throw new Error("Error al actualizar canal")
    }
  }

  static async eliminar(id: number): Promise<void> {
    try {
      await sql`DELETE FROM canales WHERE id_canal = ${id}`
    } catch (error) {
      console.error("Error eliminando canal:", error)
      throw new Error("Error al eliminar canal")
    }
  }

  static async obtenerActivos(): Promise<Canal[]> {
    try {
      return await sql`
        SELECT * FROM canales 
        WHERE activo = true
        ORDER BY nombre ASC
      `
    } catch (error) {
      console.error("Error obteniendo canales activos:", error)
      throw new Error("Error al obtener canales activos")
    }
  }
}
