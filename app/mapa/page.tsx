"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit3, Users, Navigation } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-gray-100 animate-pulse rounded-lg" />,
})

interface Team {
  id: string
  name: string
  date: string
  members: string[]
  supervisor: string
  status: "active" | "pending" | "completed"
  route?: {
    main: any[]
    backup: any[]
    meetingPoint: [number, number]
  }
}

interface MapFeature {
  id: string
  type: "marker" | "polygon" | "polyline" | "circle"
  name: string
  description: string
  coordinates: any
  properties: {
    color?: string
    category?: string
    status?: "active" | "inactive" | "pending"
    teamId?: string
    routeType?: "main" | "backup" | "meeting"
  }
  createdAt: string
}

const mockTeams: Team[] = [
  {
    id: "1",
    name: "Equipo Centro",
    date: "2024-01-20",
    members: ["Juan Pérez", "María García"],
    supervisor: "Carlos Supervisor",
    status: "active",
    route: {
      main: [
        [40.415, -3.708],
        [40.418, -3.708],
        [40.418, -3.7],
        [40.415, -3.7],
      ],
      backup: [
        [40.413, -3.71],
        [40.416, -3.71],
        [40.416, -3.702],
        [40.413, -3.702],
      ],
      meetingPoint: [40.4168, -3.7038],
    },
  },
  {
    id: "2",
    name: "Equipo Norte",
    date: "2024-01-20",
    members: ["Carlos López"],
    supervisor: "Ana Supervisora",
    status: "pending",
  },
  {
    id: "3",
    name: "Equipo Sur",
    date: "2024-01-20",
    members: ["Luis Martín", "Sara González"],
    supervisor: "Carlos Supervisor",
    status: "active",
    route: {
      main: [
        [40.41, -3.705],
        [40.413, -3.705],
        [40.413, -3.697],
        [40.41, -3.697],
      ],
      backup: [
        [40.408, -3.707],
        [40.411, -3.707],
        [40.411, -3.699],
        [40.408, -3.699],
      ],
      meetingPoint: [40.412, -3.701],
    },
  },
]

