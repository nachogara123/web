"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, CheckCircle, Clock, TrendingUp, MapPin } from "lucide-react"

const SupervisorPage = () => {
  const teamStats = {
    totalMembers: 12,
    activeMembers: 10,
    completedTasks: 85,
    pendingApprovals: 5,
  }

  const pendingApprovals = [
    { id: 1, type: "Ruta Nueva", requester: "Ana García", priority: "Alta" },
    { id: 2, type: "Modificación", requester: "Carlos López", priority: "Media" },
    { id: 3, type: "Acceso Especial", requester: "María Rodríguez", priority: "Baja" },
  ]

  const teamPerformance = [
    { name: "Ana García", tasks: 15, completion: 92 },
    { name: "Carlos López", tasks: 12, completion: 88 },
    { name: "María Rodríguez", tasks: 18, completion: 95 },
    { name: "Luis Martín", tasks: 10, completion: 85 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel de Supervisor</h1>
        <Badge variant="default" className="text-sm">
          Supervisor - Operaciones
        </Badge>
      </div>

      {/* Estadísticas del Equipo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros del Equipo</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">{teamStats.activeMembers} activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.completedTasks}%</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobaciones Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamStats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rendimiento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">vs. mes anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aprobaciones Pendientes */}
        <Card>
          <CardHeader>
            <CardTitle>Aprobaciones Pendientes</CardTitle>
            <CardDescription>Solicitudes que requieren tu aprobación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((approval) => (
                <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{approval.type}</p>
                    <p className="text-sm text-muted-foreground">Por: {approval.requester}</p>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <Button size="sm">Revisar</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rendimiento del Equipo */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento del Equipo</CardTitle>
            <CardDescription>Progreso de tareas por miembro</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamPerformance.map((member, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{member.name}</span>
                    <span className="text-sm text-muted-foreground">{member.tasks} tareas</span>
                  </div>
                  <Progress value={member.completion} className="h-2" />
                  <div className="text-right text-sm text-muted-foreground">{member.completion}% completado</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Herramientas frecuentemente utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Users className="h-6 w-6" />
              Gestionar Equipo
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <CheckCircle className="h-6 w-6" />
              Aprobar Solicitudes
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <MapPin className="h-6 w-6" />
              Asignar Rutas
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <TrendingUp className="h-6 w-6" />
              Ver Reportes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SupervisorPage
