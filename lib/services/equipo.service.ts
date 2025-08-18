import { neon } from "@neondatabase/serverless"

const getDatabaseUrl = () => {
  const specificUrl =
    "postgresql://neondb_owner:npg_YSWDm3bHO6Gt@ep-falling-truth-adjz53rq-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL || specificUrl
}

const sql = neon(getDatabaseUrl())

export interface Equipo {
  id_equipo: string
  nombre: string
  tipo: string
  fecha_creacion: Date
  id_supervisor: string
}

export interface EquipoConSupervisor extends Equipo {
  supervisor: {
    id_usuario: string
    nombre: string
    email: string
  }
  usuarios: Array<{
    id_usuario: string
    nombre: string
    email: string
    fecha_asignacion: Date
  }>
}

export class EquipoService {
  static async obtenerTodos(): Promise<EquipoConSupervisor[]> {
    try {
      const result = await sql`
        SELECT 
          e.*,
          u.nombre as supervisor_nombre,
          u.email as supervisor_email,
          json_agg(
            json_build_object(
              'id_usuario', ue.id_usuario,
              'nombre', u2.nombre,
              'email', u2.email,
              'fecha_asignacion', ue.fecha_asignacion
            )
          ) FILTER (WHERE ue.id_usuario IS NOT NULL) as usuarios
        FROM equipos e
        LEFT JOIN usuarios u ON e.id_supervisor = u.id_user
        LEFT JOIN usuarios_equipos ue ON e.id_equipo = ue.id_equipo
        LEFT JOIN usuarios u2 ON ue.id_usuario = u2.id_user
        GROUP BY e.id_equipo, u.nombre, u.email
        ORDER BY e.fecha_creacion DESC
      `

      return result.map((row) => ({
        ...row,
        supervisor: {
          id_usuario: row.id_supervisor,
          nombre: row.supervisor_nombre,
          email: row.supervisor_email,
        },
        usuarios: row.usuarios || [],
      }))
    } catch (error) {
      console.error("Error obteniendo equipos:", error)
      throw new Error("Error al obtener equipos")
    }
  }

  static async obtenerPorId(id: string): Promise<EquipoConSupervisor | null> {
    try {
      const result = await sql`
        SELECT 
          e.*,
          u.nombre as supervisor_nombre,
          u.email as supervisor_email
        FROM equipos e
        LEFT JOIN usuarios u ON e.id_supervisor = u.id_user
        WHERE e.id_equipo = ${id}
      `

      if (result.length === 0) return null

      const usuarios = await sql`
        SELECT u.id_user as id_usuario, u.nombre, u.email, ue.fecha_asignacion
        FROM usuarios_equipos ue
        JOIN usuarios u ON ue.id_usuario = u.id_user
        WHERE ue.id_equipo = ${id}
      `

      return {
        ...result[0],
        supervisor: {
          id_usuario: result[0].id_supervisor,
          nombre: result[0].supervisor_nombre,
          email: result[0].supervisor_email,
        },
        usuarios,
      }
    } catch (error) {
      console.error("Error obteniendo equipo por ID:", error)
      throw new Error("Error al obtener equipo")
    }
  }

  static async crear(datos: {
    nombre: string
    tipo: string
    id_supervisor: string
  }): Promise<EquipoConSupervisor> {
    try {
      const result = await sql`
        INSERT INTO equipos (nombre, tipo, fecha_creacion, id_supervisor)
        VALUES (${datos.nombre}, ${datos.tipo}, NOW(), ${datos.id_supervisor})
        RETURNING *
      `

      return this.obtenerPorId(result[0].id_equipo)
    } catch (error) {
      console.error("Error creando equipo:", error)
      throw new Error("Error al crear equipo")
    }
  }

  static async actualizar(
    id: string,
    datos: Partial<{
      nombre: string
      tipo: string
      id_supervisor: string
    }>,
  ): Promise<EquipoConSupervisor> {
    try {
      const campos = Object.keys(datos)
        .map((key) => `${key} = $${key}`)
        .join(", ")

      await sql`
        UPDATE equipos 
        SET ${sql(datos)}
        WHERE id_equipo = ${id}
      `

      return this.obtenerPorId(id)
    } catch (error) {
      console.error("Error actualizando equipo:", error)
      throw new Error("Error al actualizar equipo")
    }
  }

  static async eliminar(id: string): Promise<void> {
    try {
      await sql`DELETE FROM equipos WHERE id_equipo = ${id}`
    } catch (error) {
      console.error("Error eliminando equipo:", error)
      throw new Error("Error al eliminar equipo")
    }
  }

  static async asignarUsuario(equipoId: string, usuarioId: string): Promise<void> {
    try {
      await sql`
        INSERT INTO usuarios_equipos (id_equipo, id_usuario, fecha_asignacion)
        VALUES (${equipoId}, ${usuarioId}, NOW())
      `
    } catch (error) {
      console.error("Error asignando usuario:", error)
      throw new Error("Error al asignar usuario")
    }
  }

  static async desasignarUsuario(equipoId: string, usuarioId: string): Promise<void> {
    try {
      await sql`
        DELETE FROM usuarios_equipos 
        WHERE id_equipo = ${equipoId} AND id_usuario = ${usuarioId}
      `
    } catch (error) {
      console.error("Error desasignando usuario:", error)
      throw new Error("Error al desasignar usuario")
    }
  }
}
