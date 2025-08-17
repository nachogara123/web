import {
  DatabaseService,
  type DatabaseUser,
  type DatabaseTeam,
  type DatabaseAddress,
  type DatabaseComment,
} from "./database"

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
function mapDatabaseUserToUser(dbUser: DatabaseUser): User {
  return {
    id: dbUser.id_user,
    name: dbUser.nombre,
    email: dbUser.email,
    role: dbUser.rol_id,
    roleName: dbUser.rol_nombre,
    status: dbUser.activo ? "active" : "inactive",
    createdAt: dbUser.created_at.toISOString(),
    lastAccess: dbUser.ultimo_acceso?.toISOString(),
  }
}

function mapDatabaseTeamToTeam(dbTeam: DatabaseTeam): Team {
  return {
    id: dbTeam.id_equipo,
    name: dbTeam.nombre,
    type: dbTeam.tipo,
    description: dbTeam.descripcion,
    supervisor: dbTeam.id_supervisor,
    supervisorName: dbTeam.supervisor_nombre,
    createdAt: dbTeam.fecha_creacion.toISOString(),
    active: dbTeam.activo,
  }
}

function mapDatabaseAddressToAddress(dbAddress: DatabaseAddress): Address {
  return {
    id: dbAddress.id_direccion,
    address: dbAddress.direccion_final,
    lat: dbAddress.lat,
    lng: dbAddress.lon,
    channel: dbAddress.canal_nombre,
    commune: dbAddress.comuna_nombre,
    housingType: dbAddress.tipo_vivienda_nombre,
    note: dbAddress.nota,
    hubFeederZone: dbAddress.hub_feeder_zona,
    ctoId: dbAddress.id_cto,
    status: dbAddress.estado_nombre,
    classification: dbAddress.clasificacion_nombre,
    counter: dbAddress.contador,
    totalComments: dbAddress.total_comentarios,
    verified: dbAddress.verificada,
    createdAt: dbAddress.created_at.toISOString(),
  }
}

function mapDatabaseCommentToComment(dbComment: DatabaseComment): Comment {
  return {
    id: dbComment.id_coment,
    text: dbComment.comentario,
    feedbackType: dbComment.tipo_feedback,
    category: dbComment.categoria,
    priority: dbComment.prioridad,
    resolved: dbComment.resuelto,
    createdAt: dbComment.created_at.toISOString(),
    createdBy: dbComment.creado_por,
    createdByName: dbComment.creado_por_nombre,
  }
}

export const api = {
  // Users API
  getUserById: async (id: string): Promise<User | null> => {
    try {
      const dbUser = await DatabaseService.getUserById(id)
      return dbUser ? mapDatabaseUserToUser(dbUser) : null
    } catch (error) {
      console.error("Error fetching user:", error)
      throw new Error("Failed to fetch user")
    }
  },

  getUserByEmail: async (email: string): Promise<User | null> => {
    try {
      const dbUser = await DatabaseService.getUserByEmail(email)
      return dbUser ? mapDatabaseUserToUser(dbUser) : null
    } catch (error) {
      console.error("Error fetching user by email:", error)
      throw new Error("Failed to fetch user")
    }
  },

  // Teams API
  getTeamsByUser: async (userId: string): Promise<Team[]> => {
    try {
      const dbTeams = await DatabaseService.getTeamsByUser(userId)
      return dbTeams.map(mapDatabaseTeamToTeam)
    } catch (error) {
      console.error("Error fetching teams:", error)
      throw new Error("Failed to fetch teams")
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
      const dbAddresses = await DatabaseService.getAddressesByArea(bounds)
      return dbAddresses.map(mapDatabaseAddressToAddress)
    } catch (error) {
      console.error("Error fetching addresses:", error)
      throw new Error("Failed to fetch addresses")
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
      const stats = await DatabaseService.getDashboardStats(userId)

      // Generate mock chart data based on real stats
      const chartData = [
        {
          name: "Ene",
          direcciones: Math.floor(stats.total_addresses * 0.15),
          comentarios: Math.floor(stats.total_comments * 0.12),
        },
        {
          name: "Feb",
          direcciones: Math.floor(stats.total_addresses * 0.18),
          comentarios: Math.floor(stats.total_comments * 0.15),
        },
        {
          name: "Mar",
          direcciones: Math.floor(stats.total_addresses * 0.22),
          comentarios: Math.floor(stats.total_comments * 0.18),
        },
        {
          name: "Abr",
          direcciones: Math.floor(stats.total_addresses * 0.16),
          comentarios: Math.floor(stats.total_comments * 0.2),
        },
        {
          name: "May",
          direcciones: Math.floor(stats.total_addresses * 0.14),
          comentarios: Math.floor(stats.total_comments * 0.17),
        },
        {
          name: "Jun",
          direcciones: Math.floor(stats.total_addresses * 0.15),
          comentarios: Math.floor(stats.total_comments * 0.18),
        },
      ]

      return {
        totalAddresses: stats.total_addresses,
        verifiedAddresses: stats.verified_addresses,
        pendingAddresses: stats.pending_addresses,
        totalComments: stats.total_comments,
        activeTeams: stats.active_teams,
        activePlans: stats.active_plans,
        chartData,
      }
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error)
      // Return fallback data if database is not available
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
