"use client"

import { useState, useEffect } from "react"
import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Plus,
  Calendar,
  UserCheck,
  AlertCircleIcon,
  Target,
  Settings,
  UserPlus,
  Map,
} from "lucide-react"

interface Team {
  id: string
  name: string
  date: string
  comuna: string
  members: string[]
  status: "draft" | "active" | "completed"
  supervisorId: string
}

interface Executive {
  id: string
  name: string
  email: string
  status: "active" | "bajo" | "inactive"
  canSelectOwnRoute: boolean
  canJoinTeams: boolean
  supervisorId: string
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

export default function SupervisorPage() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [executives, setExecutives] = useState<Executive[]>([])
  const [executiveLocations, setExecutiveLocations] = useState<ExecutiveLocation[]>([])
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false)
  const [isManageUsersOpen, setIsManageUsersOpen] = useState(false)
  const [newTeam, setNewTeam] = useState({
    name: "",
    date: "",
    comuna: "",
    members: [] as string[],
  })
  const [newExecutive, setNewExecutive] = useState({
    name: "",
    email: "",
    status: "active" as const,
    canSelectOwnRoute: true,
    canJoinTeams: true,
  })

  useEffect(() => {
    const mockExecutives: Executive[] = [
      {
        id: "1",
        name: "Ana Ejecutiva",
        email: "ana@empresa.com",
        status: "active",
        canSelectOwnRoute: true,
        canJoinTeams: true,
        supervisorId: user?.id || "supervisor1",
      },
      {
        id: "2",
        name: "Luis Ejecutivo",
        email: "luis@empresa.com",
        status: "bajo",
        canSelectOwnRoute: false,
        canJoinTeams: true,
        supervisorId: user?.id || "supervisor1",
      },
      {
        id: "3",
        name: "Carmen Vendedora",
        email: "carmen@empresa.com",
        status: "active",
        canSelectOwnRoute: true,
        canJoinTeams: true,
        supervisorId: user?.id || "supervisor1",
      },
    ]
    setExecutives(mockExecutives)

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
    ]
    setExecutiveLocations(mockLocations)

    const mockTeams: Team[] = [
      {
        id: "1",
        name: "Equipo Norte A",
        date: "2024-01-16",
        comuna: "Las Condes",
        members: ["Ana Ejecutiva", "Luis Ejecutivo"],
        status: "active",
        supervisorId: user?.id || "supervisor1",
      },
      {
        id: "2",
        name: "Equipo Centro B",
        date: "2024-01-17",
        comuna: "Providencia",
        members: ["Carmen Vendedora"],
        status: "draft",
        supervisorId: user?.id || "supervisor1",
      },
    ]
    setTeams(mockTeams)
  }, [user])

  const handleCreateTeam = () => {
    if (!newTeam.name || !newTeam.date || !newTeam.comuna || newTeam.members.length === 0) return

    const team: Team = {
      id: Date.now().toString(),
      name: newTeam.name,
      date: newTeam.date,
      comuna: newTeam.comuna,
      members: newTeam.members,
      status: "draft",
      supervisorId: user?.id || "supervisor1",
    }

    setTeams([...teams, team])
    setNewTeam({ name: "", date: "", comuna: "", members: [] })
    setIsCreateTeamOpen(false)
  }

  const handleAddExecutive = () => {
    if (!newExecutive.name || !newExecutive.email) return

    const executive: Executive = {
      id: Date.now().toString(),
      ...newExecutive,
      supervisorId: user?.id || "supervisor1",
    }

    setExecutives([...executives, executive])
    setNewExecutive({
      name: "",
      email: "",
      status: "active",
      canSelectOwnRoute: true,
      canJoinTeams: true,
    })
  }

  const updateExecutivePermissions = (execId: string, updates: Partial<Executive>) => {
    setExecutives(executives.map((exec) => (exec.id === execId ? { ...exec, ...updates } : exec)))
  }

  const availableExecutives = executives.filter(
    (exec) => exec.canJoinTeams && exec.supervisorId === (user?.id || "supervisor1"),
  )

  const teamStats = [
    { label: "Mis Ejecutivos", value: executives.length.toString(), icon: Users, color: "bg-blue-500" },
    {
      label: "Equipos Activos",
      value: teams.filter((t) => t.status === "active").length.toString(),
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      label: "Fuera de Zona",
      value: executiveLocations.filter((e) => !e.isInZone).length.toString(),
      icon: AlertTriangle,
      color: "bg-yellow-500",
    },
    {
      label: "Autónomos",
      value: executives.filter((e) => e.canSelectOwnRoute).length.toString(),
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ]

  return (
    <RoleGuard allowedRoles={["admin", "supervisor"]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Supervisor</h1>
            <p className="text-gray-600 mt-1">Bienvenido, {user?.name} - Gestiona tu equipo y territorio</p>
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
                    Configura los datos básicos del equipo. Las rutas se asignarán desde la página de mapas.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
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
                    <Label>Miembros del Equipo (Solo ejecutivos disponibles)</Label>
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                      {availableExecutives.map((executive) => (
                        <label key={executive.id} className="flex items-center space-x-2 p-2 border rounded">
                          <input
                            type="checkbox"
                            checked={newTeam.members.includes(executive.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewTeam({ ...newTeam, members: [...newTeam.members, executive.name] })
                              } else {
                                setNewTeam({
                                  ...newTeam,
                                  members: newTeam.members.filter((m) => m !== executive.name),
                                })
                              }
                            }}
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium">{executive.name}</span>
                            <div className="flex gap-1 mt-1">
                              <Badge
                                variant={executive.status === "active" ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {executive.status}
                              </Badge>
                              {!executive.canSelectOwnRoute && (
                                <Badge variant="outline" className="text-xs">
                                  Sin autonomía
                                </Badge>
                              )}
                            </div>
                          </div>
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
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isManageUsersOpen} onOpenChange={setIsManageUsersOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Gestionar Usuarios
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Gestión de Usuarios</DialogTitle>
                  <DialogDescription>Administra los permisos y estado de tus ejecutivos</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="list" className="w-full">
                  <TabsList>
                    <TabsTrigger value="list">Lista de Ejecutivos</TabsTrigger>
                    <TabsTrigger value="add">Agregar Ejecutivo</TabsTrigger>
                  </TabsList>

                  <TabsContent value="list" className="space-y-4">
                    <div className="space-y-2">
                      {executives.map((executive) => (
                        <div key={executive.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{executive.name}</h4>
                              <p className="text-sm text-gray-600">{executive.email}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant={executive.status === "active" ? "default" : "destructive"}>
                                {executive.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Estado</Label>
                              <Select
                                value={executive.status}
                                onValueChange={(value: "active" | "bajo" | "inactive") =>
                                  updateExecutivePermissions(executive.id, {
                                    status: value,
                                    canSelectOwnRoute: value === "active" ? executive.canSelectOwnRoute : false,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Activo</SelectItem>
                                  <SelectItem value="bajo">Bajo Supervisión</SelectItem>
                                  <SelectItem value="inactive">Inactivo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`autonomous-${executive.id}`}
                                  checked={executive.canSelectOwnRoute && executive.status === "active"}
                                  disabled={executive.status !== "active"}
                                  onChange={(e) =>
                                    updateExecutivePermissions(executive.id, { canSelectOwnRoute: e.target.checked })
                                  }
                                />
                                <Label htmlFor={`autonomous-${executive.id}`} className="text-sm">
                                  Puede seleccionar su propia ruta
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`teams-${executive.id}`}
                                  checked={executive.canJoinTeams}
                                  onChange={(e) =>
                                    updateExecutivePermissions(executive.id, { canJoinTeams: e.target.checked })
                                  }
                                />
                                <Label htmlFor={`teams-${executive.id}`} className="text-sm">
                                  Puede unirse a equipos
                                </Label>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="add" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="execName">Nombre</Label>
                        <Input
                          id="execName"
                          value={newExecutive.name}
                          onChange={(e) => setNewExecutive({ ...newExecutive, name: e.target.value })}
                          placeholder="Nombre del ejecutivo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="execEmail">Email</Label>
                        <Input
                          id="execEmail"
                          type="email"
                          value={newExecutive.email}
                          onChange={(e) => setNewExecutive({ ...newExecutive, email: e.target.value })}
                          placeholder="email@empresa.com"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="newExecAutonomous"
                          checked={newExecutive.canSelectOwnRoute}
                          onChange={(e) => setNewExecutive({ ...newExecutive, canSelectOwnRoute: e.target.checked })}
                        />
                        <Label htmlFor="newExecAutonomous">Puede seleccionar su propia ruta</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="newExecTeams"
                          checked={newExecutive.canJoinTeams}
                          onChange={(e) => setNewExecutive({ ...newExecutive, canJoinTeams: e.target.checked })}
                        />
                        <Label htmlFor="newExecTeams">Puede unirse a equipos</Label>
                      </div>
                    </div>
                    <Button onClick={handleAddExecutive} className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Agregar Ejecutivo
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={() => (window.location.href = "/mapa")}>
              <Map className="h-4 w-4 mr-2" />
              Gestionar Rutas
            </Button>
          </div>
        </div>

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
                Mis Equipos
              </CardTitle>
              <CardDescription>Equipos bajo tu supervisión</CardDescription>
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
                        {team.status === "active" ? "Activo" : team.status === "completed" ? "Completado" : "Borrador"}
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
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <UserCheck className="h-3 w-3" />
                      {team.members.length} miembros: {team.members.join(", ")}
                    </div>
                    {team.status === "draft" && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                        <Map className="h-3 w-3 inline mr-1" />
                        Asigna rutas desde la página de mapas
                      </div>
                    )}
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
      </div>
    </RoleGuard>
  )
}
