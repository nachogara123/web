"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Download, FileText, Users, Map, Route, BarChart3, CalendarIcon, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ExportOption {
  id: string
  name: string
  description: string
  icon: any
  dataType: "users" | "map" | "routes" | "analytics"
  fields: string[]
  recordCount: number
}

const exportOptions: ExportOption[] = [
  {
    id: "users",
    name: "Usuarios del Sistema",
    description: "Exportar información completa de usuarios registrados",
    icon: Users,
    dataType: "users",
    fields: ["ID", "Nombre", "Email", "Rol", "Estado", "Último Acceso", "Fecha Creación"],
    recordCount: 156,
  },
  {
    id: "map-elements",
    name: "Elementos del Mapa",
    description: "Exportar marcadores, polígonos y elementos geoespaciales",
    icon: Map,
    dataType: "map",
    fields: ["ID", "Nombre", "Tipo", "Coordenadas", "Categoría", "Estado", "Descripción", "Fecha Creación"],
    recordCount: 89,
  },
  {
    id: "routes",
    name: "Rutas Optimizadas",
    description: "Exportar rutas calculadas y métricas de optimización",
    icon: Route,
    dataType: "routes",
    fields: [
      "ID",
      "Nombre",
      "Puntos",
      "Distancia Total",
      "Tiempo Estimado",
      "Combustible",
      "Eficiencia",
      "Fecha Creación",
    ],
    recordCount: 34,
  },
  {
    id: "analytics",
    name: "Datos Analíticos",
    description: "Exportar métricas de rendimiento y estadísticas del sistema",
    icon: BarChart3,
    dataType: "analytics",
    fields: ["Fecha", "Usuarios Activos", "Rutas Creadas", "Elementos Mapa", "Tiempo Promedio", "Eficiencia"],
    recordCount: 365,
  },
]

