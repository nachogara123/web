import { neon } from "@neondatabase/serverless"
import { getDatabaseUrl } from "../database"

const sql = neon(getDatabaseUrl())

export interface Clasificacion {
  id_clasificacion: number
  nombre: string
  descripcion?: string
  color_hex?: string
  activo: boolean
  created_at: Date
  updated_at: Date
}

export interface CreateClasificacionData {
  nombre: string
  descripcion?: string
  color_hex?: string
  activo?: boolean
}

export interface UpdateClasificacionData extends Partial<CreateClasificacionData> {}

export class ClasificacionService {
  static async obtenerTodas(): Promise<Clasificacion[]> {
    try {
      return await sql`
        SELECT * FROM clasificaciones 
        ORDER BY nombre ASC
      `
    } catch (error) {
      console.error("Error obteniendo clasificaciones:", error)
      throw new Error("Error al obtener clasificaciones")
    }
  }

  static async obtenerPorId(id: number): Promise<Clasificacion | null> {
    try {
      const result = await sql`
        SELECT * FROM clasificaciones WHERE id_clasificacion = ${id}
      `
      return result[0] || null
    } catch (error) {
      console.error("Error obteniendo clasificación:", error)
      throw new Error("Error al obtener clasificación")
    }
  }

  static async crear(datos: CreateClasificacionData): Promise<Clasificacion> {
    try {
      const result = await sql`
        INSERT INTO clasificaciones (nombre, descripcion, color_hex, activo)
        VALUES (${datos.nombre}, ${datos.descripcion || null}, ${datos.color_hex || null}, ${datos.activo ?? true})
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error("Error creando clasificación:", error)
      throw new Error("Error al crear clasificación")
    }
  }

  static async actualizar(id: number, datos: UpdateClasificacionData): Promise<Clasificacion> {
    try {
      const result = await sql`
        UPDATE clasificaciones 
        SET ${sql(datos)}, updated_at = NOW()
        WHERE id_clasificacion = ${id}
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error("Error actualizando clasificación:", error)
      throw new Error("Error al actualizar clasificación")
    }
  }

  static async eliminar(id: number): Promise<void> {
    try {
      await sql`DELETE FROM clasificaciones WHERE id_clasificacion = ${id}`
    } catch (error) {
      console.error("Error eliminando clasificación:", error)
      throw new Error("Error al eliminar clasificación")
    }
  }

  static async obtenerActivas(): Promise<Clasificacion[]> {
    try {
      return await sql`
        SELECT * FROM clasificaciones 
        WHERE activo = true
        ORDER BY nombre ASC
      `
    } catch (error) {
      console.error("Error obteniendo clasificaciones activas:", error)
      throw new Error("Error al obtener clasificaciones activas")
    }
  }
}
