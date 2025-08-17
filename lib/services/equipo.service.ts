import { BaseService } from "./base.service"
import type { Equipo, Usuario } from "@prisma/client"

export type EquipoConSupervisor = Equipo & {
  supervisor: Usuario
  usuarios: Array<{
    usuario: Usuario
    fecha_asignacion: Date
  }>
}

export class EquipoService extends BaseService {
  static async obtenerTodos(): Promise<EquipoConSupervisor[]> {
    try {
      return await this.prisma.equipo.findMany({
        include: {
          supervisor: true,
          usuarios: {
            include: { usuario: true },
          },
        },
        orderBy: { fecha_creacion: "desc" },
      })
    } catch (error) {
      this.handleError(error, "obtener todos los equipos")
    }
  }

  static async obtenerPorId(id: string): Promise<EquipoConSupervisor | null> {
    try {
      return await this.prisma.equipo.findUnique({
        where: { id_equipo: id },
        include: {
          supervisor: true,
          usuarios: {
            include: { usuario: true },
          },
        },
      })
    } catch (error) {
      this.handleError(error, "obtener equipo por ID")
    }
  }

  static async obtenerPorUsuario(userId: string): Promise<EquipoConSupervisor[]> {
    try {
      return await this.prisma.equipo.findMany({
        where: {
          OR: [{ id_supervisor: userId }, { usuarios: { some: { id_usuario: userId } } }],
        },
        include: {
          supervisor: true,
          usuarios: {
            include: { usuario: true },
          },
        },
      })
    } catch (error) {
      this.handleError(error, "obtener equipos por usuario")
    }
  }

  static async crear(datos: {
    nombre: string
    tipo: string
    fecha_creacion: Date
    id_supervisor: string
  }): Promise<EquipoConSupervisor> {
    try {
      return await this.prisma.equipo.create({
        data: datos,
        include: {
          supervisor: true,
          usuarios: {
            include: { usuario: true },
          },
        },
      })
    } catch (error) {
      this.handleError(error, "crear equipo")
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
      return await this.prisma.equipo.update({
        where: { id_equipo: id },
        data: datos,
        include: {
          supervisor: true,
          usuarios: {
            include: { usuario: true },
          },
        },
      })
    } catch (error) {
      this.handleError(error, "actualizar equipo")
    }
  }

  static async eliminar(id: string): Promise<void> {
    try {
      await this.prisma.equipo.delete({
        where: { id_equipo: id },
      })
    } catch (error) {
      this.handleError(error, "eliminar equipo")
    }
  }

  static async asignarUsuario(equipoId: string, usuarioId: string): Promise<void> {
    try {
      await this.prisma.usuarioEquipo.create({
        data: {
          id_equipo: equipoId,
          id_usuario: usuarioId,
          fecha_asignacion: new Date(),
        },
      })
    } catch (error) {
      this.handleError(error, "asignar usuario a equipo")
    }
  }

  static async desasignarUsuario(equipoId: string, usuarioId: string): Promise<void> {
    try {
      await this.prisma.usuarioEquipo.delete({
        where: {
          id_usuario_id_equipo: {
            id_usuario: usuarioId,
            id_equipo: equipoId,
          },
        },
      })
    } catch (error) {
      this.handleError(error, "desasignar usuario de equipo")
    }
  }
}
