import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const north = Number.parseFloat(searchParams.get("north") || "90")
    const south = Number.parseFloat(searchParams.get("south") || "-90")
    const east = Number.parseFloat(searchParams.get("east") || "180")
    const west = Number.parseFloat(searchParams.get("west") || "-180")
    const limit = Number.parseInt(searchParams.get("limit") || "1000")

    console.log("[v0] Obteniendo direcciones con bounds:", { north, south, east, west, limit })

    const direcciones = await DatabaseService.getAddressesByArea({
      north,
      south,
      east,
      west,
    })

    const direccionesLimitadas = direcciones.slice(0, limit)

    console.log(`[v0] Encontradas ${direcciones.length} direcciones, mostrando ${direccionesLimitadas.length}`)

    return NextResponse.json({
      success: true,
      data: direccionesLimitadas,
      total: direcciones.length,
      showing: direccionesLimitadas.length,
    })
  } catch (error) {
    console.error("[v0] Error obteniendo direcciones:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