export default function ExportarPage() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState("csv")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [isExporting, setIsExporting] = useState(false)
  const [exportHistory, setExportHistory] = useState([
    {
      id: "1",
      name: "Usuarios_2024-01-15.csv",
      type: "users",
      size: "2.3 MB",
      records: 156,
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: "2",
      name: "Rutas_2024-01-14.csv",
      type: "routes",
      size: "1.1 MB",
      records: 34,
      date: "2024-01-14",
      status: "completed",
    },
  ])

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions((prev) => (prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]))
  }

  const generateCSV = (data: any[], headers: string[]) => {
    const csvContent = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
    ].join("\n")

    return csvContent
  }

  const downloadFile = (content: string, filename: string, type = "text/csv") => {
    const blob = new Blob([content], { type })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const generateMockData = (option: ExportOption, count: number) => {
    const data = []

    for (let i = 1; i <= count; i++) {
      switch (option.dataType) {
        case "users":
          data.push({
            ID: i,
            Nombre: `Usuario ${i}`,
            Email: `usuario${i}@geovision.com`,
            Rol: ["admin", "user", "viewer"][i % 3],
            Estado: ["active", "inactive"][i % 2],
            "Último Acceso": "2024-01-15",
            "Fecha Creación": "2023-06-01",
          })
          break
        case "map":
          data.push({
            ID: i,
            Nombre: `Elemento ${i}`,
            Tipo: ["marker", "polygon", "polyline"][i % 3],
            Coordenadas: `40.${4168 + i}, -3.${7038 + i}`,
            Categoría: ["monitoring", "restricted", "public"][i % 3],
            Estado: "active",
            Descripción: `Descripción del elemento ${i}`,
            "Fecha Creación": "2024-01-01",
          })
          break
        case "routes":
          data.push({
            ID: i,
            Nombre: `Ruta ${i}`,
            Puntos: Math.floor(Math.random() * 8) + 3,
            "Distancia Total": `${(Math.random() * 50 + 10).toFixed(1)} km`,
            "Tiempo Estimado": `${Math.floor(Math.random() * 120 + 30)} min`,
            Combustible: `${(Math.random() * 5 + 1).toFixed(1)} L`,
            Eficiencia: `${Math.floor(Math.random() * 30 + 70)}%`,
            "Fecha Creación": "2024-01-10",
          })
          break
        case "analytics":
          data.push({
            Fecha: `2024-01-${String(i).padStart(2, "0")}`,
            "Usuarios Activos": Math.floor(Math.random() * 50 + 20),
            "Rutas Creadas": Math.floor(Math.random() * 10 + 1),
            "Elementos Mapa": Math.floor(Math.random() * 5 + 1),
            "Tiempo Promedio": `${Math.floor(Math.random() * 60 + 30)} min`,
            Eficiencia: `${Math.floor(Math.random() * 20 + 75)}%`,
          })
          break
      }
    }

    return data
  }

  const handleExport = async () => {
    if (selectedOptions.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona al menos una opción para exportar.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)

    try {
      for (const optionId of selectedOptions) {
        const option = exportOptions.find((opt) => opt.id === optionId)
        if (!option) continue

        // Simular procesamiento
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockData = generateMockData(option, option.recordCount)
        const csvContent = generateCSV(mockData, option.fields)
        const filename = `${option.name.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.csv`

        downloadFile(csvContent, filename)

        // Agregar al historial
        const newExport = {
          id: Date.now().toString(),
          name: filename,
          type: option.dataType,
          size: `${(csvContent.length / 1024 / 1024).toFixed(1)} MB`,
          records: option.recordCount,
          date: format(new Date(), "yyyy-MM-dd"),
          status: "completed" as const,
        }

        setExportHistory((prev) => [newExport, ...prev])
      }

      toast({
        title: "Exportación completada",
        description: `Se han exportado ${selectedOptions.length} archivo(s) exitosamente.`,
      })

      setSelectedOptions([])
    } catch (error) {
      toast({
        title: "Error en la exportación",
        description: "Ocurrió un error durante el proceso de exportación.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "users":
        return Users
      case "map":
        return Map
      case "routes":
        return Route
      case "analytics":
        return BarChart3
      default:
        return FileText
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exportar Datos</h1>
          <p className="text-muted-foreground">Exporta información del sistema en diferentes formatos</p>
        </div>

        <Button onClick={handleExport} disabled={isExporting || selectedOptions.length === 0}>
          {isExporting ? (
            <>
              <Download className="mr-2 h-4 w-4 animate-pulse" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Exportar Seleccionados
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Opciones de Exportación</CardTitle>
              <CardDescription>Selecciona los tipos de datos que deseas exportar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {exportOptions.map((option) => {
                const isSelected = selectedOptions.includes(option.id)
                const Icon = option.icon

                return (
                  <div
                    key={option.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleOptionToggle(option.id)}
                  >
                    <div className="flex items-start gap-4">
                      <Checkbox checked={isSelected} onChange={() => handleOptionToggle(option.id)} />
                      <Icon className="h-5 w-5 text-gray-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{option.name}</h4>
                          <Badge variant="secondary">{option.recordCount} registros</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {option.fields.slice(0, 4).map((field) => (
                            <Badge key={field} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                          {option.fields.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{option.fields.length - 4} más
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración</CardTitle>
              <CardDescription>Personaliza las opciones de exportación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="format">Formato de Exportación</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                    <SelectItem value="xlsx" disabled>
                      Excel (Próximamente)
                    </SelectItem>
                    <SelectItem value="json" disabled>
                      JSON (Próximamente)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rango de Fechas (Opcional)</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1 justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, "dd/MM/yyyy", { locale: es }) : "Desde"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex-1 justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, "dd/MM/yyyy", { locale: es }) : "Hasta"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Resumen de Exportación</Label>
                <div className="text-sm text-gray-600">
                  <p>Elementos seleccionados: {selectedOptions.length}</p>
                  <p>
                    Total de registros:{" "}
                    {selectedOptions.reduce((total, optionId) => {
                      const option = exportOptions.find((opt) => opt.id === optionId)
                      return total + (option?.recordCount || 0)
                    }, 0)}
                  </p>
                  <p>Formato: {exportFormat.toUpperCase()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de Exportaciones</CardTitle>
              <CardDescription>{exportHistory.length} exportaciones recientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {exportHistory.map((export_) => {
                const TypeIcon = getTypeIcon(export_.type)
                return (
                  <div key={export_.id} className="p-3 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <TypeIcon className="h-4 w-4 text-gray-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{export_.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${getStatusColor(export_.status)}`}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completado
                          </Badge>
                          <span className="text-xs text-gray-500">{export_.size}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {export_.records} registros • {export_.date}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
