// Mock API functions for the frontend
export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "viewer"
  status: "active" | "inactive"
  createdAt: string
}

export interface RoutePoint {
  id: string
  lat: number
  lng: number
  address: string
}

export interface ExportData {
  id: string
  type: string
  date: string
  size: string
}

// Mock users data
const mockUsers: User[] = [
  { id: "1", name: "Juan Pérez", email: "juan@example.com", role: "admin", status: "active", createdAt: "2024-01-15" },
  {
    id: "2",
    name: "María García",
    email: "maria@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    name: "Carlos López",
    email: "carlos@example.com",
    role: "viewer",
    status: "inactive",
    createdAt: "2024-02-01",
  },
  { id: "4", name: "Ana Martínez", email: "ana@example.com", role: "user", status: "active", createdAt: "2024-02-10" },
]

export const api = {
  // Users API
  getUsers: async (roleFilter?: string): Promise<User[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay
    if (roleFilter && roleFilter !== "all") {
      return mockUsers.filter((user) => user.role === roleFilter)
    }
    return mockUsers
  },

  // Dashboard metrics
  getDashboardMetrics: async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return {
      totalUsers: 1250,
      activeRoutes: 45,
      completedTasks: 89,
      efficiency: 94.2,
      chartData: [
        { name: "Ene", usuarios: 400, rutas: 240 },
        { name: "Feb", usuarios: 300, rutas: 139 },
        { name: "Mar", usuarios: 200, rutas: 980 },
        { name: "Abr", usuarios: 278, rutas: 390 },
        { name: "May", usuarios: 189, rutas: 480 },
        { name: "Jun", usuarios: 239, rutas: 380 },
      ],
    }
  },

  // Route optimization
  optimizeRoute: async (points: RoutePoint[]) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return {
      optimizedRoute: points.reverse(), // Simple mock optimization
      totalDistance: "45.2 km",
      estimatedTime: "2h 15min",
      fuelSaved: "15%",
    }
  },

  // Export functionality
  exportData: async (dateRange: { from: Date; to: Date }, format: string) => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    const filename = `geovision_export_${dateRange.from.toISOString().split("T")[0]}_${dateRange.to.toISOString().split("T")[0]}.${format}`

    // Mock CSV data
    const csvData = `Fecha,Usuario,Acción,Detalles
2024-01-15,Juan Pérez,Login,Acceso al sistema
2024-01-15,María García,Ruta creada,Ruta #123
2024-01-16,Carlos López,Exportación,Datos de usuarios`

    return {
      filename,
      data: csvData,
      size: "2.4 KB",
    }
  },
}
