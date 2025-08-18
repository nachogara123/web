import { neon } from "@neondatabase/serverless"
import { getDatabaseUrl } from "../database"

const sql = neon(getDatabaseUrl())

export interface PlanTrabajo {
  id_plan: string
  id_equipo: string
  semana: number
  año: number
  fecha_inicio: Date
  fecha_fin: Date
  objetivos?: string
  estado: string
  creado_por: string
  actualizado_por: string
  created_at: Date
  updated_at: Date
}

export interface PlanTrabajoCompleto extends PlanTrabajo {
  equipo_nombre?: string
  supervisor_nombre?: string
  usuario_creador_nombre?: string
  usuario_actualizador_nombre?: string
}

export class PlanTrabajoService {
  static async obtenerTodos(): Promise<PlanTrabajoCompleto[]> {
    try {
      return await sql`
        SELECT pt.*, 
               e.nombre as equipo_nombre,
               us.nombre as supervisor_nombre,
               uc.nombre as usuario_creador_nombre,
               ua.nombre as usuario_actualizador_nombre
        FROM planes_trabajo pt
        LEFT JOIN equipos e ON pt.id_equipo = e.id_equipo
        LEFT JOIN usuarios us ON e.id_supervisor = us.id_user
        LEFT JOIN usuarios uc ON pt.creado_por = uc.id_user
        LEFT JOIN usuarios ua ON pt.actualizado_por = ua.id_user
        ORDER BY pt.fecha_inicio DESC
      `
    } catch (error) {
      console.error("Error obteniendo planes de trabajo:", error)
      throw new Error("Error al obtener planes de trabajo")
    }
  }

  static async obtenerPorEquipo(equipoId: string): Promise<PlanTrabajoCompleto[]> {
    try {
      return await sql`
        SELECT pt.*, 
               e.nombre as equipo_nombre,
               us.nombre as supervisor_nombre,
               uc.nombre as usuario_creador_nombre,
               ua.nombre as usuario_actualizador_nombre
        FROM planes_trabajo pt
        LEFT JOIN equipos e ON pt.id_equipo = e.id_equipo
        LEFT JOIN usuarios us ON e.id_supervisor = us.id_user
        LEFT JOIN usuarios uc ON pt.creado_por = uc.id_user
        LEFT JOIN usuarios ua ON pt.actualizado_por = ua.id_user
        WHERE pt.id_equipo = ${equipoId}
        ORDER BY pt.fecha_inicio DESC
      `
    } catch (error) {
      console.error("Error obteniendo planes por equipo:", error)
      throw new Error("Error al obtener planes por equipo")
    }
  }

  static async obtenerPorId(id: string): Promise<PlanTrabajoCompleto | null> {
    try {
      const result = await sql`
        SELECT pt.*, 
               e.nombre as equipo_nombre,
               us.nombre as supervisor_nombre,
               uc.nombre as usuario_creador_nombre,
               ua.nombre as usuario_actualizador_nombre
        FROM planes_trabajo pt
        LEFT JOIN equipos e ON pt.id_equipo = e.id_equipo
        LEFT JOIN usuarios us ON e.id_supervisor = us.id_user
        LEFT JOIN usuarios uc ON pt.creado_por = uc.id_user
        LEFT JOIN usuarios ua ON pt.actualizado_por = ua.id_user
        WHERE pt.id_plan = ${id}
      `
      return result[0] || null
    } catch (error) {
      console.error("Error obteniendo plan por ID:", error)
      throw new Error("Error al obtener plan por ID")
    }
  }

  static async crear(datos: {
    id_equipo: string
    semana: number
    año: number
    fecha_inicio: Date
    fecha_fin: Date
    objetivos?: string
    estado: string
    creado_por: string
    actualizado_por: string
  }): Promise<PlanTrabajo> {
    try {
      const result = await sql`
        INSERT INTO planes_trabajo (
          id_equipo, semana, año, fecha_inicio, fecha_fin, 
          objetivos, estado, creado_por, actualizado_por
        )
        VALUES (
          ${datos.id_equipo}, ${datos.semana}, ${datos.año}, 
          ${datos.fecha_inicio}, ${datos.fecha_fin}, ${datos.objetivos || null},
          ${datos.estado}, ${datos.creado_por}, ${datos.actualizado_por}
        )
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error("Error creando plan de trabajo:", error)
      throw new Error("Error al crear plan de trabajo")
    }
  }

  static async actualizar(
    id: string,
    datos: Partial<{
      semana: number
      año: number
      fecha_inicio: Date
      fecha_fin: Date
      objetivos: string
      estado: string
      actualizado_por: string
    }>,
  ): Promise<PlanTrabajo> {
    try {
      const result = await sql`
        UPDATE planes_trabajo 
        SET ${sql(datos)}, updated_at = NOW()
        WHERE id_plan = ${id}
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error("Error actualizando plan:", error)
      throw new Error("Error al actualizar plan de trabajo")
    }
  }

  static async eliminar(id: string): Promise<void> {
    try {
      await sql`DELETE FROM planes_trabajo WHERE id_plan = ${id}`
    } catch (error) {
      console.error("Error eliminando plan:", error)
      throw new Error("Error al eliminar plan de trabajo")
    }
  }

  static async obtenerEstadisticas(): Promise<{
    total: number
    porEstado: Array<{ estado: string; cantidad: number }>
    porEquipo: Array<{ equipo: string; cantidad: number }>
  }> {
    try {
      const totalResult = await sql`SELECT COUNT(*) as total FROM planes_trabajo`
      const total = Number(totalResult[0].total)

      const porEstado = await sql`
        SELECT estado, COUNT(*) as cantidad
        FROM planes_trabajo
        GROUP BY estado
        ORDER BY cantidad DESC
      `

      const porEquipo = await sql`
        SELECT e.nombre as equipo, COUNT(*) as cantidad
        FROM planes_trabajo pt
        JOIN equipos e ON pt.id_equipo = e.id_equipo
        GROUP BY e.nombre, e.id_equipo
        ORDER BY cantidad DESC
        LIMIT 10
      `

      return {
        total,
        porEstado: porEstado.map((e) => ({
          estado: e.estado,
          cantidad: Number(e.cantidad),
        })),
        porEquipo: porEquipo.map((e) => ({
          equipo: e.equipo,
          cantidad: Number(e.cantidad),
        })),
      }
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error)
      return { total: 0, porEstado: [], porEquipo: [] }
    }
  }
}
