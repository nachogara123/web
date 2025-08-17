import { BaseService } from "./base.service"

export interface EstadoDireccion {
  id: number
  nombre: string
  descripcion?: string
  color?: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateEstadoDireccionData {
  nombre: string
  descripcion?: string
  color?: string
  activo?: boolean
}

export interface UpdateEstadoDireccionData extends Partial<CreateEstadoDireccionData> {}

export class EstadoDireccionService extends BaseService<
  EstadoDireccion,
  CreateEstadoDireccionData,
  UpdateEstadoDireccionData
> {
  constructor() {
    super("estadosDirecciones")
  }

  async findByStatus(activo: boolean): Promise<EstadoDireccion[]> {
    return this.prisma.estadosDirecciones.findMany({
      where: { activo },
      orderBy: { nombre: "asc" },
    })
  }

  async getEstadosStats(): Promise<{ total: number; activos: number; inactivos: number }> {
    const [total, activos] = await Promise.all([
      this.prisma.estadosDirecciones.count(),
      this.prisma.estadosDirecciones.count({ where: { activo: true } }),
    ])

    return {
      total,
      activos,
      inactivos: total - activos,
    }
  }
}
