import { BaseService } from "./base.service"

export interface Canal {
  id: number
  nombre: string
  descripcion?: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateCanalData {
  nombre: string
  descripcion?: string
  activo?: boolean
}

export interface UpdateCanalData extends Partial<CreateCanalData> {}

export class CanalService extends BaseService<Canal, CreateCanalData, UpdateCanalData> {
  constructor() {
    super("canales")
  }

  async findByStatus(activo: boolean): Promise<Canal[]> {
    return this.prisma.canales.findMany({
      where: { activo },
      orderBy: { nombre: "asc" },
    })
  }

  async findByName(nombre: string): Promise<Canal | null> {
    return this.prisma.canales.findFirst({
      where: {
        nombre: {
          contains: nombre,
          mode: "insensitive",
        },
      },
    })
  }
}
