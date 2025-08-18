import { sql } from "../database"

export interface Rol {
  id_rol: string
  nombre: string
  descripcion?: string
  permisos?: any
  created_at: Date
}

export class RolService {
  static async obtenerTodos(): Promise<Rol[]> {
    try {
      const result = await sql`
        SELECT * FROM roles 
        ORDER BY nombre ASC
      `
      return result
    } catch (error) {
      console.error("[v0] Error obteniendo roles:", error)
      throw new Error("Error al obtener roles")
    }
  }

  static async obtenerPorId(id: string): Promise<Rol | null> {
    try {
      const result = await sql`
        SELECT * FROM roles 
        WHERE id_rol = ${id}
      `
      return result[0] || null
    } catch (error) {
      console.error("[v0] Error obteniendo rol por ID:", error)
      throw new Error("Error al obtener rol")
    }
  }

  static async crear(datos: {
    nombre: string
    descripcion?: string
    permisos?: any
  }): Promise<Rol> {
    try {
      const result = await sql`
        INSERT INTO roles (nombre, descripcion, permisos)
        VALUES (${datos.nombre}, ${datos.descripcion || null}, ${datos.permisos || null})
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error("[v0] Error creando rol:", error)
      throw new Error("Error al crear rol")
    }
  }

  static async actualizar(
    id: string,
    datos: {
      nombre?: string
      descripcion?: string
      permisos?: any
    },
  ): Promise<Rol> {
    try {
      const result = await sql`
        UPDATE roles 
        SET 
          nombre = COALESCE(${datos.nombre}, nombre),
          descripcion = COALESCE(${datos.descripcion}, descripcion),
          permisos = COALESCE(${datos.permisos}, permisos)
        WHERE id_rol = ${id}
        RETURNING *
      `

      if (result.length === 0) {
        throw new Error("Rol no encontrado")
      }

      return result[0]
    } catch (error) {
      console.error("[v0] Error actualizando rol:", error)
      throw new Error("Error al actualizar rol")
    }
  }

  static async eliminar(id: string): Promise<void> {
    try {
      const result = await sql`
        DELETE FROM roles 
        WHERE id_rol = ${id}
      `
    } catch (error) {
      console.error("[v0] Error eliminando rol:", error)
      throw new Error("Error al eliminar rol")
    }
  }

  static async obtenerEstadisticas() {
    try {
      const result = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN permisos IS NOT NULL THEN 1 END) as con_permisos
        FROM roles
      `

      return {
        total: Number(result[0].total),
        conPermisos: Number(result[0].con_permisos),
      }
    } catch (error) {
      console.error("[v0] Error obteniendo estadísticas de roles:", error)
      return { total: 0, conPermisos: 0 }
    }
  }
}
