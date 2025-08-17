import { BaseService } from "./base.service"

export interface Comuna {
  id: number
  nombre: string
  codigo?: string
  region: string
  provincia: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateComunaData {
  nombre: string
  codigo?: string
  region: string
  provincia: string
  activo?: boolean
}

export interface UpdateComunaData extends Partial<CreateComunaData> {}

export class ComunaService extends BaseService<Comuna, CreateComunaData, UpdateComunaData> {
  constructor() {
    super("comunas")
  }

  async findByRegion(region: string): Promise<Comuna[]> {
    return this.prisma.comunas.findMany({
      where: { region },
      orderBy: { nombre: "asc" },
    })
  }

  async findByProvincia(provincia: string): Promise<Comuna[]> {
    return this.prisma.comunas.findMany({
      where: { provincia },
      orderBy: { nombre: "asc" },
    })
  }

  async findByStatus(activo: boolean): Promise<Comuna[]> {
    return this.prisma.comunas.findMany({
      where: { activo },
      orderBy: { nombre: "asc" },
    })
  }

  async getRegiones(): Promise<string[]> {
    const result = await this.prisma.comunas.findMany({
      select: { region: true },
      distinct: ["region"],
      orderBy: { region: "asc" },
    })
    return result.map((r) => r.region)
  }

  async getProvincias(region?: string): Promise<string[]> {
    const where = region ? { region } : {}
    const result = await this.prisma.comunas.findMany({
      select: { provincia: true },
      where,
      distinct: ["provincia"],
      orderBy: { provincia: "asc" },
    })
    return result.map((p) => p.provincia)
  }
}
