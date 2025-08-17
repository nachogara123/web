// Database connection and query utilities
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export interface DatabaseUser {
  id_user: string
  nombre: string
  email: string
  rol_id: string
  rol_nombre?: string
  activo: boolean
  ultimo_acceso?: Date
  created_at: Date
}

export interface DatabaseTeam {
  id_equipo: string
  nombre: string
  tipo: string
  descripcion?: string
  fecha_creacion: Date
  id_supervisor: string
  supervisor_nombre?: string
  activo: boolean
}

export interface DatabaseWorkPlan {
  id_plan: string
  id_equipo: string
  equipo_nombre?: string
  semana: number
  año: number
  fecha_inicio: Date
  fecha_fin: Date
  objetivos?: string
  estado: string
  progreso: number
  creado_por: string
  creado_por_nombre?: string
}

export interface DatabaseAddress {
  id_direccion: number
  direccion_final: string
  lon?: number
  lat?: number
  id_canal?: number
  canal_nombre?: string
  id_comuna?: number
  comuna_nombre?: string
  id_tipo_vivienda?: number
  tipo_vivienda_nombre?: string
  nota?: string
  hub_feeder_zona?: string
  id_cto?: string
  id_estado?: number
  estado_nombre?: string
  id_clasificacion?: number
  clasificacion_nombre?: string
  contador: number
  total_comentarios: number
  verificada: boolean
  created_at: Date
}

export interface DatabaseComment {
  id_coment: string
  comentario: string
  tipo_feedback: "positivo" | "negativo" | "neutro"
  categoria: "producto" | "servicio" | "logistica" | "tecnico" | "otro"
  prioridad: number
  resuelto: boolean
  created_at: Date
  creado_por?: string
  creado_por_nombre?: string
}

export interface DatabaseNotification {
  id_notificacion: string
  id_usuario: string
  titulo: string
  mensaje: string
  tipo: "info" | "warning" | "error" | "success"
  leida: boolean
  url_accion?: string
  created_at: Date
}

export class DatabaseService {
  static async query(text: string, params?: any[]) {
    const client = await pool.connect()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  }

  // User management
  static async getUserById(id: string): Promise<DatabaseUser | null> {
    const result = await this.query(
      `
      SELECT u.*, r.nombre as rol_nombre 
      FROM usuarios u 
      LEFT JOIN roles r ON u.rol_id = r.id_rol 
      WHERE u.id_user = $1 AND u.activo = true
    `,
      [id],
    )
    return result.rows[0] || null
  }

