import { BaseService } from "./base.service"
import type { PlanTrabajo, Equipo, Usuario } from "@prisma/client"

export type PlanTrabajoCompleto = PlanTrabajo & {
  equipo: Equipo & {
    supervisor: Usuario
  }
  usuario_creador: Usuario
  usuario_actualizador: Usuario
}

export class PlanTrabajoService extends BaseService {
  static async obtenerTodos(): Promise<PlanTrabajoCompleto[]> {
    try {
      return await this.prisma.planTrabajo.findMany({
        include: {
          equipo: {
            include: { supervisor: true },
          },
          usuario_creador: true,
          usuario_actualizador: true,
        },
        orderBy: { fecha_inicio: "desc" },
      })
    } catch (error) {
      this.handleError(error, "obtener todos los planes de trabajo")
    }
  }

  static async obtenerPorEquipo(equipoId: string): Promise<PlanTrabajoCompleto[]> {
    try {
      return await this.prisma.planTrabajo.findMany({
        where: { id_equipo: equipoId },
        include: {
          equipo: {
            include: { supervisor: true },
          },
          usuario_creador: true,
          usuario_actualizador: true,
        },
        orderBy: { fecha_inicio: "desc" },
      })
    } catch (error) {
      this.handleError(error, "obtener planes por equipo")
    }
  }

  static async obtenerPorId(id: string): Promise<PlanTrabajoCompleto | null> {
    try {
      return await this.prisma.planTrabajo.findUnique({
        where: { id_plan: id },
        include: {
          equipo: {
            include: { supervisor: true },
          },
          usuario_creador: true,
          usuario_actualizador: true,
        },
      })
    } catch (error) {
      this.handleError(error, "obtener plan por ID")
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
  }): Promise<PlanTrabajoCompleto> {
    try {
      return await this.prisma.planTrabajo.create({
        data: datos,
        include: {
          equipo: {
            include: { supervisor: true },
          },
          usuario_creador: true,
          usuario_actualizador: true,
        },
      })
    } catch (error) {
      this.handleError(error, "crear plan de trabajo")
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
  ): Promise<PlanTrabajoCompleto> {
    try {
      return await this.prisma.planTrabajo.update({
        where: { id_plan: id },
        data: datos,
        include: {
          equipo: {
            include: { supervisor: true },
          },
          usuario_creador: true,
          usuario_actualizador: true,
        },
      })
    } catch (error) {
      this.handleError(error, "actualizar plan de trabajo")
    }
  }

  static async eliminar(id: string): Promise<void> {
    try {
      await this.prisma.planTrabajo.delete({
        where: { id_plan: id },
      })
    } catch (error) {
      this.handleError(error, "eliminar plan de trabajo")
    }
  }

  static async obtenerEstadisticas(): Promise<{
    total: number
    porEstado: Array<{ estado: string; cantidad: number }>
    porEquipo: Array<{ equipo: string; cantidad: number }>
  }> {
    try {
      const total = await this.prisma.planTrabajo.count()

      const porEstado = await this.prisma.planTrabajo.groupBy({
        by: ["estado"],
        _count: { id_plan: true },
        orderBy: { _count: { id_plan: "desc" } },
      })

      const porEquipo = await this.prisma.planTrabajo.groupBy({
        by: ["id_equipo"],
        _count: { id_plan: true },
        orderBy: { _count: { id_plan: "desc" } },
        take: 10,
      })

      // Obtener nombres de equipos
      const equiposInfo = await this.prisma.equipo.findMany({
        where: { id_equipo: { in: porEquipo.map((e) => e.id_equipo) } },
      })

      return {
        total,
        porEstado: porEstado.map((e) => ({
          estado: e.estado,
          cantidad: e._count.id_plan,
        })),
        porEquipo: porEquipo.map((e) => ({
          equipo: equiposInfo.find((eq) => eq.id_equipo === e.id_equipo)?.nombre || "Desconocido",
          cantidad: e._count.id_plan,
        })),
      }
    } catch (error) {
      this.handleError(error, "obtener estadísticas de planes")
    }
  }
}
