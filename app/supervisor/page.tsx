"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MapPin,
  BarChart3,
  FileText,
  Plus,
  Calendar,
  Route,
  Shield,
  Navigation,
  UserCheck,
  AlertCircleIcon,
  Target,
} from "lucide-react"

interface Team {
  id: string
  name: string
  date: string
  comuna: string
  mainRoute: string
  backupRoute: string
  meetingPoint: string
  members: string[]
  status: "active" | "completed" | "pending"
}

interface ExecutiveLocation {
  id: string
  name: string
  currentLat: number
  currentLng: number
  assignedZoneLat: number
  assignedZoneLng: number
  distance: number
  isInZone: boolean
  lastUpdate: string
}

const comunas = [
  "Las Condes",
  "Providencia",
  "Ñuñoa",
  "Santiago",
  "Maipú",
  "La Florida",
  "Puente Alto",
  "San Bernardo",
  "Quilicura",
  "Peñalolén",
  "La Reina",
  "Vitacura",
  "Lo Barnechea",
]

const routes = [
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

const executives = [
  "Ana Ejecutiva",
  "Luis Ejecutivo",
  "Carmen Vendedora",
  "Pedro Técnico",
  "María González",
  "Carlos Ruiz",
  "Sofia López",
  "Diego Martínez",
]

export default function SupervisorPage() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [executiveLocations, setExecutiveLocations] = useState<ExecutiveLocation[]>([])
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: "",
    date: "",
    comuna: "",
    mainRoute: "",
    backupRoute: "",
    meetingPoint: "",
    members: [] as string[],
  })

  useEffect(() => {
    const mockLocations: ExecutiveLocation[] = [
      {
        id: "1",
        name: "Ana Ejecutiva",
        currentLat: -33.4489,
        currentLng: -70.6693,
        assignedZoneLat: -33.45,
        assignedZoneLng: -70.67,
        distance: 0.8,
        isInZone: true,
        lastUpdate: "Hace 2 min",
      },
      {
        id: "2",
        name: "Luis Ejecutivo",
        currentLat: -33.42,
        currentLng: -70.6,
        assignedZoneLat: -33.4489,
        assignedZoneLng: -70.6693,
        distance: 5.2,
        isInZone: false,
        lastUpdate: "Hace 5 min",
      },
      {
        id: "3",
        name: "Carmen Vendedora",
        currentLat: -33.46,
        currentLng: -70.68,
        assignedZoneLat: -33.458,
        assignedZoneLng: -70.675,
        distance: 1.1,
        isInZone: true,
        lastUpdate: "Hace 1 min",
      },
    ]
    setExecutiveLocations(mockLocations)

    // Simular equipos existentes
    const mockTeams: Team[] = [
      {
        id: "1",
        name: "Equipo Norte A",
        date: "2024-01-16",
        comuna: "Las Condes",
        mainRoute: "Ruta Norte A",
        backupRoute: "Ruta Norte B",
        meetingPoint: "Metro Escuela Militar",
        members: ["Ana Ejecutiva", "Luis Ejecutivo"],
        status: "active",
      },
    ]
    setTeams(mockTeams)
  }, [])

  const handleCreateTeam = () => {
    if (!newTeam.name || !newTeam.date || !newTeam.comuna || !newTeam.mainRoute) return

    const team: Team = {
      id: Date.now().toString(),
      ...newTeam,
      status: "pending",
    }

    setTeams([...teams, team])
    setNewTeam({
      name: "",
      date: "",
      comuna: "",
      mainRoute: "",
      backupRoute: "",
      meetingPoint: "",
      members: [],
    })
    setIsCreateTeamOpen(false)
  }

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
            <Dialog open={isCreateTeamOpen} onOpenChange={setIsCreateTeamOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Equipo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Equipo</DialogTitle>
                  <DialogDescription>
                    Configura un nuevo equipo de trabajo con ruta principal, backup y punto de encuentro
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Nombre del Equipo</Label>
                    <Input
                      id="teamName"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                      placeholder="Ej: Equipo Norte A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teamDate">Fecha</Label>
                    <Input
                      id="teamDate"
                      type="date"
                      value={newTeam.date}
                      onChange={(e) => setNewTeam({ ...newTeam, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comuna">Comuna</Label>
                    <Select value={newTeam.comuna} onValueChange={(value) => setNewTeam({ ...newTeam, comuna: value })}>
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
                    <Label htmlFor="mainRoute">Ruta Principal</Label>
                    <Select
                      value={newTeam.mainRoute}
                      onValueChange={(value) => setNewTeam({ ...newTeam, mainRoute: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar ruta principal" />
                      </SelectTrigger>
                      <SelectContent>
                        {routes.map((route) => (
                          <SelectItem key={route} value={route}>
                            {route}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backupRoute">Ruta de Backup</Label>
                    <Select
                      value={newTeam.backupRoute}
                      onValueChange={(value) => setNewTeam({ ...newTeam, backupRoute: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar ruta backup" />
                      </SelectTrigger>
                      <SelectContent>
                        {routes.map((route) => (
                          <SelectItem key={route} value={route}>
                            {route}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meetingPoint">Punto de Encuentro</Label>
                    <Input
                      id="meetingPoint"
                      value={newTeam.meetingPoint}
                      onChange={(e) => setNewTeam({ ...newTeam, meetingPoint: e.target.value })}
                      placeholder="Ej: Metro Escuela Militar"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Miembros del Equipo</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {executives.map((executive) => (
                      <label key={executive} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newTeam.members.includes(executive)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewTeam({ ...newTeam, members: [...newTeam.members, executive] })
                            } else {
                              setNewTeam({ ...newTeam, members: newTeam.members.filter((m) => m !== executive) })
                            }
                          }}
                        />
                        <span className="text-sm">{executive}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateTeamOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateTeam}>Crear Equipo</Button>
                </div>
              </DialogContent>
            </Dialog>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Equipos Activos
              </CardTitle>
              <CardDescription>Equipos de trabajo configurados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teams.map((team) => (
                  <div key={team.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{team.name}</h4>
                      <Badge
                        variant={
                          team.status === "active" ? "default" : team.status === "completed" ? "secondary" : "outline"
                        }
                      >
                        {team.status === "active" ? "Activo" : team.status === "completed" ? "Completado" : "Pendiente"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {team.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {team.comuna}
                      </div>
                      <div className="flex items-center gap-1">
                        <Route className="h-3 w-3" />
                        {team.mainRoute}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {team.backupRoute}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <Navigation className="h-3 w-3" />
                      Encuentro: {team.meetingPoint}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <UserCheck className="h-3 w-3" />
                      {team.members.length} miembros: {team.members.join(", ")}
                    </div>
                  </div>
                ))}
                {teams.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No hay equipos creados</p>
                    <p className="text-sm">Crea tu primer equipo usando el botón superior</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Tracking de Ejecutivos
              </CardTitle>
              <CardDescription>Ubicación actual vs zona asignada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executiveLocations.map((exec) => (
                  <div key={exec.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{exec.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={exec.isInZone ? "default" : "destructive"}>
                          {exec.isInZone ? "En Zona" : "Fuera de Zona"}
                        </Badge>
                        {!exec.isInZone && <AlertCircleIcon className="h-4 w-4 text-red-500" />}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                      <div>
                        <span className="font-medium">Distancia:</span> {exec.distance.toFixed(1)} km
                      </div>
                      <div>
                        <span className="font-medium">Actualizado:</span> {exec.lastUpdate}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Actual: {exec.currentLat.toFixed(4)}, {exec.currentLng.toFixed(4)} | Asignada:{" "}
                      {exec.assignedZoneLat.toFixed(4)}, {exec.assignedZoneLng.toFixed(4)}
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
                <p className="text-sm text-gray-500">
                  Mostrando {executiveLocations.length} ejecutivos con tracking activo
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
