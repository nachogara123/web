import { BaseService } from "./base.service"

export interface Clasificacion {
  id: number
  nombre: string
  descripcion?: string
  color?: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateClasificacionData {
  nombre: string
  descripcion?: string
  color?: string
  activo?: boolean
}

export interface UpdateClasificacionData extends Partial<CreateClasificacionData> {}

export class ClasificacionService extends BaseService<Clasificacion, CreateClasificacionData, UpdateClasificacionData> {
  constructor() {
    super("clasificaciones")
  }

  async findByStatus(activo: boolean): Promise<Clasificacion[]> {
    return this.prisma.clasificaciones.findMany({
      where: { activo },
      orderBy: { nombre: "asc" },
    })
  }

  async findByColor(color: string): Promise<Clasificacion[]> {
    return this.prisma.clasificaciones.findMany({
      where: { color },
      orderBy: { nombre: "asc" },
    })
  }
}
