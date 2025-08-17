import { BaseService } from "./base.service"
import type { Rol } from "@prisma/client"

export class RolService extends BaseService {
  static async obtenerTodos(): Promise<Rol[]> {
    try {
      return await this.prisma.rol.findMany({
        orderBy: { nombre: "asc" },
      })
    } catch (error) {
      this.handleError(error, "obtener todos los roles")
    }
  }

  static async obtenerPorId(id: string): Promise<Rol | null> {
    try {
      return await this.prisma.rol.findUnique({
        where: { id_rol: id },
      })
    } catch (error) {
      this.handleError(error, "obtener rol por ID")
    }
  }

  static async crear(datos: { nombre: string }): Promise<Rol> {
    try {
      return await this.prisma.rol.create({
        data: datos,
      })
    } catch (error) {
      this.handleError(error, "crear rol")
    }
  }

  static async actualizar(id: string, datos: { nombre: string }): Promise<Rol> {
    try {
      return await this.prisma.rol.update({
        where: { id_rol: id },
        data: datos,
      })
    } catch (error) {
      this.handleError(error, "actualizar rol")
    }
  }

  static async eliminar(id: string): Promise<void> {
    try {
      await this.prisma.rol.delete({
        where: { id_rol: id },
      })
    } catch (error) {
      this.handleError(error, "eliminar rol")
    }
  }
}
