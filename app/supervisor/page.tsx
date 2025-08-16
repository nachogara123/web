"use client"

import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { Users, TrendingUp, AlertTriangle, CheckCircle, Clock, MapPin, BarChart3, FileText } from "lucide-react"

export default function SupervisorPage() {
  const { user } = useAuth()

  const teamStats = [
    { label: "Ejecutivos Activos", value: "12", icon: Users, color: "bg-blue-500" },
    { label: "Rutas Completadas", value: "89%", icon: CheckCircle, color: "bg-green-500" },
    { label: "Alertas Pendientes", value: "3", icon: AlertTriangle, color: "bg-yellow-500" },
    { label: "Eficiencia Promedio", value: "94%", icon: TrendingUp, color: "bg-purple-500" },
  ]

  const recentActivities = [
    { id: 1, user: "Ana Ejecutiva", action: "Completó ruta R-001", time: "Hace 15 min", status: "success" },
    {
      id: 2,
      user: "Luis Ejecutivo",
      action: "Reportó incidencia en zona norte",
      time: "Hace 32 min",
      status: "warning",
    },
    { id: 3, user: "Carmen Vendedora", action: "Actualizó feedback de cliente", time: "Hace 1 hora", status: "info" },
    { id: 4, user: "Pedro Técnico", action: "Optimizó ruta R-045", time: "Hace 2 horas", status: "success" },
  ]

  const pendingApprovals = [
    { id: 1, type: "Modificación de Ruta", requester: "Ana Ejecutiva", priority: "Alta" },
    { id: 2, type: "Solicitud de Overtime", requester: "Luis Ejecutivo", priority: "Media" },
    { id: 3, type: "Cambio de Territorio", requester: "Carmen Vendedora", priority: "Baja" },
  ]

  return (
    <RoleGuard allowedRoles={["admin", "supervisor"]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Supervisor</h1>
            <p className="text-gray-600 mt-1">
              Bienvenido, {user?.name} - {user?.department}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Generar Reporte
            </Button>
            <Button size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Ver Analytics
            </Button>
          </div>
        </div>

        {/* Estadísticas del Equipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Actividades Recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Actividades Recientes del Equipo
              </CardTitle>
              <CardDescription>Últimas acciones realizadas por tu equipo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.user}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          activity.status === "success"
                            ? "default"
                            : activity.status === "warning"
                              ? "destructive"
                              : "secondary"
                        }
                        className="mb-1"
                      >
                        {activity.status === "success"
                          ? "Completado"
                          : activity.status === "warning"
                            ? "Atención"
                            : "Info"}
                      </Badge>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Aprobaciones Pendientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Aprobaciones Pendientes
              </CardTitle>
              <CardDescription>Solicitudes que requieren tu aprobación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals.map((approval) => (
                  <div key={approval.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{approval.type}</h4>
                      <Badge
                        variant={
                          approval.priority === "Alta"
                            ? "destructive"
                            : approval.priority === "Media"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {approval.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">Solicitado por: {approval.requester}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="default">
                        Aprobar
                      </Button>
                      <Button size="sm" variant="outline">
                        Revisar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mapa de Territorio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Vista de Territorio del Equipo
            </CardTitle>
            <CardDescription>Ubicaciones y rutas activas de tu equipo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Mapa interactivo del territorio</p>
                <p className="text-sm text-gray-500">Mostrando 12 ejecutivos activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
