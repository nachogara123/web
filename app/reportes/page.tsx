"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { BarChart3, TrendingUp, Users, Route, Calendar, Download } from "lucide-react"

const chartConfig = {
  usuarios: {
    label: "Usuarios",
    color: "hsl(var(--chart-1))",
  },
  rutas: {
    label: "Rutas",
    color: "hsl(var(--chart-2))",
  },
  eficiencia: {
    label: "Eficiencia",
    color: "hsl(var(--chart-3))",
  },
}

const monthlyData = [
  { month: "Ene", usuarios: 45, rutas: 12, eficiencia: 78 },
  { month: "Feb", usuarios: 52, rutas: 15, eficiencia: 82 },
  { month: "Mar", usuarios: 48, rutas: 18, eficiencia: 85 },
  { month: "Abr", usuarios: 61, rutas: 22, eficiencia: 88 },
  { month: "May", usuarios: 55, rutas: 19, eficiencia: 91 },
  { month: "Jun", usuarios: 67, rutas: 25, eficiencia: 87 },
]

const departmentData = [
  { name: "Operaciones", value: 35, color: "#3b82f6" },
  { name: "Ventas", value: 25, color: "#10b981" },
  { name: "Marketing", value: 20, color: "#f59e0b" },
  { name: "Logística", value: 15, color: "#ef4444" },
  { name: "Otros", value: 5, color: "#6b7280" },
]

const routeEfficiencyData = [
  { route: "Centro-Norte", efficiency: 92, distance: 15.2 },
  { route: "Sur-Este", efficiency: 88, distance: 22.1 },
  { route: "Oeste-Centro", efficiency: 85, distance: 18.7 },
  { route: "Circular Norte", efficiency: 78, distance: 28.3 },
  { route: "Sur-Oeste", efficiency: 82, distance: 19.5 },
]

export default function ReportesPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly")
  const [selectedReport, setSelectedReport] = useState("overview")

  const reportTypes = [
    { value: "overview", label: "Resumen General", icon: BarChart3 },
    { value: "users", label: "Análisis de Usuarios", icon: Users },
    { value: "routes", label: "Eficiencia de Rutas", icon: Route },
    { value: "trends", label: "Tendencias", icon: TrendingUp },
  ]

  const periods = [
    { value: "weekly", label: "Semanal" },
    { value: "monthly", label: "Mensual" },
    { value: "quarterly", label: "Trimestral" },
    { value: "yearly", label: "Anual" },
  ]

  return (
    <div className="pt-16 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reportes y Analíticas</h1>
          <p className="text-gray-600">Análisis detallado del rendimiento del sistema</p>
        </div>

        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportTypes.map((report) => (
          <Card
            key={report.value}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedReport === report.value ? "ring-2 ring-blue-500 bg-blue-50" : ""
            }`}
            onClick={() => setSelectedReport(report.value)}
          >
            <CardContent className="p-4 text-center">
              <report.icon className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <div className="font-medium text-sm text-gray-900">{report.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Content */}
      {selectedReport === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Tendencias Mensuales</CardTitle>
              <CardDescription>Usuarios y rutas por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="usuarios" fill="var(--color-usuarios)" radius={4} />
                    <Bar dataKey="rutas" fill="var(--color-rutas)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Distribución por Departamento</CardTitle>
              <CardDescription>Usuarios activos por área</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {departmentData.map((dept) => (
                  <div key={dept.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                    <span className="text-sm text-gray-600">{dept.name}</span>
                    <span className="text-sm font-medium">{dept.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedReport === "routes" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Eficiencia por Ruta</CardTitle>
              <CardDescription>Rendimiento de las rutas principales</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={routeEfficiencyData} layout="horizontal">
                    <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="route" tickLine={false} axisLine={false} width={80} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="efficiency" fill="var(--color-eficiencia)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-900">Métricas de Rutas</CardTitle>
              <CardDescription>Estadísticas detalladas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routeEfficiencyData.map((route, index) => (
                  <div key={index} className="p-3 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{route.route}</span>
                      <Badge
                        className={
                          route.efficiency >= 90
                            ? "bg-green-100 text-green-800"
                            : route.efficiency >= 80
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {route.efficiency}%
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">Distancia: {route.distance} km</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedReport === "trends" && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-gray-900">Tendencia de Eficiencia</CardTitle>
            <CardDescription>Evolución del rendimiento a lo largo del tiempo</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="eficiencia"
                    stroke="var(--color-eficiencia)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-eficiencia)", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {selectedReport === "users" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Usuarios Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">156</div>
              <div className="text-sm text-gray-600">+12% vs mes anterior</div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Nuevos Registros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">23</div>
              <div className="text-sm text-gray-600">Este mes</div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Tasa de Retención</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">87%</div>
              <div className="text-sm text-gray-600">Usuarios activos</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
