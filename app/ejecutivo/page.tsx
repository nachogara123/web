"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { Download } from "lucide-react"
import {
  Target,
  Calendar,
  Award,
  MapPin,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
} from "lucide-react"

interface ExecutiveStatus {
  canSelectOwnRoute: boolean
  status: "active" | "bajo" | "inactive"
  teamAssignment?: string
}

const availableRoutes = [
  "Ruta Norte A",
  "Ruta Norte B",
  "Ruta Sur A",
  "Ruta Sur B",
  "Ruta Centro",
  "Ruta Oriente",
  "Ruta Poniente",
  "Ruta Cordillera",
  "Ruta Costa",
]

const comunas = ["Las Condes", "Providencia", "Ñuñoa", "Santiago", "Maipú", "La Florida", "Puente Alto", "San Bernardo"]

export default function EjecutivoPage() {
  const { user } = useAuth()
  const [executiveStatus, setExecutiveStatus] = useState<ExecutiveStatus>({
    canSelectOwnRoute: true,
    status: "active",
  })
  const [isRouteSelectionOpen, setIsRouteSelectionOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState("")
  const [selectedComuna, setSelectedComuna] = useState("")
  const [customRoute, setCustomRoute] = useState({
    name: "",
    startPoint: "",
    endPoint: "",
    estimatedTime: "",
  })

  useEffect(() => {
    const mockStatus: ExecutiveStatus = {
      canSelectOwnRoute: user?.name !== "Luis Ejecutivo", // Luis está bajo supervisión
      status: user?.name === "Luis Ejecutivo" ? "bajo" : "active",
      teamAssignment: user?.name === "Ana Ejecutiva" ? "Equipo Norte A" : undefined,
    }
    setExecutiveStatus(mockStatus)
  }, [user])

  const handleRouteSelection = () => {
    if (!selectedRoute && !customRoute.name) return

    // Aquí se guardaría la ruta seleccionada
    console.log("[v0] Ruta seleccionada:", selectedRoute || customRoute.name)
    setIsRouteSelectionOpen(false)
    setSelectedRoute("")
    setCustomRoute({ name: "", startPoint: "", endPoint: "", estimatedTime: "" })
  }

  const personalStats = [
    { label: "Ventas del Mes", value: "$45,230", icon: DollarSign, color: "bg-green-500", change: "+12%" },
    { label: "Clientes Visitados", value: "87", icon: Users, color: "bg-blue-500", change: "+8%" },
    { label: "Meta Mensual", value: "78%", icon: Target, color: "bg-purple-500", change: "+5%" },
    { label: "Ranking", value: "#3", icon: Award, color: "bg-yellow-500", change: "↑2" },
  ]

  const todayTasks = [
    { id: 1, client: "Empresa ABC", time: "09:00", status: "completed", type: "Visita" },
    { id: 2, client: "Corporativo XYZ", time: "11:30", status: "pending", type: "Presentación" },
    { id: 3, client: "Tienda Local", time: "14:00", status: "pending", type: "Seguimiento" },
    { id: 4, client: "Oficina Central", time: "16:30", status: "pending", type: "Reunión" },
  ]

  const recentSales = [
    { id: 1, client: "Empresa ABC", amount: "$2,500", product: "Paquete Premium", date: "Hoy" },
    { id: 2, client: "Startup Tech", amount: "$1,800", product: "Plan Básico", date: "Ayer" },
    { id: 3, client: "Retail Store", amount: "$3,200", product: "Paquete Completo", date: "2 días" },
  ]

  const monthlyGoals = [
    { goal: "Ventas Totales", current: 78, target: 100, unit: "%" },
    { goal: "Nuevos Clientes", current: 12, target: 15, unit: "clientes" },
    { goal: "Visitas Programadas", current: 87, target: 100, unit: "visitas" },
  ]

  return (
    <RoleGuard allowedRoles={["admin", "ejecutivo"]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel Ejecutivo</h1>
            <p className="text-gray-600 mt-1">
              Bienvenido, {user?.name} - {user?.department}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={executiveStatus.status === "active" ? "default" : "destructive"}>
                {executiveStatus.status === "active"
                  ? "Activo"
                  : executiveStatus.status === "bajo"
                    ? "Bajo Supervisión"
                    : "Inactivo"}
              </Badge>
              {executiveStatus.canSelectOwnRoute ? (
                <Badge variant="outline" className="text-green-600">
                  <Unlock className="h-3 w-3 mr-1" />
                  Autonomía de Ruta
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600">
                  <Lock className="h-3 w-3 mr-1" />
                  Sin Autonomía
                </Badge>
              )}
              {executiveStatus.teamAssignment && (
                <Badge variant="secondary">Equipo: {executiveStatus.teamAssignment}</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Mi Agenda
            </Button>
            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Ver Mi Ubicación
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agenda de Hoy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Agenda de Hoy
              </CardTitle>
              <CardDescription>Tus citas y tareas programadas para hoy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {task.status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{task.client}</p>
                        <p className="text-sm text-gray-600">{task.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{task.time}</p>
                      <Badge variant={task.status === "completed" ? "default" : "secondary"}>
                        {task.status === "completed" ? "Completado" : "Pendiente"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agenda Semanal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Agenda Semanal
              </CardTitle>
              <CardDescription>Vista de tu semana</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].map((day, index) => (
                  <div key={day} className="flex items-center justify-between p-2 border rounded">
                    <span className="font-medium">{day}</span>
                    <span className="text-sm text-gray-600">{3 + index} citas</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mapa de Ubicación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mi Ubicación Actual
            </CardTitle>
            <CardDescription>
              Ubicación guardada con fecha {new Date().toLocaleDateString()} - ID: {user?.id}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                <p className="text-gray-600">Ubicación actual del ejecutivo</p>
                <p className="text-sm text-gray-500">Lat: -33.4489, Lng: -70.6693</p>
                <Button className="mt-2" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Ubicación CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
