import { type NextRequest, NextResponse } from "next/server"
import { ComentarioService } from "@/lib/services/comentario.service"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Obteniendo comentarios...")

    const { searchParams } = new URL(request.url)
    const direccionId = searchParams.get("direccion_id")

    let comentarios
    if (direccionId) {
      comentarios = await ComentarioService.obtenerPorDireccion(Number.parseInt(direccionId))
    } else {
      comentarios = await ComentarioService.obtenerTodos()
    }

    console.log(`[v0] Encontrados ${comentarios.length} comentarios`)
    return NextResponse.json(comentarios)
  } catch (error) {
    console.error("[v0] Error obteniendo comentarios:", error)
    return NextResponse.json({ error: "Error al obtener comentarios" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Creando nuevo comentario...")

    const body = await request.json()
    const { comentario, tipo_feedback, categoria, creado_por, direccion_id } = body

    // Crear comentario en comentarios_pre
    const nuevoComentario = await ComentarioService.crear({
      comentario,
      tipo_feedback,
      categoria,
      creado_por,
    })

    // Si se especifica una dirección, asignar el comentario a esa dirección
    if (direccion_id && creado_por) {
      await ComentarioService.asignarADireccion(nuevoComentario.id_coment, Number.parseInt(direccion_id), creado_por)
    }

    console.log("[v0] Comentario creado exitosamente")
    return NextResponse.json(nuevoComentario)
  } catch (error) {
    console.error("[v0] Error creando comentario:", error)
    return NextResponse.json({ error: "Error al crear comentario" }, { status: 500 })
  }
}