  static async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    const result = await this.query(
      `
      SELECT u.*, r.nombre as rol_nombre 
      FROM usuarios u 
      LEFT JOIN roles r ON u.rol_id = r.id_rol 
      WHERE u.email = $1 AND u.activo = true
    `,
      [email],
    )
    return result.rows[0] || null
  }

  static async createUser(userData: {
    nombre: string
    email: string
    clave: string
    rol_id: string
    telefono?: string
  }): Promise<DatabaseUser> {
    const result = await this.query(
      `
      INSERT INTO usuarios (nombre, email, clave, rol_id, telefono)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [userData.nombre, userData.email, userData.clave, userData.rol_id, userData.telefono],
    )
    return result.rows[0]
  }

  // Team management
  static async getTeamsByUser(userId: string): Promise<DatabaseTeam[]> {
    const result = await this.query(
      `
      SELECT e.*, u.nombre as supervisor_nombre
      FROM equipos e
      LEFT JOIN usuarios u ON e.id_supervisor = u.id_user
      JOIN usuarios_equipos ue ON e.id_equipo = ue.id_equipo
      WHERE ue.id_usuario = $1 AND e.activo = true AND ue.activo = true
    `,
      [userId],
    )
    return result.rows
  }

  static async getWorkPlansByTeam(teamId: string): Promise<DatabaseWorkPlan[]> {
    const result = await this.query(
      `
      SELECT p.*, e.nombre as equipo_nombre, u.nombre as creado_por_nombre
      FROM planes_trabajo p
      LEFT JOIN equipos e ON p.id_equipo = e.id_equipo
      LEFT JOIN usuarios u ON p.creado_por = u.id_user
      WHERE p.id_equipo = $1
      ORDER BY p.fecha_inicio DESC
    `,
      [teamId],
    )
    return result.rows
  }

  // Address management
  static async getAddressesByArea(bounds: {
    north: number
    south: number
    east: number
    west: number
  }): Promise<DatabaseAddress[]> {
    const result = await this.query(
      `
      SELECT d.*, 
             c.nombre as canal_nombre,
             com.nombre as comuna_nombre,
             tv.nombre as tipo_vivienda_nombre,
             ed.nombre as estado_nombre,
             cl.nombre as clasificacion_nombre
      FROM direcciones d
      LEFT JOIN canales c ON d.id_canal = c.id_canal
      LEFT JOIN comunas com ON d.id_comuna = com.id_comuna
      LEFT JOIN tipos_vivienda tv ON d.id_tipo_vivienda = tv.id_tipo_vivienda
      LEFT JOIN estados_direccion ed ON d.id_estado = ed.id_estado
      LEFT JOIN clasificaciones cl ON d.id_clasificacion = cl.id_clasificacion
      WHERE d.lat BETWEEN $1 AND $2 AND d.lon BETWEEN $3 AND $4
      ORDER BY d.created_at DESC
    `,
      [bounds.south, bounds.north, bounds.west, bounds.east],
    )
    return result.rows
  }

  // Comments management
  static async getCommentsByAddress(addressId: number): Promise<DatabaseComment[]> {
    const result = await this.query(
      `
      SELECT cp.*, u.nombre as creado_por_nombre
      FROM comentarios_pre cp
      JOIN historias_comentarios hc ON cp.id_coment = hc.id_comentario
      LEFT JOIN usuarios u ON cp.creado_por = u.id_user
      WHERE hc.id_direccion = $1
      ORDER BY hc.fecha_comentario DESC
    `,
      [addressId],
    )
    return result.rows
  }

  static async createComment(commentData: {
    comentario: string
    tipo_feedback: string
    categoria: string
    prioridad: number
    creado_por?: string
  }): Promise<DatabaseComment> {
    const result = await this.query(
      `
      INSERT INTO comentarios_pre (comentario, tipo_feedback, categoria, prioridad, creado_por)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [
        commentData.comentario,
        commentData.tipo_feedback,
        commentData.categoria,
        commentData.prioridad,
        commentData.creado_por,
      ],
    )
    return result.rows[0]
  }

  // Notifications
  static async getNotificationsByUser(userId: string, limit = 50): Promise<DatabaseNotification[]> {
    const result = await this.query(
      `
      SELECT * FROM notificaciones
      WHERE id_usuario = $1
      ORDER BY created_at DESC
      LIMIT $2
    `,
      [userId, limit],
    )
    return result.rows
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.query(
      `
      UPDATE notificaciones 
      SET leida = true 
      WHERE id_notificacion = $1
    `,
      [notificationId],
    )
  }

  // Location tracking
  static async saveLocation(locationData: {
    id_usuario: string
    lat: number
    lon: number
    precision_metros?: number
    velocidad_kmh?: number
    direccion_grados?: number
  }): Promise<void> {
    await this.query(
      `
      INSERT INTO historial_ubicaciones (id_usuario, geom, precision_metros, velocidad_kmh, direccion_grados)
      VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, $5, $6)
    `,
      [
        locationData.id_usuario,
        locationData.lon,
        locationData.lat,
        locationData.precision_metros,
        locationData.velocidad_kmh,
        locationData.direccion_grados,
      ],
    )
  }

  // Analytics and reporting
  static async getDashboardStats(userId: string): Promise<{
    total_addresses: number
    verified_addresses: number
    pending_addresses: number
    total_comments: number
    active_teams: number
    active_plans: number
  }> {
    const result = await this.query(`
      SELECT 
        (SELECT COUNT(*) FROM direcciones) as total_addresses,
        (SELECT COUNT(*) FROM direcciones WHERE verificada = true) as verified_addresses,
        (SELECT COUNT(*) FROM direcciones d JOIN estados_direccion ed ON d.id_estado = ed.id_estado WHERE ed.nombre = 'Pendiente') as pending_addresses,
        (SELECT COUNT(*) FROM comentarios_pre) as total_comments,
        (SELECT COUNT(*) FROM equipos WHERE activo = true) as active_teams,
        (SELECT COUNT(*) FROM planes_trabajo WHERE estado IN ('planificado', 'en_progreso')) as active_plans
    `)
    return result.rows[0]
  }
}
