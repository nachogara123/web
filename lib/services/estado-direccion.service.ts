import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface EstadoDireccion {
  id_estado: number
  nombre: string
  descripcion?: string
  color_hex?: string
  activo: boolean
  created_at: Date
  updated_at: Date
}

export interface CreateEstadoDireccionData {
  nombre: string
  descripcion?: string
  color_hex?: string
  activo?: boolean
}

export interface UpdateEstadoDireccionData extends Partial<CreateEstadoDireccionData> {}

export class EstadoDireccionService {
  static async obtenerTodos(): Promise<EstadoDireccion[]> {
    try {
      return await sql`
        SELECT * FROM estados_direcciones 
        ORDER BY nombre ASC
      `
    } catch (error) {
      console.error("Error obteniendo estados:", error)
      throw new Error("Error al obtener estados")
    }
  }

  static async obtenerPorId(id: number): Promise<EstadoDireccion | null> {
    try {
      const result = await sql`
        SELECT * FROM estados_direcciones WHERE id_estado = ${id}
      `
      return result[0] || null
    } catch (error) {
      console.error("Error obteniendo estado:", error)
      throw new Error("Error al obtener estado")
    }
  }

  static async crear(datos: CreateEstadoDireccionData): Promise<EstadoDireccion> {
    try {
      const result = await sql`
        INSERT INTO estados_direcciones (nombre, descripcion, color_hex, activo)
        VALUES (${datos.nombre}, ${datos.descripcion || null}, ${datos.color_hex || null}, ${datos.activo ?? true})
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error("Error creando estado:", error)
      throw new Error("Error al crear estado")
    }
  }

  static async actualizar(id: number, datos: UpdateEstadoDireccionData): Promise<EstadoDireccion> {
    try {
      const result = await sql`
        UPDATE estados_direcciones 
        SET ${sql(datos)}, updated_at = NOW()
        WHERE id_estado = ${id}
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error("Error actualizando estado:", error)
      throw new Error("Error al actualizar estado")
    }
  }

  static async eliminar(id: number): Promise<void> {
    try {
      await sql`DELETE FROM estados_direcciones WHERE id_estado = ${id}`
    } catch (error) {
      console.error("Error eliminando estado:", error)
      throw new Error("Error al eliminar estado")
    }
  }

  static async obtenerActivos(): Promise<EstadoDireccion[]> {
    try {
      return await sql`
        SELECT * FROM estados_direcciones 
        WHERE activo = true
        ORDER BY nombre ASC
      `
    } catch (error) {
      console.error("Error obteniendo estados activos:", error)
      throw new Error("Error al obtener estados activos")
    }
  }
}
