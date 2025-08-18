"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, MessageSquare, Search, Filter, ChevronUp, ChevronDown, Calendar, User, MapIcon } from "lucide-react"
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
  fecha_verificacion?: string
  verificada_por?: string
  created_at: string
}

interface ComentarioReal {
  id_coment: string
  comentario: string
  tipo_feedback?: string
  categoria?: string
  creado_por?: string
  usuario_nombre?: string
  fecha_comentario?: string
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
  feedback?: ComentarioReal[]
}

const tiposFeedback = [
  { value: "issue", label: "Problema", color: "bg-red-100 text-red-800" },
  { value: "suggestion", label: "Sugerencia", color: "bg-blue-100 text-blue-800" },
  { value: "info", label: "Información", color: "bg-green-100 text-green-800" },
  { value: "maintenance", label: "Mantenimiento", color: "bg-yellow-100 text-yellow-800" },
]

const categoriasFeedback = [
  "Accesibilidad",
  "Conectividad",
  "Estado físico",
  "Señalización",
  "Tráfico",
  "Seguridad",
  "Infraestructura",
  "Otros",
]

export default function MapaFeedbackPage() {
  const [direcciones, setDirecciones] = useState<DatabaseAddress[]>([])
  const [features, setFeatures] = useState<MapFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [comentarioTexto, setComentarioTexto] = useState("")
  const [tipoFeedback, setTipoFeedback] = useState("")
  const [categoriaFeedback, setCategoriaFeedback] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("all")
  const [filterCanal, setFilterCanal] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(true)
  const [comentariosExistentes, setComentariosExistentes] = useState<ComentarioReal[]>([])

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
            feedback: [],
          }))

        setFeatures(mapFeatures)
        toast({
          title: "Direcciones cargadas",
          description: `Se cargaron ${mapFeatures.length} direcciones para feedback con auto zoom.`,
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

  const fetchExistingComments = async (direccionId: number) => {
    try {
      console.log(`[v0] Obteniendo comentarios para dirección ${direccionId}...`)
      const response = await fetch(`/api/comentarios?direccion_id=${direccionId}`)
      const comentarios = await response.json()

      console.log(`[v0] Comentarios obtenidos: ${comentarios.length}`)
      setComentariosExistentes(comentarios)
      return comentarios
    } catch (error) {
      console.error("[v0] Error obteniendo comentarios:", error)
      return []
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

  const handleFeatureSelect = async (feature: MapFeature | null) => {
    setSelectedFeature(feature)
    if (feature && feature.properties.address) {
      const comentarios = await fetchExistingComments(feature.properties.address.id_direccion)
      setSelectedFeature({
        ...feature,
        feedback: comentarios,
      })
      setIsDialogOpen(true)
    }
  }

  const handleSubmitFeedback = async () => {
    if (!selectedFeature || !comentarioTexto.trim() || !tipoFeedback) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("[v0] Enviando feedback a la base de datos...")

      const response = await fetch("/api/comentarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          comentario: comentarioTexto,
          tipo_feedback: tipoFeedback,
          categoria: categoriaFeedback,
          direccion_id: selectedFeature.properties.address?.id_direccion,
          creado_por: "usuario-demo", // En producción sería el ID del usuario actual
        }),
      })

      if (response.ok) {
        const nuevoComentario = await response.json()

        // Actualizar la lista de comentarios
        await fetchExistingComments(selectedFeature.properties.address!.id_direccion)

        // Limpiar formulario
        setComentarioTexto("")
        setTipoFeedback("")
        setCategoriaFeedback("")
        setIsDialogOpen(false)

        toast({
          title: "Feedback enviado",
          description: "Tu comentario ha sido guardado en la base de datos.",
        })
      } else {
        throw new Error("Error al enviar feedback")
      }
    } catch (error) {
      console.error("[v0] Error enviando feedback:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el feedback. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const getFeedbackTypeColor = (type: string) => {
    const tipoEncontrado = tiposFeedback.find((t) => t.value === type)
    return tipoEncontrado?.color || "bg-gray-100 text-gray-800"
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
        <DialogContent className="sm:max-w-2xl mx-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] max-h-[90vh] overflow-y-auto">
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
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Ubicación</span>
                      </div>
                      <p className="text-sm text-gray-600">Lat: {selectedFeature.properties.address.lat?.toFixed(6)}</p>
                      <p className="text-sm text-gray-600">Lon: {selectedFeature.properties.address.lon?.toFixed(6)}</p>
                      <p className="text-sm text-gray-600">
                        Comuna: {selectedFeature.properties.address.comuna_nombre || "N/A"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Estado</span>
                      </div>
                      <Badge variant={selectedFeature.properties.address.verificada ? "default" : "secondary"}>
                        {selectedFeature.properties.address.verificada ? "Verificada" : "Sin verificar"}
                      </Badge>
                      {selectedFeature.properties.address.fecha_verificacion && (
                        <p className="text-xs text-gray-500">
                          Verificada:{" "}
                          {new Date(selectedFeature.properties.address.fecha_verificacion).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedFeature.properties.address.canal_nombre || "Sin canal"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedFeature.properties.address.estado_nombre || "Sin estado"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {selectedFeature.properties.address.tipo_vivienda_nombre || "Sin tipo"}
                    </Badge>
                  </div>

                  {selectedFeature.properties.address.id_cto && (
                    <p className="text-sm text-gray-600">
                      <strong>CTO:</strong> {selectedFeature.properties.address.id_cto}
                    </p>
                  )}

                  {selectedFeature.properties.address.hub_feeder_zona && (
                    <p className="text-sm text-gray-600">
                      <strong>Hub/Feeder/Zona:</strong> {selectedFeature.properties.address.hub_feeder_zona}
                    </p>
                  )}

                  {selectedFeature.properties.address.nota && (
                    <p className="text-sm text-gray-600">
                      <strong>Nota:</strong> {selectedFeature.properties.address.nota}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Agregar Feedback
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Feedback *</Label>
                    <Select value={tipoFeedback} onValueChange={setTipoFeedback}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposFeedback.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${tipo.color}`}>{tipo.label}</Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select value={categoriaFeedback} onValueChange={setCategoriaFeedback}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona categoría..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasFeedback.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Comentario *</Label>
                  <Textarea
                    placeholder="Describe tu feedback..."
                    value={comentarioTexto}
                    onChange={(e) => setComentarioTexto(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleSubmitFeedback}
                  disabled={!comentarioTexto.trim() || !tipoFeedback}
                  className="w-full"
                >
                  Enviar Feedback a Base de Datos
                </Button>
              </div>

              {comentariosExistentes && comentariosExistentes.length > 0 && (
                <div className="space-y-3 p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Comentarios Anteriores ({comentariosExistentes.length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {comentariosExistentes.map((comentario) => (
                      <div key={comentario.id_coment} className="p-3 bg-white border rounded-lg shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {comentario.tipo_feedback && (
                              <Badge className={`text-xs ${getFeedbackTypeColor(comentario.tipo_feedback)}`}>
                                {comentario.tipo_feedback}
                              </Badge>
                            )}
                            {comentario.categoria && (
                              <Badge variant="outline" className="text-xs">
                                {comentario.categoria}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(comentario.fecha_comentario || comentario.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{comentario.comentario}</p>
                        {comentario.usuario_nombre && (
                          <p className="text-xs text-gray-500">Por: {comentario.usuario_nombre}</p>
                        )}
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
