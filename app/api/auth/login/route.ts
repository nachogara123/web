import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getDatabaseUrl } from "../../../lib/database"

const sql = neon(getDatabaseUrl())

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    // Buscar usuario en la base de datos
    const users = await sql`
      SELECT 
        u.id_user as id,
        u.email,
        u.nombre as name,
        u.clave,
        u.activo,
        r.nombre as role_name,
        r.permisos
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id_rol
      WHERE u.email = ${email} AND u.activo = true
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 401 })
    }

    const user = users[0]

    // Verificar contraseña (en producción usar bcrypt)
    if (user.clave !== password) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
    }

    // Actualizar último acceso
    await sql`
      UPDATE usuarios 
      SET ultimo_acceso = NOW() 
      WHERE id_user = ${user.id}
    `

    // Preparar datos del usuario para el frontend
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role_name?.toLowerCase() || "ejecutivo",
      permissions: user.permisos || [],
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("[v0] Error en login:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
