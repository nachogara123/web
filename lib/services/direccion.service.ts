import { neon } from "@neondatabase/serverless"
import { getDatabaseUrl } from "../database"

const sql = neon(getDatabaseUrl())

export interface Direccion {
  id_direccion: number
  direccion_final?: string
  lon?: number
  lat?: number
  id_canal: number
  id_comuna: number
  id_tipo_vivienda: number
  nota?: string
  hub_feeder_zona?: string
  id_cto?: string
  id_estado: number
  id_clasificacion: number
  contador?: number
  total_comentarios?: number
  geom?: string
  created_at: Date
  updated_at: Date
}

export interface DireccionCompleta extends Direccion {
  canal_nombre?: string
  comuna_nombre?: string
  tipo_vivienda_nombre?: string
  estado_nombre?: string
  clasificacion_nombre?: string
}

export class DireccionService {
  static async obtenerTodas(limite = 100, offset = 0): Promise<DireccionCompleta[]> {
    try {
      return await sql`
        SELECT d.*, 
               c.nombre as canal_nombre,
               com.nombre as comuna_nombre,
               tv.nombre as tipo_vivienda_nombre,
               ed.nombre as estado_nombre,
               cl.nombre as clasificacion_nombre
        FROM direcciones d
        LEFT JOIN canales c ON d.id_canal = c.id_canal
        LEFT JOIN comunas com ON d.id_comuna = com.id_comuna
        LEFT JOIN tipos_vivienda tv ON d.id_tipo_vivienda = tv.id_tipo_vivienda
        LEFT JOIN estados_direccion ed ON d.id_estado = ed.id_estado
        LEFT JOIN clasificaciones cl ON d.id_clasificacion = cl.id_clasificacion
        ORDER BY d.created_at DESC
        LIMIT ${limite} OFFSET ${offset}
      `
    } catch (error) {
      console.error("Error obteniendo direcciones:", error)
      throw new Error("Error al obtener direcciones")
    }
  }

  static async obtenerPorId(id: number): Promise<DireccionCompleta | null> {
    try {
      const result = await sql`
        SELECT d.*, 
               c.nombre as canal_nombre,
               com.nombre as comuna_nombre,
               tv.nombre as tipo_vivienda_nombre,
               ed.nombre as estado_nombre,
               cl.nombre as clasificacion_nombre
        FROM direcciones d
        LEFT JOIN canales c ON d.id_canal = c.id_canal
        LEFT JOIN comunas com ON d.id_comuna = com.id_comuna
        LEFT JOIN tipos_vivienda tv ON d.id_tipo_vivienda = tv.id_tipo_vivienda
        LEFT JOIN estados_direccion ed ON d.id_estado = ed.id_estado
        LEFT JOIN clasificaciones cl ON d.id_clasificacion = cl.id_clasificacion
        WHERE d.id_direccion = ${id}
      `
      return result[0] || null
    } catch (error) {
      console.error("Error obteniendo dirección:", error)
      throw new Error("Error al obtener dirección")
    }
  }

  static async crear(datos: {
    direccion_final?: string
    lon?: number
    lat?: number
    id_canal: number
    id_comuna: number
    id_tipo_vivienda: number
    nota?: string
    hub_feeder_zona?: string
    id_cto?: string
    id_estado: number
    id_clasificacion: number
    contador?: number
    total_comentarios?: number
    geom?: string
  }): Promise<Direccion> {
    try {
      const result = await sql`
        INSERT INTO direcciones (
          direccion_final, lon, lat, id_canal, id_comuna, id_tipo_vivienda,
          nota, hub_feeder_zona, id_cto, id_estado, id_clasificacion,
          contador, total_comentarios, geom
        )
        VALUES (
          ${datos.direccion_final || null}, ${datos.lon || null}, ${datos.lat || null},
          ${datos.id_canal}, ${datos.id_comuna}, ${datos.id_tipo_vivienda},
          ${datos.nota || null}, ${datos.hub_feeder_zona || null}, ${datos.id_cto || null},
          ${datos.id_estado}, ${datos.id_clasificacion}, ${datos.contador || 0},
          ${datos.total_comentarios || 0}, ${datos.geom || null}
        )
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error("Error creando dirección:", error)
      throw new Error("Error al crear dirección")
    }
  }

  static async actualizar(
    id: number,
    datos: Partial<{
      direccion_final: string
      lon: number
      lat: number
      id_canal: number
      id_comuna: number
      id_tipo_vivienda: number
      nota: string
      hub_feeder_zona: string
      id_cto: string
      id_estado: number
      id_clasificacion: number
      contador: number
      total_comentarios: number
      geom: string
    }>,
  ): Promise<Direccion> {
    try {
      const result = await sql`
        UPDATE direcciones 
        SET ${sql(datos)}, updated_at = NOW()
        WHERE id_direccion = ${id}
        RETURNING *
      `
      return result[0]
    } catch (error) {
      console.error("Error actualizando dirección:", error)
      throw new Error("Error al actualizar dirección")
    }
  }

  static async eliminar(id: number): Promise<void> {
    try {
      await sql`DELETE FROM direcciones WHERE id_direccion = ${id}`
    } catch (error) {
      console.error("Error eliminando dirección:", error)
      throw new Error("Error al eliminar dirección")
    }
  }

  static async obtenerEstadisticas(): Promise<{
    total: number
    porEstado: Array<{ estado: string; cantidad: number }>
    porComuna: Array<{ comuna: string; cantidad: number }>
  }> {
    try {
      const totalResult = await sql`SELECT COUNT(*) as total FROM direcciones`
      const total = Number(totalResult[0].total)

      const porEstado = await sql`
        SELECT ed.nombre as estado, COUNT(*) as cantidad
        FROM direcciones d
        JOIN estados_direcciones ed ON d.id_estado = ed.id_estado
        GROUP BY ed.nombre, ed.id_estado
        ORDER BY cantidad DESC
      `

      const porComuna = await sql`
        SELECT c.nombre as comuna, COUNT(*) as cantidad
        FROM direcciones d
        JOIN comunas c ON d.id_comuna = c.id_comuna
        GROUP BY c.nombre, c.id_comuna
        ORDER BY cantidad DESC
        LIMIT 10
      `

      return {
        total,
        porEstado: porEstado.map((e) => ({
          estado: e.estado,
          cantidad: Number(e.cantidad),
        })),
        porComuna: porComuna.map((c) => ({
          comuna: c.comuna,
          cantidad: Number(c.cantidad),
        })),
      }
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error)
      return { total: 0, porEstado: [], porComuna: [] }
    }
  }
}
