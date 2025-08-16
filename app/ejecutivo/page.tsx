"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/use-auth"
import {
  Target,
  TrendingUp,
  Calendar,
  Award,
  MapPin,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  AlertCircle,
  Route,
  Navigation,
  Lock,
  Unlock,
  Map,
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

            {executiveStatus.canSelectOwnRoute ? (
              <Dialog open={isRouteSelectionOpen} onOpenChange={setIsRouteSelectionOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Route className="h-4 w-4 mr-2" />
                    Seleccionar Mi Ruta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Seleccionar Ruta Personal</DialogTitle>
                    <DialogDescription>
                      Como ejecutivo autónomo, puedes seleccionar tu propia ruta de trabajo
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Rutas Predefinidas</h4>
                      <div className="space-y-2">
                        <Label>Comuna de Trabajo</Label>
                        <Select value={selectedComuna} onValueChange={setSelectedComuna}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar comuna" />
                          </SelectTrigger>
                          <SelectContent>
                            {comunas.map((comuna) => (
                              <SelectItem key={comuna} value={comuna}>
                                {comuna}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Ruta Disponible</Label>
                        <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar ruta predefinida" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableRoutes.map((route) => (
                              <SelectItem key={route} value={route}>
                                {route}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-4">O Crear Ruta Personalizada</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nombre de la Ruta</Label>
                          <Input
                            value={customRoute.name}
                            onChange={(e) => setCustomRoute({ ...customRoute, name: e.target.value })}
                            placeholder="Mi Ruta Personalizada"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tiempo Estimado</Label>
                          <Input
                            value={customRoute.estimatedTime}
                            onChange={(e) => setCustomRoute({ ...customRoute, estimatedTime: e.target.value })}
                            placeholder="8 horas"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Punto de Inicio</Label>
                          <Input
                            value={customRoute.startPoint}
                            onChange={(e) => setCustomRoute({ ...customRoute, startPoint: e.target.value })}
                            placeholder="Dirección de inicio"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Punto Final</Label>
                          <Input
                            value={customRoute.endPoint}
                            onChange={(e) => setCustomRoute({ ...customRoute, endPoint: e.target.value })}
                            placeholder="Dirección final"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Map className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Vista previa del mapa</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsRouteSelectionOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleRouteSelection}>Confirmar Ruta</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Button size="sm" disabled className="opacity-50">
                <Lock className="h-4 w-4 mr-2" />
                Ruta Asignada por Supervisor
              </Button>
            )}

            <Button variant="outline" size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Ver Mi Ubicación
            </Button>
          </div>
        </div>

        {!executiveStatus.canSelectOwnRoute && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Modo de Supervisión Activo</p>
                  <p className="text-sm text-yellow-700">
                    Tu supervisor gestiona tu ruta de trabajo. No puedes seleccionar rutas de forma autónoma.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {executiveStatus.teamAssignment && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Asignado a {executiveStatus.teamAssignment}</p>
                  <p className="text-sm text-blue-700">
                    Trabajas como parte de un equipo. Coordina con tu supervisor para cambios de ruta.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estadísticas Personales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {personalStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600 font-medium">{stat.change}</p>
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

          {/* Ventas Recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Ventas Recientes
              </CardTitle>
              <CardDescription>Tus últimas ventas cerradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{sale.client}</h4>
                      <span className="text-lg font-bold text-green-600">{sale.amount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{sale.product}</span>
                      <span>{sale.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metas Mensuales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progreso de Metas Mensuales
            </CardTitle>
            <CardDescription>Tu avance hacia los objetivos del mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {monthlyGoals.map((goal, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{goal.goal}</h4>
                    <span className="text-sm text-gray-600">
                      {goal.current}/{goal.target} {goal.unit}
                    </span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                  <p className="text-sm text-gray-600">{Math.round((goal.current / goal.target) * 100)}% completado</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mapa de Territorio Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mi Territorio
              {executiveStatus.canSelectOwnRoute && (
                <Badge variant="outline" className="ml-2">
                  <Navigation className="h-3 w-3 mr-1" />
                  Ruta Autónoma
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {executiveStatus.canSelectOwnRoute
                ? "Clientes y rutas que puedes gestionar de forma autónoma"
                : "Territorio asignado por tu supervisor"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Mapa de tu territorio personal</p>
                <p className="text-sm text-gray-500">Mostrando 23 clientes activos</p>
                {!executiveStatus.canSelectOwnRoute && (
                  <p className="text-xs text-yellow-600 mt-1">Ruta gestionada por supervisor</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
