"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, MessageSquare, Search, Filter, ChevronUp, ChevronDown } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Importación dinámica para evitar problemas de SSR con Leaflet
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-gray-100 animate-pulse rounded-lg" />,
})

interface DatabaseAddress {
  id_direccion: number
  direccion_final: string
  lon?: number
  lat?: number
  id_canal?: number
  canal_nombre?: string
  id_comuna?: number
  comuna_nombre?: string
  id_tipo_vivienda?: number
  tipo_vivienda_nombre?: string
  nota?: string
  hub_feeder_zona?: string
  id_cto?: string
  id_estado?: number
  estado_nombre?: string
  id_clasificacion?: number
  clasificacion_nombre?: string
  contador: number
  verificada: boolean
  created_at: string
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
    address?: DatabaseAddress
  }
  createdAt: string
  feedback?: {
    id: string
    comment: string
    type: "issue" | "suggestion" | "info"
    createdAt: string
    user: string
  }[]
}

const predefinedComments = [
  { text: "Mucha congestión de tráfico", type: "issue" as const },
  { text: "Área en buen estado", type: "info" as const },
  { text: "Necesita mantenimiento", type: "issue" as const },
  { text: "Excelente ubicación", type: "info" as const },
  { text: "Mejorar señalización", type: "suggestion" as const },
  { text: "Zona muy transitada", type: "info" as const },
  { text: "Problemas de accesibilidad", type: "issue" as const },
  { text: "Buena conectividad", type: "info" as const },
]

