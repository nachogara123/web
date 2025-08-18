import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface ComentarioPre {
  id_coment: string
  comentario: string
  tipo_feedback?: string
  categoria?: string
  creado_por?: string
  created_at: Date
  updated_at: Date
}

export interface HistoriaComentario {
  id_historia: string
  id_comentario: string
  id_direccion: number
  id_usuario: string
  fecha_comentario: Date
  created_at: Date
}

export interface ComentarioCompleto extends ComentarioPre {
  usuario_nombre?: string
  historias_count?: number
}

export class ComentarioService {
  static async obtenerTodos(): Promise<ComentarioCompleto[]> {
    try {
      return await sql`
        SELECT cp.*, 
               u.nombre as usuario_nombre,
               COUNT(hc.id_historia) as historias_count
        FROM comentarios_pre cp
        LEFT JOIN usuarios u ON cp.creado_por = u.id_user
        LEFT JOIN historias_comentarios hc ON cp.id_coment = hc.id_comentario
        GROUP BY cp.id_coment, u.nombre
        ORDER BY cp.created_at DESC
      `
    } catch (error) {
      console.error("Error obteniendo comentarios:", error)
      throw new Error("Error al obtener comentarios")
    }
  }

  static async obtenerPorDireccion(direccionId: number): Promise<ComentarioCompleto[]> {
    try {
      return await sql`
        SELECT cp.*, 
               u.nombre as usuario_nombre,
               hc.fecha_comentario
        FROM comentarios_pre cp
        JOIN historias_comentarios hc ON cp.id_coment = hc.id_comentario
        LEFT JOIN usuarios u ON cp.creado_por = u.id_user
        WHERE hc.id_direccion = ${direccionId}
        ORDER BY hc.fecha_comentario DESC
      `
    } catch (error) {
      console.error("Error obteniendo comentarios por dirección:", error)
      throw new Error("Error al obtener comentarios por dirección")
    }
  }

  static async crear(datos: {
    comentario: string
    tipo_feedback?: string
    categoria?: string
    creado_por?: string
  }): Promise<ComentarioPre> {
    try {
      const result = await sql`
        INSERT INTO comentarios_pre (comentario, tipo_feedback, categoria, creado_por)
        VALUES (${datos.comentario}, ${datos.tipo_feedback || null}, ${datos.categoria || null}, ${datos.creado_por || null})
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error("Error creando comentario:", error)
      throw new Error("Error al crear comentario")
    }
  }

  static async asignarADireccion(comentarioId: string, direccionId: number, usuarioId: string): Promise<void> {
    try {
      await sql`
        INSERT INTO historias_comentarios (id_comentario, id_direccion, id_usuario, fecha_comentario)
        VALUES (${comentarioId}, ${direccionId}, ${usuarioId}, NOW())
      `
    } catch (error) {
      console.error("Error asignando comentario:", error)
      throw new Error("Error al asignar comentario a dirección")
    }
  }

  static async actualizar(
    id: string,
    datos: Partial<{
      comentario: string
      tipo_feedback: string
      categoria: string
    }>,
  ): Promise<ComentarioPre> {
    try {
      const result = await sql`
        UPDATE comentarios_pre 
        SET ${sql(datos)}, updated_at = NOW()
        WHERE id_coment = ${id}
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error("Error actualizando comentario:", error)
      throw new Error("Error al actualizar comentario")
    }
  }

  static async eliminar(id: string): Promise<void> {
    try {
      await sql`DELETE FROM comentarios_pre WHERE id_coment = ${id}`
    } catch (error) {
      console.error("Error eliminando comentario:", error)
      throw new Error("Error al eliminar comentario")
    }
  }
}
