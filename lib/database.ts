// Database connection and query utilities
import { neon } from "@neondatabase/serverless"

export function getDatabaseUrl() {
  // URL específica proporcionada por el usuario
  const specificUrl =
    "postgresql://neondb_owner:npg_YSWDm3bHO6Gt@ep-falling-truth-adjz53rq-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

  // Fallbacks a variables de entorno
  const databaseUrl =
    process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL || specificUrl

  if (!databaseUrl) {
    console.log(
      "[v0] Variables de entorno disponibles:",
      Object.keys(process.env).filter(
        (key) => key.includes("DATABASE") || key.includes("POSTGRES") || key.includes("NEON"),
      ),
    )
    throw new Error(
      "No se encontró la variable de entorno de la base de datos. Verifica que DATABASE_URL esté configurada.",
    )
  }

  console.log("[v0] Usando conexión a base de datos:", databaseUrl.substring(0, 50) + "...")
  return databaseUrl
}

// Crear conexión SQL usando Neon (solo servidor)
export const sql = neon(getDatabaseUrl())

export async function verifyConnection() {
  try {
    console.log("[v0] Verificando conexión a base de datos...")
    const result = await sql`SELECT 1 as test, current_database() as db_name, version() as db_version`
    console.log("[v0] Conexión exitosa:", result[0])
    return true
  } catch (error) {
    console.error("[v0] Error de conexión:", error)
    throw error
  }
}

export async function healthCheck() {
  try {
    const result = await sql`
      SELECT 
        current_database() as database_name,
        current_user as user_name,
        version() as version,
        now() as current_time
    `
    return {
      status: "connected",
      info: result[0],
    }
  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

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
    try {
      return await sql(text, params || [])
    } catch (error) {
      throw error
    }
  }

  // User management
  static async getUserById(id: string): Promise<DatabaseUser | null> {
    const result = await sql`
      SELECT u.*, r.nombre as rol_nombre 
      FROM usuarios u 
      LEFT JOIN roles r ON u.rol_id = r.id_rol 
      WHERE u.id_user = ${id} AND u.activo = true
    `
    return result[0] || null
  }

  static async getUserByEmail(email: string): Promise<DatabaseUser | null> {
    const result = await sql`
      SELECT u.*, r.nombre as rol_nombre 
      FROM usuarios u 
      LEFT JOIN roles r ON u.rol_id = r.id_rol 
      WHERE u.email = ${email} AND u.activo = true
    `
    return result[0] || null
  }

  static async createUser(userData: {
    nombre: string
    email: string
    clave: string
    rol_id: string
    telefono?: string
  }): Promise<DatabaseUser> {
    const result = await sql`
      INSERT INTO usuarios (nombre, email, clave, rol_id, telefono, activo)
      VALUES (${userData.nombre}, ${userData.email}, ${userData.clave}, ${userData.rol_id}, ${userData.telefono || null}, true)
      RETURNING *
    `
    return result[0]
  }

  // Team management
  static async getTeamsByUser(userId: string): Promise<DatabaseTeam[]> {
    const result = await sql`
      SELECT e.*, u.nombre as supervisor_nombre
      FROM equipos e
      LEFT JOIN usuarios u ON e.id_supervisor = u.id_user
      JOIN usuarios_equipos ue ON e.id_equipo = ue.id_equipo
      WHERE ue.id_usuario = ${userId} AND e.activo = true AND ue.activo = true
    `
    return result
  }

  static async getWorkPlansByTeam(teamId: string): Promise<DatabaseWorkPlan[]> {
    const result = await sql`
      SELECT p.*, e.nombre as equipo_nombre, u.nombre as creado_por_nombre
      FROM planes_trabajo p
      LEFT JOIN equipos e ON p.id_equipo = e.id_equipo
      LEFT JOIN usuarios u ON p.creado_por = u.id_user
      WHERE p.id_equipo = ${teamId}
      ORDER BY p.fecha_inicio DESC
    `
    return result
  }

  // Address management
  static async getAddressesByArea(bounds: {
    north: number
    south: number
    east: number
    west: number
  }): Promise<DatabaseAddress[]> {
    const result = await sql`
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
      WHERE d.lat BETWEEN ${bounds.south} AND ${bounds.north} 
        AND d.lon BETWEEN ${bounds.west} AND ${bounds.east}
      ORDER BY d.created_at DESC
    `
    return result
  }

  // Comments management
  static async getCommentsByAddress(addressId: number): Promise<DatabaseComment[]> {
    const result = await sql`
      SELECT cp.*, u.nombre as creado_por_nombre
      FROM comentarios_pre cp
      JOIN historias_comentarios hc ON cp.id_coment = hc.id_comentario
      LEFT JOIN usuarios u ON cp.creado_por = u.id_user
      WHERE hc.id_direccion = ${addressId}
      ORDER BY hc.fecha_comentario DESC
    `
    return result
  }

  static async createComment(commentData: {
    comentario: string
    tipo_feedback: string
    categoria: string
    prioridad: number
    creado_por?: string
  }): Promise<DatabaseComment> {
    const result = await sql`
      INSERT INTO comentarios_pre (comentario, tipo_feedback, categoria, prioridad, creado_por)
      VALUES (${commentData.comentario}, ${commentData.tipo_feedback}, ${commentData.categoria}, ${commentData.prioridad}, ${commentData.creado_por || null})
      RETURNING *
    `
    return result[0]
  }

  // Notifications
  static async getNotificationsByUser(userId: string, limit = 50): Promise<DatabaseNotification[]> {
    const result = await sql`
      SELECT * FROM notificaciones
      WHERE id_usuario = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return result
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    await sql`
      UPDATE notificaciones 
      SET leida = true 
      WHERE id_notificacion = ${notificationId}
    `
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
    await sql`
      INSERT INTO historial_ubicaciones (id_usuario, geom, precision_metros, velocidad_kmh, direccion_grados)
      VALUES (${locationData.id_usuario}, ST_SetSRID(ST_MakePoint(${locationData.lon}, ${locationData.lat}), 4326), ${locationData.precision_metros || null}, ${locationData.velocidad_kmh || null}, ${locationData.direccion_grados || null})
    `
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
    const result = await sql`
      SELECT 
        (SELECT COUNT(*) FROM direcciones) as total_addresses,
        (SELECT COUNT(*) FROM direcciones WHERE verificada = true) as verified_addresses,
        (SELECT COUNT(*) FROM direcciones d JOIN estados_direccion ed ON d.id_estado = ed.id_estado WHERE ed.nombre = 'Pendiente') as pending_addresses,
        (SELECT COUNT(*) FROM comentarios_pre) as total_comments,
        (SELECT COUNT(*) FROM equipos WHERE activo = true) as active_teams,
        (SELECT COUNT(*) FROM planes_trabajo WHERE estado IN ('planificado', 'en_progreso')) as active_plans
    `
    return {
      total_addresses: Number(result[0].total_addresses),
      verified_addresses: Number(result[0].verified_addresses),
      pending_addresses: Number(result[0].pending_addresses),
      total_comments: Number(result[0].total_comments),
      active_teams: Number(result[0].active_teams),
      active_plans: Number(result[0].active_plans),
    }
  }
}