export default function MapaFeedbackPage() {
  const [direcciones, setDirecciones] = useState<DatabaseAddress[]>([])
  const [features, setFeatures] = useState<MapFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedComment, setSelectedComment] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("all")
  const [filterCanal, setFilterCanal] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(true)

  const fetchDirecciones = async () => {
    try {
      setLoading(true)
      console.log("[v0] Obteniendo direcciones para feedback...")

      const response = await fetch("/api/direcciones?limit=500")
      const result = await response.json()

      if (result.success) {
        console.log(`[v0] Direcciones obtenidas para feedback: ${result.data.length}`)
        setDirecciones(result.data)

        const mapFeatures: MapFeature[] = result.data
          .filter((dir: DatabaseAddress) => dir.lat && dir.lon)
          .map((dir: DatabaseAddress) => ({
            id: `address-${dir.id_direccion}`,
            type: "marker" as const,
            name: dir.direccion_final,
            description: `${dir.comuna_nombre || "Sin comuna"} - ${dir.estado_nombre || "Sin estado"}`,
            coordinates: [dir.lat!, dir.lon!],
            properties: {
              color: getColorByStatus(dir.estado_nombre, dir.verificada),
              category: "address",
              status: dir.verificada ? "active" : "pending",
              address: dir,
            },
            createdAt: dir.created_at,
            feedback: [], // Inicialmente sin feedback
          }))

        setFeatures(mapFeatures)
        toast({
          title: "Direcciones cargadas",
          description: `Se cargaron ${mapFeatures.length} direcciones para feedback.`,
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Error al cargar direcciones",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error obteniendo direcciones:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudieron cargar las direcciones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getColorByStatus = (estado?: string, verificada?: boolean) => {
    if (verificada) return "#10b981" // Verde para verificadas
    if (estado?.toLowerCase().includes("pendiente")) return "#f59e0b" // Amarillo para pendientes
    if (estado?.toLowerCase().includes("completado")) return "#3b82f6" // Azul para completadas
    if (estado?.toLowerCase().includes("error")) return "#ef4444" // Rojo para errores
    return "#6b7280" // Gris por defecto
  }

  useEffect(() => {
    fetchDirecciones()
  }, [])

  const filteredFeatures = features.filter((feature) => {
    const address = feature.properties.address
    if (!address) return false

    const matchesSearch =
      searchTerm === "" ||
      address.direccion_final.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.comuna_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.id_cto?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEstado = filterEstado === "all" || address.estado_nombre === filterEstado
    const matchesCanal = filterCanal === "all" || address.canal_nombre === filterCanal

    return matchesSearch && matchesEstado && matchesCanal
  })

  const handleFeatureSelect = (feature: MapFeature | null) => {
    setSelectedFeature(feature)
    if (feature) {
      setIsDialogOpen(true)
    }
  }

  const handleSubmitFeedback = () => {
    if (!selectedFeature || !selectedComment) return

    const commentData = predefinedComments.find((c) => c.text === selectedComment)
    if (!commentData) return

    const newFeedback = {
      id: Date.now().toString(),
      comment: commentData.text,
      type: commentData.type,
      createdAt: new Date().toISOString().split("T")[0],
      user: "Usuario Actual",
    }

    setFeatures(
      features.map((feature) =>
        feature.id === selectedFeature.id
          ? { ...feature, feedback: [...(feature.feedback || []), newFeedback] }
          : feature,
      ),
    )

    if (selectedFeature?.id === selectedFeature.id) {
      setSelectedFeature({
        ...selectedFeature,
        feedback: [...(selectedFeature.feedback || []), newFeedback],
      })
    }

    setSelectedComment("")
    setIsDialogOpen(false)
    toast({
      title: "Feedback enviado",
      description: "Tu comentario ha sido registrado exitosamente.",
    })
  }

  const getFeedbackTypeColor = (type: string) => {
    switch (type) {
      case "issue":
        return "bg-red-100 text-red-800"
      case "suggestion":
        return "bg-blue-100 text-blue-800"
      case "info":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const estadosUnicos = [...new Set(direcciones.map((d) => d.estado_nombre).filter(Boolean))]
  const canalesUnicos = [...new Set(direcciones.map((d) => d.canal_nombre).filter(Boolean))]

  return (
    <div className="pt-16 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mapa Feedback</h1>
          <p className="text-gray-600">Visualiza direcciones reales y proporciona feedback en tiempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </Button>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Modo Feedback Activo</span>
          </div>
        </div>
      </div>

      {showFilters && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Dinámicos
            </CardTitle>
            <CardDescription>Busca y filtra direcciones para feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Dirección, comuna, CTO..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={filterEstado} onValueChange={setFilterEstado}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {estadosUnicos.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Canal</Label>
                <Select value={filterCanal} onValueChange={setFilterCanal}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los canales</SelectItem>
                    {canalesUnicos.map((canal) => (
                      <SelectItem key={canal} value={canal}>
                        {canal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando {filteredFeatures.length} de {features.length} direcciones
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setFilterEstado("all")
                  setFilterCanal("all")
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="h-[600px] flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando direcciones...</p>
              </div>
            </div>
          ) : (
            <MapComponent
              features={filteredFeatures}
              selectedFeature={selectedFeature}
              onFeatureSelect={handleFeatureSelect}
              onFeatureCreate={() => {}}
              isDrawMode={false}
              isFeedbackMode={true}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md mx-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              {selectedFeature?.name}
            </DialogTitle>
            <DialogDescription>{selectedFeature?.description}</DialogDescription>
          </DialogHeader>

          {selectedFeature && (
            <div className="space-y-4">
              {selectedFeature.properties.address && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {selectedFeature.properties.address.canal_nombre || "Sin canal"}
                      </Badge>
                      <Badge variant={selectedFeature.properties.address.verificada ? "default" : "secondary"}>
                        {selectedFeature.properties.address.verificada ? "Verificada" : "Sin verificar"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Comuna: {selectedFeature.properties.address.comuna_nombre || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Estado: {selectedFeature.properties.address.estado_nombre || "N/A"}
                    </p>
                    {selectedFeature.properties.address.id_cto && (
                      <p className="text-sm text-gray-600">CTO: {selectedFeature.properties.address.id_cto}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900">Agregar Feedback</h3>
                <Select value={selectedComment} onValueChange={setSelectedComment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un comentario..." />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedComments.map((comment, index) => (
                      <SelectItem key={index} value={comment.text}>
                        <div className="flex items-center justify-between w-full">
                          <span>{comment.text}</span>
                          <Badge className={`ml-2 text-xs ${getFeedbackTypeColor(comment.type)}`}>{comment.type}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSubmitFeedback} disabled={!selectedComment} className="w-full">
                  Enviar Feedback
                </Button>
              </div>

              {selectedFeature.feedback && selectedFeature.feedback.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900">Comentarios Anteriores</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedFeature.feedback.slice(-3).map((fb) => (
                      <div key={fb.id} className="p-2 bg-gray-50 rounded text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <Badge className={`text-xs ${getFeedbackTypeColor(fb.type)}`}>{fb.type}</Badge>
                          <span className="text-gray-500">{fb.createdAt}</span>
                        </div>
                        <p className="text-gray-700">{fb.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
