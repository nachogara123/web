import { NextResponse } from "next/server"
import { getDatabaseUrl } from "@/lib/database"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const databaseUrl = getDatabaseUrl()
    const sql = neon(databaseUrl)

    console.log("[v0] Obteniendo comentarios predefinidos...")

    // Obtener comentarios únicos agrupados por tipo y categoría
    const comentarios = await sql`
      SELECT DISTINCT 
        comentario,
        tipo_feedback,
        categoria
      FROM comentarios_pre 
      WHERE comentario IS NOT NULL 
        AND comentario != ''
      ORDER BY tipo_feedback, categoria, comentario
    `

    console.log(`[v0] Encontrados ${comentarios.length} comentarios predefinidos`)

    return NextResponse.json({
      success: true,
      data: comentarios,
    })
  } catch (error) {
    console.error("[v0] Error obteniendo comentarios predefinidos:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al obtener comentarios predefinidos",
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
