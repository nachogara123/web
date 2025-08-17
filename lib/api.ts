import { UsuarioService, type UsuarioConRol } from "./services/usuario.service"
import { EquipoService, type EquipoConSupervisor } from "./services/equipo.service"
import { DireccionService, type DireccionCompleta } from "./services/direccion.service"
import type { CommentData } from "./services/comment.service"
import { DatabaseService } from "./services/database.service" // Import DatabaseService

export interface User {
  id: string
  name: string
  email: string
  role: string
  roleName?: string
  status: "active" | "inactive"
  createdAt: string
  lastAccess?: string
}

export interface Team {
  id: string
  name: string
  type: string
  description?: string
  supervisor: string
  supervisorName?: string
  createdAt: string
  active: boolean
}

export interface WorkPlan {
  id: string
  teamId: string
  teamName?: string
  week: number
  year: number
  startDate: string
  endDate: string
  objectives?: string
  status: string
  progress: number
  createdBy: string
  createdByName?: string
}

export interface Address {
  id: number
  address: string
  lat?: number
  lng?: number
  channel?: string
  commune?: string
  housingType?: string
  note?: string
  hubFeederZone?: string
  ctoId?: string
  status?: string
  classification?: string
  counter: number
  totalComments: number
  verified: boolean
  createdAt: string
}

export interface Comment {
  id: string
  text: string
  feedbackType: "positivo" | "negativo" | "neutro"
  category: "producto" | "servicio" | "logistica" | "tecnico" | "otro"
  priority: number
  resolved: boolean
  createdAt: string
  createdBy?: string
  createdByName?: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "warning" | "error" | "success"
  read: boolean
  actionUrl?: string
  createdAt: string
}

export interface RoutePoint {
  id: string
  lat: number
  lng: number
  address: string
}

export interface DashboardMetrics {
  totalAddresses: number
  verifiedAddresses: number
  pendingAddresses: number
  totalComments: number
  activeTeams: number
  activePlans: number
  chartData: Array<{
    name: string
    direcciones: number
    comentarios: number
  }>
}

// Helper functions to convert database models to API models
function mapUsuarioToUser(usuario: UsuarioConRol): User {
  return {
    id: usuario.id_user,
    name: usuario.nombre,
    email: usuario.email,
    role: usuario.rol_id,
    roleName: usuario.rol.nombre,
    status: "active", // Por defecto activo, se puede agregar campo en BD
    createdAt: usuario.created_at.toISOString(),
  }
}

function mapEquipoToTeam(equipo: EquipoConSupervisor): Team {
  return {
    id: equipo.id_equipo,
    name: equipo.nombre,
    type: equipo.tipo,
    description: equipo.descripcion,
    supervisor: equipo.id_supervisor,
    supervisorName: equipo.supervisor.nombre,
    createdAt: equipo.fecha_creacion.toISOString(),
    active: equipo.activo,
  }
}

function mapDireccionToAddress(direccion: DireccionCompleta): Address {
  return {
    id: direccion.id_direccion,
    address: direccion.direccion_final || "",
    lat: direccion.lat || undefined,
    lng: direccion.lon || undefined,
    channel: direccion.canal.nombre,
    commune: direccion.comuna.nombre,
    housingType: direccion.tipo_vivienda.nombre,
    note: direccion.nota || undefined,
    hubFeederZone: direccion.hub_feeder_zona || undefined,
    ctoId: direccion.id_cto || undefined,
    status: direccion.estado.nombre,
    classification: direccion.clasificacion.nombre,
    counter: direccion.contador || 0,
    totalComments: direccion.total_comentarios || 0,
    verified: direccion.id_estado === 1, // Asumiendo que estado 1 es "verificado"
    createdAt: direccion.created_at.toISOString(),
  }
}

function mapDatabaseCommentToComment(comment: CommentData): Comment {
  return {
    id: comment.id_comentario,
    text: comment.comentario,
    feedbackType: comment.tipo_feedback as "positivo" | "negativo" | "neutro",
    category: comment.categoria as "producto" | "servicio" | "logistica" | "tecnico" | "otro",
    priority: comment.prioridad,
    resolved: comment.resuelto,
    createdAt: comment.created_at.toISOString(),
    createdBy: comment.creado_por,
    createdByName: comment.creado_por_nombre,
  }
}

