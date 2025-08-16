"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Target, DollarSign, Users, TrendingUp, Calendar, MapPin, Phone, Mail } from "lucide-react"

export default function EjecutivoPage() {
  const salesStats = {
    monthlyGoal: 50000,
    currentSales: 38500,
    clientsContacted: 45,
    meetingsScheduled: 12,
  }

  const recentClients = [
    { name: "Empresa ABC", status: "Negociación", value: "$15,000", priority: "Alta" },
    { name: "Corporativo XYZ", status: "Propuesta", value: "$25,000", priority: "Media" },
    { name: "Startup Tech", status: "Seguimiento", value: "$8,000", priority: "Baja" },
  ]

  const upcomingMeetings = [
    { client: "Empresa ABC", time: "10:00 AM", type: "Presencial" },
    { client: "Corporativo XYZ", time: "2:00 PM", type: "Virtual" },
    { client: "Nuevo Prospecto", time: "4:30 PM", type: "Llamada" },
  ]

  const progressPercentage = (salesStats.currentSales / salesStats.monthlyGoal) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Panel Ejecutivo</h1>
        <Badge variant="secondary" className="text-sm">
          Ejecutivo - Ventas
        </Badge>
      </div>

      {/* Métricas de Ventas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta Mensual</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesStats.monthlyGoal.toLocaleString()}</div>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{progressPercentage.toFixed(1)}% completado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Actuales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesStats.currentSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Contactados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesStats.clientsContacted}</div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reuniones Programadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesStats.meetingsScheduled}</div>
            <p className="text-xs text-muted-foreground">Próximos 7 días</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline de Ventas */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline de Ventas</CardTitle>
            <CardDescription>Clientes en proceso de negociación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.status}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{client.value}</span>
                    <Badge
                      variant={
                        client.priority === "Alta"
                          ? "destructive"
                          : client.priority === "Media"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {client.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reuniones de Hoy */}
        <Card>
          <CardHeader>
            <CardTitle>Agenda de Hoy</CardTitle>
            <CardDescription>Reuniones programadas para hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMeetings.map((meeting, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{meeting.client}</p>
                    <p className="text-sm text-muted-foreground">{meeting.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{meeting.type}</Badge>
                    <Button size="sm" variant="outline">
                      Unirse
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Herramientas de Ventas */}
      <Card>
        <CardHeader>
          <CardTitle>Herramientas de Ventas</CardTitle>
          <CardDescription>Acceso rápido a herramientas frecuentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Phone className="h-6 w-6" />
              Llamar Cliente
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <Mail className="h-6 w-6" />
              Enviar Propuesta
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <MapPin className="h-6 w-6" />
              Planificar Ruta
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
              <TrendingUp className="h-6 w-6" />
              Ver Métricas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
