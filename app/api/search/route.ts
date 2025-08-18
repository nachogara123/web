import { type NextRequest, NextResponse } from "next/server"
import { getDatabaseUrl } from "@/lib/database"
import { neon } from "@neondatabase/serverless"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const sql = neon(getDatabaseUrl())

    // Buscar en direcciones, comunas y CTOs
    const searchQuery = `%${query.toLowerCase()}%`

    const [direcciones, comunas] = await Promise.all([
      // Buscar direcciones
      sql`
        SELECT 
          d.id_direccion as id,
          d.direccion_final as text,
          c.nombre as comuna,
          'direccion' as type,
          d.lat,
          d.lon
        FROM direcciones d
        LEFT JOIN comunas c ON d.id_comuna = c.id_comuna
        WHERE LOWER(d.direccion_final) LIKE ${searchQuery}
           OR LOWER(d.id_cto) LIKE ${searchQuery}
        LIMIT 5
      `,

      // Buscar comunas
      sql`
        SELECT 
          id_comuna as id,
          nombre as text,
          nombre as comuna,
          'comuna' as type,
          null as lat,
          null as lon
        FROM comunas
        WHERE LOWER(nombre) LIKE ${searchQuery}
        LIMIT 3
      `,
    ])

    const suggestions = [
      ...direcciones.map((d) => ({
        id: d.id,
        text: d.text,
        comuna: d.comuna,
        type: d.type,
        coordinates: d.lat && d.lon ? [d.lat, d.lon] : null,
      })),
      ...comunas.map((c) => ({
        id: c.id,
        text: c.text,
        comuna: c.comuna,
        type: c.type,
        coordinates: null,
      })),
    ]

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("[v0] Error en búsqueda:", error)
    return NextResponse.json({ suggestions: [] })
  }
}
