import { sql } from "../database"

export interface Usuario {
  id_user: string
  nombre: string
  email: string
  telefono?: string
  activo: boolean
  rol_id: string
  created_at: Date
  updated_at: Date
  ultimo_acceso?: Date
  avatar_url?: string
  rol?: {
    id_rol: string
    nombre: string
    descripcion?: string
  }
}

export class UsuarioService {
  static async obtenerTodos(): Promise<Usuario[]> {
    try {
      const usuarios = await sql`
        SELECT u.*, r.nombre as rol_nombre, r.descripcion as rol_descripcion
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id_rol
        WHERE u.activo = true
        ORDER BY u.created_at DESC
      `

      return usuarios.map((u) => ({
        id_user: u.id_user,
        nombre: u.nombre,
        email: u.email,
        telefono: u.telefono,
        activo: u.activo,
        rol_id: u.rol_id,
        created_at: u.created_at,
        updated_at: u.updated_at,
        ultimo_acceso: u.ultimo_acceso,
        avatar_url: u.avatar_url,
        rol: {
          id_rol: u.rol_id,
          nombre: u.rol_nombre,
          descripcion: u.rol_descripcion,
        },
      }))
    } catch (error) {
      console.error("[v0] Error obteniendo usuarios:", error)
      throw new Error("Error al obtener usuarios")
    }
  }

  static async obtenerPorId(id: string): Promise<Usuario | null> {
    try {
      const resultado = await sql`
        SELECT u.*, r.nombre as rol_nombre, r.descripcion as rol_descripcion
        FROM usuarios u
        LEFT JOIN roles r ON u.rol_id = r.id_rol
        WHERE u.id_user = ${id} AND u.activo = true
      `

      if (resultado.length === 0) return null

      const u = resultado[0]
      return {
        id_user: u.id_user,
        nombre: u.nombre,
        email: u.email,
        telefono: u.telefono,
        activo: u.activo,
        rol_id: u.rol_id,
        created_at: u.created_at,
        updated_at: u.updated_at,
        ultimo_acceso: u.ultimo_acceso,
        avatar_url: u.avatar_url,
        rol: {
          id_rol: u.rol_id,
          nombre: u.rol_nombre,
          descripcion: u.rol_descripcion,
        },
      }
    } catch (error) {
      console.error("[v0] Error obteniendo usuario por ID:", error)
      throw new Error("Error al obtener usuario")
    }
  }

  static async crear(datos: {
    nombre: string
    email: string
    clave: string
    rol_id: string
    telefono?: string
  }): Promise<Usuario> {
    try {
      const resultado = await sql`
        INSERT INTO usuarios (nombre, email, clave, rol_id, telefono, activo)
        VALUES (${datos.nombre}, ${datos.email}, ${datos.clave}, ${datos.rol_id}, ${datos.telefono || null}, true)
        RETURNING *
      `

      const usuario = resultado[0]
      return {
        id_user: usuario.id_user,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        activo: usuario.activo,
        rol_id: usuario.rol_id,
        created_at: usuario.created_at,
        updated_at: usuario.updated_at,
        ultimo_acceso: usuario.ultimo_acceso,
        avatar_url: usuario.avatar_url,
      }
    } catch (error) {
      console.error("[v0] Error creando usuario:", error)
      throw new Error("Error al crear usuario")
    }
  }

  static async actualizar(
    id: string,
    datos: Partial<{
      nombre: string
      email: string
      telefono: string
      rol_id: string
    }>,
  ): Promise<Usuario> {
    try {
      const campos = Object.keys(datos)
        .map((key) => `${key} = $${key}`)
        .join(", ")
      const valores = Object.values(datos)

      const resultado = await sql`
        UPDATE usuarios 
        SET ${sql(datos)}, updated_at = NOW()
        WHERE id_user = ${id} AND activo = true
        RETURNING *
      `

      if (resultado.length === 0) {
        throw new Error("Usuario no encontrado")
      }

      const usuario = resultado[0]
      return {
        id_user: usuario.id_user,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        activo: usuario.activo,
        rol_id: usuario.rol_id,
        created_at: usuario.created_at,
        updated_at: usuario.updated_at,
        ultimo_acceso: usuario.ultimo_acceso,
        avatar_url: usuario.avatar_url,
      }
    } catch (error) {
      console.error("[v0] Error actualizando usuario:", error)
      throw new Error("Error al actualizar usuario")
    }
  }

  static async eliminar(id: string): Promise<void> {
    try {
      await sql`
        UPDATE usuarios 
        SET activo = false, updated_at = NOW()
        WHERE id_user = ${id}
      `
    } catch (error) {
      console.error("[v0] Error eliminando usuario:", error)
      throw new Error("Error al eliminar usuario")
    }
  }

  static async obtenerEstadisticas() {
    try {
      const resultado = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN activo = true THEN 1 END) as activos,
          COUNT(CASE WHEN ultimo_acceso > NOW() - INTERVAL '7 days' THEN 1 END) as activos_semana
        FROM usuarios
      `

      return {
        total: Number(resultado[0].total),
        activos: Number(resultado[0].activos),
        activosSemana: Number(resultado[0].activos_semana),
      }
    } catch (error) {
      console.error("[v0] Error obteniendo estadísticas de usuarios:", error)
      return { total: 0, activos: 0, activosSemana: 0 }
    }
  }
}