export const api = {
  // Users API
  getUserById: async (id: string): Promise<User | null> => {
    try {
      const usuario = await UsuarioService.obtenerPorId(id)
      return usuario ? mapUsuarioToUser(usuario) : null
    } catch (error) {
      console.error("Error obteniendo usuario:", error)
      throw new Error("Falló al obtener usuario")
    }
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    try {
      const usuario = await UsuarioService.obtenerPorEmail(email)
      return usuario ? mapUsuarioToUser(usuario) : null
    } catch (error) {
      console.error("Error obteniendo usuario por email:", error)
      throw new Error("Falló al obtener usuario")
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const usuarios = await UsuarioService.obtenerTodos()
      return usuarios.map(mapUsuarioToUser)
    } catch (error) {
      console.error("Error obteniendo usuarios:", error)
      throw new Error("Falló al obtener usuarios")
    }
  },

  createUser: async (userData: {
    nombre: string
    email: string
    clave: string
    rol_id: string
  }): Promise<User> => {
    try {
      const usuario = await UsuarioService.crear(userData)
      return mapUsuarioToUser(usuario)
    } catch (error) {
      console.error("Error creando usuario:", error)
      throw new Error("Falló al crear usuario")
    }
  },

  updateUser: async (
    id: string,
    userData: Partial<{
      nombre: string
      email: string
      clave: string
      rol_id: string
    }>,
  ): Promise<User> => {
    try {
      const usuario = await UsuarioService.actualizar(id, userData)
      return mapUsuarioToUser(usuario)
    } catch (error) {
      console.error("Error actualizando usuario:", error)
      throw new Error("Falló al actualizar usuario")
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    try {
      await UsuarioService.eliminar(id)
    } catch (error) {
      console.error("Error eliminando usuario:", error)
      throw new Error("Falló al eliminar usuario")
    }
  },

  // Teams API
  getTeamsByUser: async (userId: string): Promise<Team[]> => {
    try {
      const equipos = await EquipoService.obtenerPorUsuario(userId)
      return equipos.map(mapEquipoToTeam)
    } catch (error) {
      console.error("Error obteniendo equipos:", error)
      throw new Error("Falló al obtener equipos")
    }
  },

  getAllTeams: async (): Promise<Team[]> => {
    try {
      const equipos = await EquipoService.obtenerTodos()
      return equipos.map(mapEquipoToTeam)
    } catch (error) {
      console.error("Error obteniendo equipos:", error)
      throw new Error("Falló al obtener equipos")
    }
  },

  createTeam: async (teamData: {
    nombre: string
    tipo: string
    fecha_creacion: Date
    id_supervisor: string
  }): Promise<Team> => {
    try {
      const equipo = await EquipoService.crear(teamData)
      return mapEquipoToTeam(equipo)
    } catch (error) {
      console.error("Error creando equipo:", error)
      throw new Error("Falló al crear equipo")
    }
  },

  // Work Plans API
  getWorkPlansByTeam: async (teamId: string): Promise<WorkPlan[]> => {
    try {
      const dbPlans = await DatabaseService.getWorkPlansByTeam(teamId)
      return dbPlans.map((plan) => ({
        id: plan.id_plan,
        teamId: plan.id_equipo,
        teamName: plan.equipo_nombre,
        week: plan.semana,
        year: plan.año,
        startDate: plan.fecha_inicio.toISOString(),
        endDate: plan.fecha_fin.toISOString(),
        objectives: plan.objetivos,
        status: plan.estado,
        progress: plan.progreso,
        createdBy: plan.creado_por,
        createdByName: plan.creado_por_nombre,
      }))
    } catch (error) {
      console.error("Error fetching work plans:", error)
      throw new Error("Failed to fetch work plans")
    }
  },

  // Addresses API
  getAddressesByArea: async (bounds: {
    north: number
    south: number
    east: number
    west: number
  }): Promise<Address[]> => {
    try {
      const direcciones = await DireccionService.obtenerPorArea({
        norte: bounds.north,
        sur: bounds.south,
        este: bounds.east,
        oeste: bounds.west,
      })
      return direcciones.map(mapDireccionToAddress)
    } catch (error) {
      console.error("Error obteniendo direcciones:", error)
      throw new Error("Falló al obtener direcciones")
    }
  },

  getAllAddresses: async (limite?: number, offset?: number): Promise<Address[]> => {
    try {
      const direcciones = await DireccionService.obtenerTodas(limite, offset)
      return direcciones.map(mapDireccionToAddress)
    } catch (error) {
      console.error("Error obteniendo direcciones:", error)
      throw new Error("Falló al obtener direcciones")
    }
  },

  // Comments API
  getCommentsByAddress: async (addressId: number): Promise<Comment[]> => {
    try {
      const dbComments = await DatabaseService.getCommentsByAddress(addressId)
      return dbComments.map(mapDatabaseCommentToComment)
    } catch (error) {
      console.error("Error fetching comments:", error)
      throw new Error("Failed to fetch comments")
    }
  },

  createComment: async (commentData: {
    comentario: string
    tipo_feedback: string
    categoria: string
    prioridad: number
    creado_por?: string
  }): Promise<Comment> => {
    try {
      const dbComment = await DatabaseService.createComment(commentData)
      return mapDatabaseCommentToComment(dbComment)
    } catch (error) {
      console.error("Error creating comment:", error)
      throw new Error("Failed to create comment")
    }
  },

  // Notifications API
  getNotificationsByUser: async (userId: string): Promise<Notification[]> => {
    try {
      const dbNotifications = await DatabaseService.getNotificationsByUser(userId)
      return dbNotifications.map((notification) => ({
        id: notification.id_notificacion,
        userId: notification.id_usuario,
        title: notification.titulo,
        message: notification.mensaje,
        type: notification.tipo,
        read: notification.leida,
        actionUrl: notification.url_accion,
        createdAt: notification.created_at.toISOString(),
      }))
    } catch (error) {
      console.error("Error fetching notifications:", error)
      throw new Error("Failed to fetch notifications")
    }
  },

  markNotificationAsRead: async (notificationId: string): Promise<void> => {
    try {
      await DatabaseService.markNotificationAsRead(notificationId)
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw new Error("Failed to mark notification as read")
    }
  },

  // Dashboard metrics
  getDashboardMetrics: async (userId: string): Promise<DashboardMetrics> => {
    try {
      const estadisticasDirecciones = await DireccionService.obtenerEstadisticas()
      const equipos = await EquipoService.obtenerTodos()

      // Datos simulados para el gráfico basados en estadísticas reales
      const chartData = [
        {
          name: "Ene",
          direcciones: Math.floor(estadisticasDirecciones.total * 0.15),
          comentarios: Math.floor(estadisticasDirecciones.total * 0.12),
        },
        {
          name: "Feb",
          direcciones: Math.floor(estadisticasDirecciones.total * 0.18),
          comentarios: Math.floor(estadisticasDirecciones.total * 0.15),
        },
        {
          name: "Mar",
          direcciones: Math.floor(estadisticasDirecciones.total * 0.22),
          comentarios: Math.floor(estadisticasDirecciones.total * 0.18),
        },
        {
          name: "Abr",
          direcciones: Math.floor(estadisticasDirecciones.total * 0.16),
          comentarios: Math.floor(estadisticasDirecciones.total * 0.2),
        },
        {
          name: "May",
          direcciones: Math.floor(estadisticasDirecciones.total * 0.14),
          comentarios: Math.floor(estadisticasDirecciones.total * 0.17),
        },
        {
          name: "Jun",
          direcciones: Math.floor(estadisticasDirecciones.total * 0.15),
          comentarios: Math.floor(estadisticasDirecciones.total * 0.18),
        },
      ]

      return {
        totalAddresses: estadisticasDirecciones.total,
        verifiedAddresses: Math.floor(estadisticasDirecciones.total * 0.7), // 70% verificadas
        pendingAddresses: Math.floor(estadisticasDirecciones.total * 0.3), // 30% pendientes
        totalComments: Math.floor(estadisticasDirecciones.total * 0.4), // Estimación
        activeTeams: equipos.length,
        activePlans: Math.floor(equipos.length * 1.5), // Estimación
        chartData,
      }
    } catch (error) {
      console.error("Error obteniendo métricas del dashboard:", error)
      // Datos de respaldo si la base de datos no está disponible
      return {
        totalAddresses: 0,
        verifiedAddresses: 0,
        pendingAddresses: 0,
        totalComments: 0,
        activeTeams: 0,
        activePlans: 0,
        chartData: [],
      }
    }
  },

  // Location tracking
  saveLocation: async (locationData: {
    userId: string
    lat: number
    lng: number
    precision?: number
    speed?: number
    heading?: number
  }): Promise<void> => {
    try {
      await DatabaseService.saveLocation({
        id_usuario: locationData.userId,
        lat: locationData.lat,
        lon: locationData.lng,
        precision_metros: locationData.precision,
        velocidad_kmh: locationData.speed,
        direccion_grados: locationData.heading,
      })
    } catch (error) {
      console.error("Error saving location:", error)
      throw new Error("Failed to save location")
    }
  },

  // Route optimization (keeping mock implementation for now)
  optimizeRoute: async (points: RoutePoint[]) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      optimizedRoute: points.reverse(), // Simple mock optimization
      totalDistance: "45.2 km",
      estimatedTime: "2h 15min",
      fuelSaved: "15%",
    }
  },

  // Export functionality (keeping mock implementation)
  exportData: async (dateRange: { from: Date; to: Date }, format: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const filename = `geovision_export_${dateRange.from.toISOString().split("T")[0]}_${dateRange.to.toISOString().split("T")[0]}.${format}`

    const csvData = `Fecha,Usuario,Acción,Detalles
2024-01-15,Juan Pérez,Login,Acceso al sistema
2024-01-15,María García,Ruta creada,Ruta #123
2024-01-16,Carlos López,Exportación,Datos de usuarios`

    return {
      filename,
      data: csvData,
      size: "2.4 KB",
    }
  },
}
