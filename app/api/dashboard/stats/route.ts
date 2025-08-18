import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const stats = await DatabaseService.getDashboardStats("")
    return NextResponse.json(stats)
  } catch (error) {
    console.error("[v0] Error obteniendo estadísticas:", error)
    return NextResponse.json({ error: "Error obteniendo estadísticas" }, { status: 500 })
  }
}
