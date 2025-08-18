import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseUrl } from "@/lib/database"
import { neon } from "@neondatabase/serverless"
import { isValidUUID, DEFAULT_USER_UUID } from "@/lib/utils/uuid"

export async function POST(request: NextRequest) {
  try {
    const { usuario_id, latitud, longitud, precision_metros, velocidad_kmh, direccion_grados } = await request.json()

    if (!latitud || !longitud) {
      return NextResponse.json({ error: "Faltan datos requeridos: latitud, longitud" }, { status: 400 })
    }

    const validUsuarioId = isValidUUID(usuario_id) ? usuario_id : DEFAULT_USER_UUID

    if (usuario_id !== validUsuarioId) {
      console.warn(`[v0] UUID de usuario inválido: "${usuario_id}", usando UUID por defecto: "${validUsuarioId}"`)
    }

    const sql = neon(getDatabaseUrl())

    const result = await sql`
      INSERT INTO historial_ubicaciones (
        id_usuario,
        fecha_hora,
        geom,
        precision_metros,
        velocidad_kmh,
        direccion_grados
      ) VALUES (
        ${validUsuarioId},
        NOW(),
        ST_SetSRID(ST_MakePoint(${longitud}, ${latitud}), 4326),
        ${precision_metros || null},
        ${velocidad_kmh || null},
        ${direccion_grados || null}
      )
      RETURNING id_historial
    `

    console.log("[v0] Ubicación de usuario guardada:", {
      usuario_id: validUsuarioId,
      latitud,
      longitud,
      precision_metros,
    })

    return NextResponse.json({
      success: true,
      id: result[0]?.id_historial,
      message: "Ubicación guardada correctamente",
    })
  } catch (error) {
    console.error("[v0] Error guardando ubicación:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
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
      if (!isValidUUID(usuario_id)) {
        return NextResponse.json({ error: "UUID de usuario inválido" }, { status: 400 })
      }

      query = sql`
        SELECT 
          h.id_historial,
          h.id_usuario,
          h.fecha_hora,
          ST_X(h.geom) as longitud,
          ST_Y(h.geom) as latitud,
          h.precision_metros,
          h.velocidad_kmh,
          h.direccion_grados,
          u.nombre as usuario_nombre
        FROM historial_ubicaciones h
        LEFT JOIN usuarios u ON h.id_usuario = u.id_user
        WHERE h.id_usuario = ${usuario_id}
        ORDER BY h.fecha_hora DESC
        LIMIT ${limit}
      `
    } else {
      query = sql`
        SELECT 
          h.id_historial,
          h.id_usuario,
          h.fecha_hora,
          ST_X(h.geom) as longitud,
          ST_Y(h.geom) as latitud,
          h.precision_metros,
          h.velocidad_kmh,
          h.direccion_grados,
          u.nombre as usuario_nombre
        FROM historial_ubicaciones h
        LEFT JOIN usuarios u ON h.id_usuario = u.id_user
        ORDER BY h.fecha_hora DESC
        LIMIT ${limit}
      `
    }

    const ubicaciones = await query

    return NextResponse.json({
      success: true,
      ubicaciones,
      total: ubicaciones.length,
    })
  } catch (error) {
    console.error("[v0] Error obteniendo ubicaciones:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