export default function MapaPage() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>(mockTeams)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isRouteMode, setIsRouteMode] = useState(false)
  const [currentRouteType, setCurrentRouteType] = useState<"main" | "backup" | "meeting">("main")
  const [features, setFeatures] = useState<MapFeature[]>([])

  // Filter teams based on user role
  const visibleTeams = user?.role === "supervisor" ? teams.filter((team) => team.supervisor === user.name) : teams

  const todayTeams = visibleTeams.filter((team) => team.date === "2024-01-20")

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team)
    // Generate map features for this team's routes
    if (team.route) {
      const teamFeatures: MapFeature[] = []

      if (team.route.main) {
        teamFeatures.push({
          id: `${team.id}-main`,
          type: "polygon",
          name: `${team.name} - Ruta Principal`,
          description: "Zona de trabajo principal del equipo",
          coordinates: team.route.main,
          properties: {
            color: "#3b82f6",
            category: "team-route",
            status: "active",
            teamId: team.id,
            routeType: "main",
          },
          createdAt: team.date,
        })
      }

      if (team.route.backup) {
        teamFeatures.push({
          id: `${team.id}-backup`,
          type: "polygon",
          name: `${team.name} - Ruta Backup`,
          description: "Zona de trabajo alternativa",
          coordinates: team.route.backup,
          properties: {
            color: "#f59e0b",
            category: "team-route",
            status: "active",
            teamId: team.id,
            routeType: "backup",
          },
          createdAt: team.date,
        })
      }

      if (team.route.meetingPoint) {
        teamFeatures.push({
          id: `${team.id}-meeting`,
          type: "marker",
          name: `${team.name} - Punto de Encuentro`,
          description: "Punto de encuentro del equipo",
          coordinates: team.route.meetingPoint,
          properties: {
            color: "#ef4444",
            category: "meeting-point",
            status: "active",
            teamId: team.id,
            routeType: "meeting",
          },
          createdAt: team.date,
        })
      }

      setFeatures(teamFeatures)
    } else {
      setFeatures([])
    }
  }

  const handleRouteCreate = (routeData: any) => {
    if (!selectedTeam) return

    const updatedTeam = { ...selectedTeam }
    if (!updatedTeam.route) {
      updatedTeam.route = { main: [], backup: [], meetingPoint: [0, 0] }
    }

    if (currentRouteType === "main" && routeData.type === "polygon") {
      updatedTeam.route.main = routeData.coordinates
    } else if (currentRouteType === "backup" && routeData.type === "polygon") {
      updatedTeam.route.backup = routeData.coordinates
    } else if (currentRouteType === "meeting" && routeData.type === "marker") {
      updatedTeam.route.meetingPoint = routeData.coordinates
    }

    setTeams(teams.map((t) => (t.id === selectedTeam.id ? updatedTeam : t)))
    setSelectedTeam(updatedTeam)

    toast({
      title: "Ruta actualizada",
      description: `${currentRouteType === "main" ? "Ruta principal" : currentRouteType === "backup" ? "Ruta backup" : "Punto de encuentro"} asignado correctamente.`,
    })
  }

  const getOtherTeamRoutes = () => {
    return todayTeams
      .filter((team) => team.id !== selectedTeam?.id && team.route)
      .map((team) => ({
        ...team,
        features: [],
      }))
  }

  return (
    <div className="pt-16 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Rutas de Equipos</h1>
          <p className="text-gray-600">Asigna y visualiza rutas de trabajo para tus equipos</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={isRouteMode ? "default" : "outline"}
            onClick={() => setIsRouteMode(!isRouteMode)}
            className={isRouteMode ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <Edit3 className="mr-2 h-4 w-4" />
            {isRouteMode ? "Salir del Modo Edición" : "Modo Edición de Rutas"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="h-[700px]">
                <MapComponent
                  features={features}
                  selectedFeature={null}
                  onFeatureSelect={() => {}}
                  onFeatureCreate={handleRouteCreate}
                  isDrawMode={isRouteMode}
                  isFeedbackMode={false}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Equipos de Hoy</CardTitle>
              <CardDescription>{todayTeams.length} equipos programados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayTeams.map((team) => (
                <div
                  key={team.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedTeam?.id === team.id ? "bg-blue-50 border-blue-300 shadow-md" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleTeamSelect(team)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-sm text-gray-900">{team.name}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">Supervisor: {team.supervisor}</p>
                      <p className="text-xs text-gray-600 mb-2">Miembros: {team.members.join(", ")}</p>
                      <div className="flex gap-1">
                        <Badge variant={team.status === "active" ? "default" : "secondary"} className="text-xs">
                          {team.status}
                        </Badge>
                        {team.route && (
                          <Badge variant="outline" className="text-xs text-green-600">
                            Con Rutas
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {selectedTeam && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Gestión de Rutas</CardTitle>
                <CardDescription>Equipo: {selectedTeam.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Ruta a Editar</Label>
                  <Select value={currentRouteType} onValueChange={(value: any) => setCurrentRouteType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Ruta Principal</SelectItem>
                      <SelectItem value="backup">Ruta Backup</SelectItem>
                      <SelectItem value="meeting">Punto de Encuentro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded"></div>
                      <span className="text-sm font-medium">Ruta Principal</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {selectedTeam.route?.main ? "✓ Configurada" : "Pendiente de configurar"}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-amber-500 rounded"></div>
                      <span className="text-sm font-medium">Ruta Backup</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {selectedTeam.route?.backup ? "✓ Configurada" : "Pendiente de configurar"}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-sm font-medium">Punto de Encuentro</span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {selectedTeam.route?.meetingPoint ? "✓ Configurado" : "Pendiente de configurar"}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-600">
                    {isRouteMode
                      ? `Dibuja ${currentRouteType === "meeting" ? "un punto" : "un polígono"} en el mapa para ${
                          currentRouteType === "main"
                            ? "la ruta principal"
                            : currentRouteType === "backup"
                              ? "la ruta backup"
                              : "el punto de encuentro"
                        }.`
                      : "Activa el modo edición para modificar las rutas."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedTeam && getOtherTeamRoutes().length > 0 && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Otros Equipos Hoy</CardTitle>
                <CardDescription>Evita solapamiento de zonas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {getOtherTeamRoutes().map((team) => (
                  <div key={team.id} className="p-2 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Navigation className="h-3 w-3 text-red-600" />
                      <span className="text-sm font-medium text-red-800">{team.name}</span>
                    </div>
                    <p className="text-xs text-red-600">Zona ocupada - Evitar solapamiento</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
