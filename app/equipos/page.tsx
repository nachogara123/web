"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Users, Plus, Edit, Trash2, MapPin, Calendar } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: "active" | "inactive"
}

interface Team {
  id: string
  name: string
  description: string
  supervisor: string
  territory: string
  members: TeamMember[]
  createdAt: string
  status: "active" | "inactive"
}

const mockTeams: Team[] = [
  {
    id: "1",
    name: "Equipo Norte",
    description: "Cobertura de rutas en zona norte de la ciudad",
    supervisor: "Carlos Supervisor",
    territory: "Zona Norte",
    members: [
      {
        id: "1",
        name: "Ana García",
        email: "ana@geovision.com",
        phone: "+1234567890",
        role: "Ejecutivo",
        status: "active",
      },
      {
        id: "2",
        name: "Luis Pérez",
        email: "luis@geovision.com",
        phone: "+1234567891",
        role: "Ejecutivo",
        status: "active",
      },
    ],
    createdAt: "2024-01-15",
    status: "active",
  },
  {
    id: "2",
    name: "Equipo Sur",
    description: "Cobertura de rutas en zona sur de la ciudad",
    supervisor: "María Supervisora",
    territory: "Zona Sur",
    members: [
      {
        id: "3",
        name: "Pedro Martín",
        email: "pedro@geovision.com",
        phone: "+1234567892",
        role: "Ejecutivo",
        status: "active",
      },
    ],
    createdAt: "2024-01-20",
    status: "active",
  },
]

export default function EquiposPage() {
  const [teams, setTeams] = useState<Team[]>(mockTeams)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [newTeam, setNewTeam] = useState({
    name: "",
    description: "",
    supervisor: "",
    territory: "",
  })

  const handleCreateTeam = () => {
    const team: Team = {
      id: Date.now().toString(),
      ...newTeam,
      members: [],
      createdAt: new Date().toISOString().split("T")[0],
      status: "active",
    }
    setTeams([...teams, team])
    setNewTeam({ name: "", description: "", supervisor: "", territory: "" })
    setIsCreateDialogOpen(false)
  }

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter((team) => team.id !== teamId))
  }

  const toggleTeamStatus = (teamId: string) => {
    setTeams(
      teams.map((team) =>
        team.id === teamId ? { ...team, status: team.status === "active" ? "inactive" : "active" } : team,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Equipos</h1>
          <p className="text-gray-600">Administra los equipos de trabajo y sus miembros</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Equipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Equipo</DialogTitle>
              <DialogDescription>Completa la información para crear un nuevo equipo de trabajo</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Equipo</Label>
                <Input
                  id="name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="Ej: Equipo Centro"
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="Describe las responsabilidades del equipo"
                />
              </div>
              <div>
                <Label htmlFor="supervisor">Supervisor</Label>
                <Select
                  value={newTeam.supervisor}
                  onValueChange={(value) => setNewTeam({ ...newTeam, supervisor: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Carlos Supervisor">Carlos Supervisor</SelectItem>
                    <SelectItem value="María Supervisora">María Supervisora</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="territory">Territorio</Label>
                <Input
                  id="territory"
                  value={newTeam.territory}
                  onChange={(e) => setNewTeam({ ...newTeam, territory: e.target.value })}
                  placeholder="Ej: Zona Centro"
                />
              </div>
              <Button onClick={handleCreateTeam} className="w-full">
                Crear Equipo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {team.name}
                </CardTitle>
                <Badge variant={team.status === "active" ? "default" : "secondary"}>
                  {team.status === "active" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <CardDescription>{team.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Supervisor:</span>
                  <span>{team.supervisor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Territorio:</span>
                  <span>{team.territory}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Creado:</span>
                  <span>{team.createdAt}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Miembros ({team.members.length})</h4>
                <div className="space-y-1">
                  {team.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between text-sm">
                      <span>{member.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                  {team.members.length === 0 && <p className="text-gray-500 text-xs">No hay miembros asignados</p>}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleTeamStatus(team.id)}>
                  {team.status === "active" ? "Desactivar" : "Activar"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTeam(team.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
