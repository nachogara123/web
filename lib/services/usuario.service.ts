import { BaseService } from "./base.service"
import type { Usuario, Rol } from "@prisma/client"

export type UsuarioConRol = Usuario & {
  rol: Rol
}

export class UsuarioService extends BaseService {
  static async obtenerPorId(id: string): Promise<UsuarioConRol | null> {
    try {
      return await this.prisma.usuario.findUnique({
        where: { id_user: id },
        include: { rol: true },
      })
    } catch (error) {
      this.handleError(error, "obtener usuario por ID")
    }
  }

  static async obtenerPorEmail(email: string): Promise<UsuarioConRol | null> {
    try {
      return await this.prisma.usuario.findUnique({
        where: { email },
        include: { rol: true },
      })
    } catch (error) {
      this.handleError(error, "obtener usuario por email")
    }
  }

  static async obtenerTodos(): Promise<UsuarioConRol[]> {
    try {
      return await this.prisma.usuario.findMany({
        include: { rol: true },
        orderBy: { created_at: "desc" },
      })
    } catch (error) {
      this.handleError(error, "obtener todos los usuarios")
    }
  }

  static async crear(datos: {
    nombre: string
    email: string
    clave: string
    rol_id: string
  }): Promise<UsuarioConRol> {
    try {
      return await this.prisma.usuario.create({
        data: datos,
        include: { rol: true },
      })
    } catch (error) {
      this.handleError(error, "crear usuario")
    }
  }

  static async actualizar(
    id: string,
    datos: Partial<{
      nombre: string
      email: string
      clave: string
      rol_id: string
    }>,
  ): Promise<UsuarioConRol> {
    try {
      return await this.prisma.usuario.update({
        where: { id_user: id },
        data: { ...datos, updated_at: new Date() },
        include: { rol: true },
      })
    } catch (error) {
      this.handleError(error, "actualizar usuario")
    }
  }

  static async eliminar(id: string): Promise<void> {
    try {
      await this.prisma.usuario.delete({
        where: { id_user: id },
      })
    } catch (error) {
      this.handleError(error, "eliminar usuario")
    }
  }
}
