import { BaseService } from "./base.service"
import type { ComentarioPre, Usuario, HistoriaComentario, Direccion } from "@prisma/client"

export type ComentarioCompleto = ComentarioPre & {
  usuario_creador?: Usuario
  historias_comentarios: Array<
    HistoriaComentario & {
      direccion: Direccion
      usuario: Usuario
    }
  >
}

export class ComentarioService extends BaseService {
  static async obtenerTodos(): Promise<ComentarioCompleto[]> {
    try {
      return await this.prisma.comentarioPre.findMany({
        include: {
          usuario_creador: true,
          historias_comentarios: {
            include: {
              direccion: true,
              usuario: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      })
    } catch (error) {
      this.handleError(error, "obtener todos los comentarios")
    }
  }

  static async obtenerPorDireccion(direccionId: number): Promise<ComentarioCompleto[]> {
    try {
      return await this.prisma.comentarioPre.findMany({
        where: {
          historias_comentarios: {
            some: { id_direccion: direccionId },
          },
        },
        include: {
          usuario_creador: true,
          historias_comentarios: {
            where: { id_direccion: direccionId },
            include: {
              direccion: true,
              usuario: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      })
    } catch (error) {
      this.handleError(error, "obtener comentarios por dirección")
    }
  }

  static async crear(datos: {
    comentario: string
    tipo_feedback?: string
    categoria?: string
    creado_por?: string
  }): Promise<ComentarioCompleto> {
    try {
      return await this.prisma.comentarioPre.create({
        data: datos,
        include: {
          usuario_creador: true,
          historias_comentarios: {
            include: {
              direccion: true,
              usuario: true,
            },
          },
        },
      })
    } catch (error) {
      this.handleError(error, "crear comentario")
    }
  }

  static async asignarADireccion(comentarioId: string, direccionId: number, usuarioId: string): Promise<void> {
    try {
      await this.prisma.historiaComentario.create({
        data: {
          id_comentario: comentarioId,
          id_direccion: direccionId,
          id_usuario: usuarioId,
          fecha_comentario: new Date(),
        },
      })
    } catch (error) {
      this.handleError(error, "asignar comentario a dirección")
    }
  }

  static async actualizar(
    id: string,
    datos: Partial<{
      comentario: string
      tipo_feedback: string
      categoria: string
    }>,
  ): Promise<ComentarioCompleto> {
    try {
      return await this.prisma.comentarioPre.update({
        where: { id_coment: id },
        data: datos,
        include: {
          usuario_creador: true,
          historias_comentarios: {
            include: {
              direccion: true,
              usuario: true,
            },
          },
        },
      })
    } catch (error) {
      this.handleError(error, "actualizar comentario")
    }
  }

  static async eliminar(id: string): Promise<void> {
    try {
      await this.prisma.comentarioPre.delete({
        where: { id_coment: id },
      })
    } catch (error) {
      this.handleError(error, "eliminar comentario")
    }
  }
}
