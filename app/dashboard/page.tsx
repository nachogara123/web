"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users, Route, CheckCircle, TrendingUp } from "lucide-react"
import { MetricsChart } from "@/components/metrics-chart"
import { StatsCards } from "@/components/stats-cards"

interface DashboardData {
  totalAddresses: number
  verifiedAddresses: number
  pendingAddresses: number
  totalComments: number
  activeTeams: number
  activePlans: number
  chartData: Array<{
    name: string
    usuarios: number
    rutas: number
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const mockData: DashboardData = {
          totalAddresses: 1247,
          verifiedAddresses: 892,
          pendingAddresses: 355,
          totalComments: 423,
          activeTeams: 8,
          activePlans: 12,
          chartData: [
            { name: "Ene", usuarios: 65, rutas: 28 },
            { name: "Feb", usuarios: 78, rutas: 35 },
            { name: "Mar", usuarios: 92, rutas: 42 },
            { name: "Abr", usuarios: 108, rutas: 48 },
            { name: "May", usuarios: 125, rutas: 55 },
            { name: "Jun", usuarios: 142, rutas: 62 },
          ],
        }
        setData(mockData)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="pt-16 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Resumen general del sistema GeoVision</p>
              </div>
              <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-lg border">
                Última actualización: {new Date().toLocaleString("es-ES")}
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : data ? (
              <>
                {/* Stats Cards */}
                <StatsCards data={data} />

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MetricsChart data={data.chartData} />

                  {/* Additional Info Card */}
                  <Card className="shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Rendimiento del Sistema
                      </CardTitle>
                      <CardDescription>Métricas de eficiencia y uso</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Eficiencia General</span>
                        <span className="text-2xl font-bold text-green-600">87%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: "87%" }}
                        />
                      </div>

                      <div className="pt-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Rutas Optimizadas</span>
                          <span className="font-medium text-gray-900">87%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tiempo de Respuesta</span>
                          <span className="font-medium text-gray-900">1.2s</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Disponibilidad</span>
                          <span className="font-medium text-gray-900">99.9%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-gray-900">Actividad Reciente</CardTitle>
                    <CardDescription>Últimas acciones en el sistema</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { action: "Nueva ruta creada", user: "Juan Pérez", time: "Hace 5 minutos", type: "route" },
                        { action: "Usuario registrado", user: "María García", time: "Hace 15 minutos", type: "user" },
                        { action: "Exportación completada", user: "Carlos López", time: "Hace 1 hora", type: "export" },
                        {
                          action: "Optimización ejecutada",
                          user: "Ana Martínez",
                          time: "Hace 2 horas",
                          type: "optimization",
                        },
                      ].map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            {activity.type === "route" && <Route className="h-4 w-4 text-blue-600" />}
                            {activity.type === "user" && <Users className="h-4 w-4 text-green-600" />}
                            {activity.type === "export" && <CheckCircle className="h-4 w-4 text-purple-600" />}
                            {activity.type === "optimization" && <TrendingUp className="h-4 w-4 text-orange-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-xs text-gray-600">por {activity.user}</p>
                          </div>
                          <div className="text-xs text-gray-500">{activity.time}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center text-gray-600 bg-white p-8 rounded-lg shadow-md">
                Error al cargar los datos del dashboard
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
