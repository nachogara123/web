import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const north = Number.parseFloat(searchParams.get("north") || "0")
    const south = Number.parseFloat(searchParams.get("south") || "0")
    const east = Number.parseFloat(searchParams.get("east") || "0")
    const west = Number.parseFloat(searchParams.get("west") || "0")

    const addresses = await DatabaseService.getAddressesByArea({
      north,
      south,
      east,
      west,
    })

    return NextResponse.json(addresses)
  } catch (error) {
    console.error("[v0] Error obteniendo direcciones:", error)
    return NextResponse.json({ error: "Error obteniendo direcciones" }, { status: 500 })
  }
}
