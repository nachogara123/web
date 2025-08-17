import { BaseService } from "./base.service"
import type { Direccion, Canal, Comuna, TipoVivienda, EstadoDireccion, Clasificacion } from "@prisma/client"

export type DireccionCompleta = Direccion & {
  canal: Canal
  comuna: Comuna
  tipo_vivienda: TipoVivienda
  estado: EstadoDireccion
  clasificacion: Clasificacion
}

export class DireccionService extends BaseService {
  static async obtenerTodas(limite = 100, offset = 0): Promise<DireccionCompleta[]> {
    try {
      return await this.prisma.direccion.findMany({
        include: {
          canal: true,
          comuna: true,
          tipo_vivienda: true,
          estado: true,
          clasificacion: true,
        },
        orderBy: { created_at: "desc" },
        take: limite,
        skip: offset,
      })
    } catch (error) {
      this.handleError(error, "obtener todas las direcciones")
    }
  }

  static async obtenerPorId(id: number): Promise<DireccionCompleta | null> {
    try {
      return await this.prisma.direccion.findUnique({
        where: { id_direccion: id },
        include: {
          canal: true,
          comuna: true,
          tipo_vivienda: true,
          estado: true,
          clasificacion: true,
        },
      })
    } catch (error) {
      this.handleError(error, "obtener dirección por ID")
    }
  }

  static async obtenerPorArea(bounds: {
    norte: number
    sur: number
    este: number
    oeste: number
  }): Promise<DireccionCompleta[]> {
    try {
      return await this.prisma.direccion.findMany({
        where: {
          AND: [{ lat: { gte: bounds.sur, lte: bounds.norte } }, { lon: { gte: bounds.oeste, lte: bounds.este } }],
        },
        include: {
          canal: true,
          comuna: true,
          tipo_vivienda: true,
          estado: true,
          clasificacion: true,
        },
      })
    } catch (error) {
      this.handleError(error, "obtener direcciones por área")
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
  }): Promise<DireccionCompleta> {
    try {
      return await this.prisma.direccion.create({
        data: datos,
        include: {
          canal: true,
          comuna: true,
          tipo_vivienda: true,
          estado: true,
          clasificacion: true,
        },
      })
    } catch (error) {
      this.handleError(error, "crear dirección")
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
  ): Promise<DireccionCompleta> {
    try {
      return await this.prisma.direccion.update({
        where: { id_direccion: id },
        data: datos,
        include: {
          canal: true,
          comuna: true,
          tipo_vivienda: true,
          estado: true,
          clasificacion: true,
        },
      })
    } catch (error) {
      this.handleError(error, "actualizar dirección")
    }
  }

  static async eliminar(id: number): Promise<void> {
    try {
      await this.prisma.direccion.delete({
        where: { id_direccion: id },
      })
    } catch (error) {
      this.handleError(error, "eliminar dirección")
    }
  }

  static async obtenerEstadisticas(): Promise<{
    total: number
    porEstado: Array<{ estado: string; cantidad: number }>
    porComuna: Array<{ comuna: string; cantidad: number }>
  }> {
    try {
      const total = await this.prisma.direccion.count()

      const porEstado = await this.prisma.direccion.groupBy({
        by: ["id_estado"],
        _count: { id_direccion: true },
        orderBy: { _count: { id_direccion: "desc" } },
      })

      const porComuna = await this.prisma.direccion.groupBy({
        by: ["id_comuna"],
        _count: { id_direccion: true },
        orderBy: { _count: { id_direccion: "desc" } },
        take: 10,
      })

      // Obtener nombres de estados y comunas
      const estadosInfo = await this.prisma.estadoDireccion.findMany({
        where: { id_estado: { in: porEstado.map((e) => e.id_estado) } },
      })

      const comunasInfo = await this.prisma.comuna.findMany({
        where: { id_comuna: { in: porComuna.map((c) => c.id_comuna) } },
      })

      return {
        total,
        porEstado: porEstado.map((e) => ({
          estado: estadosInfo.find((est) => est.id_estado === e.id_estado)?.nombre || "Desconocido",
          cantidad: e._count.id_direccion,
        })),
        porComuna: porComuna.map((c) => ({
          comuna: comunasInfo.find((com) => com.id_comuna === c.id_comuna)?.nombre || "Desconocida",
          cantidad: c._count.id_direccion,
        })),
      }
    } catch (error) {
      this.handleError(error, "obtener estadísticas de direcciones")
    }
  }
}
