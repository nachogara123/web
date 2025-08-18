import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseUrl } from "@/lib/database"
import { neon } from "@neondatabase/serverless"

export async function POST(request: NextRequest) {
  try {
    const { usuario_id, latitud, longitud, timestamp } = await request.json()

    if (!usuario_id || !latitud || !longitud) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    const sql = neon(getDatabaseUrl())

    // Insertar ubicación en la tabla historial_ubicaciones
    const result = await sql`
      INSERT INTO historial_ubicaciones (
        id_usuario,
        latitud,
        longitud,
        timestamp,
        tipo_registro,
        precision_metros
      ) VALUES (
        ${usuario_id},
        ${latitud},
        ${longitud},
        ${timestamp || new Date().toISOString()},
        'manual',
        10
      )
      RETURNING id_ubicacion
    `

    console.log("[v0] Ubicación guardada:", { usuario_id, latitud, longitud })

    return NextResponse.json({
      success: true,
      id: result[0]?.id_ubicacion,
      message: "Ubicación guardada correctamente",
    })
  } catch (error) {
    console.error("[v0] Error guardando ubicación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuario_id = searchParams.get("usuario_id")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const sql = neon(getDatabaseUrl())

    let query
    if (usuario_id) {
      query = sql`
        SELECT 
          h.*,
          u.nombre as usuario_nombre
        FROM historial_ubicaciones h
        LEFT JOIN usuarios u ON h.id_usuario = u.id_user
        WHERE h.id_usuario = ${usuario_id}
        ORDER BY h.timestamp DESC
        LIMIT ${limit}
      `
    } else {
      query = sql`
        SELECT 
          h.*,
          u.nombre as usuario_nombre
        FROM historial_ubicaciones h
        LEFT JOIN usuarios u ON h.id_usuario = u.id_user
        ORDER BY h.timestamp DESC
        LIMIT ${limit}
      `
    }

    const ubicaciones = await query

    return NextResponse.json({ ubicaciones })
  } catch (error) {
    console.error("[v0] Error obteniendo ubicaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
