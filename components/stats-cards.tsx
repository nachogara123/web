import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, CheckCircle, MessageSquare, Users, Calendar, Building } from "lucide-react"

interface StatsCardsProps {
  data: {
    totalAddresses: number
    verifiedAddresses: number
    pendingAddresses: number
    totalComments: number
    activeTeams: number
    activePlans: number
  }
}

export function StatsCards({ data }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Direcciones",
      value: data.totalAddresses.toLocaleString(),
      icon: MapPin,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: `${data.verifiedAddresses > 0 ? Math.round((data.verifiedAddresses / data.totalAddresses) * 100) : 0}% verificadas`,
      changeType: "info" as const,
    },
    {
      title: "Direcciones Verificadas",
      value: data.verifiedAddresses.toLocaleString(),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: `${data.pendingAddresses} pendientes`,
      changeType: "neutral" as const,
    },
    {
      title: "Comentarios",
      value: data.totalComments.toLocaleString(),
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: `${data.totalAddresses > 0 ? (data.totalComments / data.totalAddresses).toFixed(1) : 0} por dirección`,
      changeType: "info" as const,
    },
    {
      title: "Equipos Activos",
      value: data.activeTeams.toString(),
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: `${data.activePlans} planes activos`,
      changeType: "info" as const,
    },
    {
      title: "Planes de Trabajo",
      value: data.activePlans.toString(),
      icon: Calendar,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      change: "En progreso",
      changeType: "neutral" as const,
    },
    {
      title: "Direcciones Pendientes",
      value: data.pendingAddresses.toString(),
      icon: Building,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      change: "Requieren atención",
      changeType: "warning" as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <span
                className={
                  stat.changeType === "warning"
                    ? "text-yellow-600"
                    : stat.changeType === "info"
                      ? "text-blue-600"
                      : "text-gray-600"
                }
              >
                {stat.change}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
