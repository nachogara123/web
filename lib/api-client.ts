export class ApiClient {
  static async getDashboardStats() {
    const response = await fetch("/api/dashboard/stats")
    if (!response.ok) {
      throw new Error("Error obteniendo estadísticas")
    }
    return response.json()
  }

  static async getAddressesForMap(bounds: {
    north: number
    south: number
    east: number
    west: number
  }) {
    const params = new URLSearchParams({
      north: bounds.north.toString(),
      south: bounds.south.toString(),
      east: bounds.east.toString(),
      west: bounds.west.toString(),
    })

    const response = await fetch(`/api/direcciones/mapa?${params}`)
    if (!response.ok) {
      throw new Error("Error obteniendo direcciones")
    }
    return response.json()
  }
}
