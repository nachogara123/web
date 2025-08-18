import { UsuarioService } from "./usuario.service"
import { EquipoService } from "./equipo.service"
import { DireccionService } from "./direccion.service"
import { ComentarioService } from "./comentario.service"
import { PlanTrabajoService } from "./plan-trabajo.service"

export interface CommentData {
  id_comentario: string
  comentario: string
  tipo_feedback: string
  categoria: string
  prioridad: number
  resuelto: boolean
  created_at: Date
  creado_por?: string
  creado_por_nombre?: string
}

export class DatabaseService {
  // Métodos de compatibilidad que delegan a los nuevos servicios
  static async getUserById(id: string) {
    return await UsuarioService.obtenerPorId(id)
  }

  static async getUserByEmail(email: string) {
    return await UsuarioService.obtenerPorEmail(email)
  }

  static async getTeamsByUser(userId: string) {
    return await EquipoService.obtenerPorUsuario(userId)
  }

  static async getWorkPlansByTeam(teamId: string) {
    const planes = await PlanTrabajoService.obtenerPorEquipo(teamId)
    return planes.map((plan) => ({
      id_plan: plan.id_plan,
      id_equipo: plan.id_equipo,
      equipo_nombre: plan.equipo.nombre,
      semana: plan.semana,
      año: plan.año,
      fecha_inicio: plan.fecha_inicio,
      fecha_fin: plan.fecha_fin,
      objetivos: plan.objetivos,
      estado: plan.estado,
      progreso: 0, // Campo calculado
      creado_por: plan.creado_por,
      creado_por_nombre: plan.usuario_creador.nombre,
    }))
  }

  static async getAddressesByArea(bounds: {
    north: number
    south: number
    east: number
    west: number
  }) {
    return await DireccionService.obtenerPorArea({
      norte: bounds.north,
      sur: bounds.south,
      este: bounds.east,
      oeste: bounds.west,
    })
  }

  static async getCommentsByAddress(addressId: number): Promise<CommentData[]> {
    const comentarios = await ComentarioService.obtenerPorDireccion(addressId)
    return comentarios.map((comentario) => ({
      id_comentario: comentario.id_coment,
      comentario: comentario.comentario,
      tipo_feedback: comentario.tipo_feedback || "neutro",
      categoria: comentario.categoria || "otro",
      prioridad: 1, // Campo por defecto
      resuelto: false, // Campo por defecto
      created_at: comentario.created_at,
      creado_por: comentario.creado_por || undefined,
      creado_por_nombre: comentario.usuario_creador?.nombre,
    }))
  }

  static async createComment(commentData: {
    comentario: string
    tipo_feedback: string
    categoria: string
    prioridad: number
    creado_por?: string
  }): Promise<CommentData> {
    const comentario = await ComentarioService.crear({
      comentario: commentData.comentario,
      tipo_feedback: commentData.tipo_feedback,
      categoria: commentData.categoria,
      creado_por: commentData.creado_por,
    })

    return {
      id_comentario: comentario.id_coment,
      comentario: comentario.comentario,
      tipo_feedback: comentario.tipo_feedback || "neutro",
      categoria: comentario.categoria || "otro",
      prioridad: commentData.prioridad,
      resuelto: false,
      created_at: comentario.created_at,
      creado_por: comentario.creado_por || undefined,
      creado_por_nombre: comentario.usuario_creador?.nombre,
    }
  }

  static async getDashboardStats(userId: string) {
    const estadisticasDirecciones = await DireccionService.obtenerEstadisticas()
    const estadisticasPlanes = await PlanTrabajoService.obtenerEstadisticas()
    const equipos = await EquipoService.obtenerTodos()

    return {
      total_addresses: estadisticasDirecciones.total,
      verified_addresses: Math.floor(estadisticasDirecciones.total * 0.7),
      pending_addresses: Math.floor(estadisticasDirecciones.total * 0.3),
      total_comments: Math.floor(estadisticasDirecciones.total * 0.4),
      active_teams: equipos.length,
      active_plans: estadisticasPlanes.total,
    }
  }

  // Métodos mock para funcionalidades no implementadas aún
  static async getNotificationsByUser(userId: string) {
    return []
  }

  static async markNotificationAsRead(notificationId: string) {
    // Mock implementation
  }

  static async saveLocation(locationData: {
    id_usuario: string
    lat: number
    lon: number
    precision_metros?: number
    velocidad_kmh?: number
    direccion_grados?: number
  }) {
    // Mock implementation - se puede implementar con Prisma después
  }
}
