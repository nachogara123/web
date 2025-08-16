import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Route, CheckCircle, TrendingUp } from "lucide-react"

interface StatsCardsProps {
  data: {
    totalUsers: number
    activeRoutes: number
    completedTasks: number
    efficiency: number
  }
}

export function StatsCards({ data }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Usuarios",
      value: data.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Rutas Activas",
      value: data.activeRoutes.toString(),
      icon: Route,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Tareas Completadas",
      value: data.completedTasks.toString(),
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+23%",
      changeType: "positive" as const,
    },
    {
      title: "Eficiencia",
      value: `${data.efficiency}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: "+5%",
      changeType: "positive" as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className={stat.changeType === "positive" ? "text-green-600" : "text-red-600"}>{stat.change}</span>
              <span>desde el mes pasado</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
