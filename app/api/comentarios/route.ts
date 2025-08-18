import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseUrl } from "@/lib/database"
import { neon } from "@neondatabase/serverless"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const direccionId = searchParams.get("direccion_id")

    const sql = neon(getDatabaseUrl())

    let query = `
      SELECT 
        cp.id_coment,
        cp.comentario,
        cp.tipo_feedback,
        cp.categoria,
        cp.prioridad,
        cp.resuelto,
        cp.created_at,
        u.nombre as usuario_nombre
      FROM comentarios_pre cp
      LEFT JOIN usuarios u ON cp.creado_por = u.id_user
    `

    const params: any[] = []

    if (direccionId) {
      query += ` WHERE cp.id_coment = $1`
      params.push(direccionId)
    }

    query += ` ORDER BY cp.created_at DESC`

    const comentarios = await sql(query, params)

    return NextResponse.json({
      success: true,
      data: comentarios,
    })
  } catch (error) {
    console.error("[v0] Error obteniendo comentarios:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener comentarios",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { direccion_id, comentario, tipo_feedback, categoria, usuario_id } = body

    const sql = neon(getDatabaseUrl())

    const comentarioPre = await sql(
      `
      INSERT INTO comentarios_pre (
        comentario, tipo_feedback, categoria, prioridad, creado_por, created_at, resuelto
      ) VALUES ($1, $2, $3, $4, $5, NOW(), false)
      RETURNING id_coment
    `,
      [comentario, tipo_feedback, categoria, 1, usuario_id],
    )

    await sql(
      `
      INSERT INTO historias_comentarios (
        id_direccion, id_usuario, estado, fecha_comentario, id_comentario
      ) VALUES ($1, $2, 'nuevo', NOW(), $3)
    `,
      [direccion_id, usuario_id, comentarioPre[0].id_coment],
    )

    return NextResponse.json({
      success: true,
      message: "Comentario guardado exitosamente",
    })
  } catch (error) {
    console.error("[v0] Error guardando comentario:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al guardar comentario",
      },
      { status: 500 },
    )
  }
}
