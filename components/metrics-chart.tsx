"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface MetricsChartProps {
  data: Array<{
    name: string
    usuarios: number
    rutas: number
  }>
}

const chartConfig = {
  usuarios: {
    label: "Usuarios",
    color: "hsl(var(--chart-1))",
  },
  rutas: {
    label: "Rutas",
    color: "hsl(var(--chart-2))",
  },
}

export function MetricsChart({ data }: MetricsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas Mensuales</CardTitle>
        <CardDescription>Usuarios registrados y rutas creadas por mes</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
              <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="usuarios" fill="var(--color-usuarios)" radius={[4, 4, 0, 0]} name="Usuarios" />
              <Bar dataKey="rutas" fill="var(--color-rutas)" radius={[4, 4, 0, 0]} name="Rutas" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
