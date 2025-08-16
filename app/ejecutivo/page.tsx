"use client"

import { RoleGuard } from "@/components/role-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
} from "lucide-react"

export default function EjecutivoPage() {
  const { user } = useAuth()

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
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Mi Agenda
            </Button>
            <Button size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Ver Ruta
            </Button>
          </div>
        </div>

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
            </CardTitle>
            <CardDescription>Clientes y rutas asignadas a tu territorio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Mapa de tu territorio personal</p>
                <p className="text-sm text-gray-500">Mostrando 23 clientes activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}
