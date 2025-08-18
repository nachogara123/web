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
import { MapPin, MessageSquare, Search, Filter, ChevronUp, ChevronDown, X } from "lucide-react"
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

interface ComentarioPredefinido {
  comentario: string
  tipo_feedback: string
  categoria: string
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

const fetchDirecciones = async (setLoading: any, setDirecciones: any, setFeatures: any, toast: any) => {
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

const fetchExistingComments = async (direccionId: number, setComentariosExistentes: any) => {
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

const fetchComentariosPredefinidos = async (setComentariosPredefinidos: any) => {
  try {
    console.log("[v0] Obteniendo comentarios predefinidos...")
    const response = await fetch("/api/comentarios-predefinidos")
    const result = await response.json()

    if (result.success) {
      console.log(`[v0] Comentarios predefinidos obtenidos: ${result.data.length}`)
      console.log("[v0] Datos de comentarios predefinidos:", result.data)
      setComentariosPredefinidos(result.data)
    } else {
      console.error("[v0] Error obteniendo comentarios predefinidos:", result.message)
    }
  } catch (error) {
    console.error("[v0] Error obteniendo comentarios predefinidos:", error)
  }
}

const getColorByStatus = (estado?: string, verificada?: boolean) => {
  if (verificada) return "#10b981" // Verde para verificadas
  if (estado?.toLowerCase().includes("pendiente")) return "#f59e0b" // Amarillo para pendientes
  if (estado?.toLowerCase().includes("completado")) return "#3b82f6" // Azul para completadas
  if (estado?.toLowerCase().includes("error")) return "#ef4444" // Rojo para errores
  return "#6b7280" // Gris por defecto
}

const handleSubmitFeedbackSimplificado = async (
  selectedFeature: any,
  comentarioSeleccionado: any,
  setIsDialogOpen: any,
  setComentarioSeleccionado: any,
  toast: any,
  comentariosPredefinidos: any,
) => {
  if (!selectedFeature || !comentarioSeleccionado.trim()) {
    toast({
      title: "Error",
      description: "Por favor selecciona un comentario predefinido",
      variant: "destructive",
    })
    return
  }

  try {
    console.log("[v0] Enviando feedback simplificado a la base de datos...")

    const comentarioPredefinido = comentariosPredefinidos.find((c) => c.comentario === comentarioSeleccionado)

    const response = await fetch("/api/comentarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comentario: comentarioSeleccionado,
        tipo_feedback: comentarioPredefinido?.tipo_feedback || "informacion",
        categoria: comentarioPredefinido?.categoria || "otros",
        direccion_id: selectedFeature.properties.address?.id_direccion,
        creado_por: "usuario-demo",
      }),
    })

    if (response.ok) {
      await fetchExistingComments(selectedFeature.properties.address!.id_direccion, setIsDialogOpen)
      setComentarioSeleccionado("")
      setIsDialogOpen(false)

      toast({
        title: "Feedback enviado",
        description: "Tu comentario ha sido guardado exitosamente.",
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

const getFeedbackTypeColor = (type: string, tiposFeedback: any) => {
  const tipoEncontrado = tiposFeedback.find((t: any) => t.value === type)
  return tipoEncontrado?.color || "bg-gray-100 text-gray-800"
}

export default function MapaFeedbackPage() {
  const [direcciones, setDirecciones] = useState<DatabaseAddress[]>([])
  const [features, setFeatures] = useState<MapFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [comentarioSeleccionado, setComentarioSeleccionado] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("all")
  const [filterCanal, setFilterCanal] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(true)
  const [comentariosExistentes, setComentariosExistentes] = useState<ComentarioReal[]>([])
  const [filterClasificacion, setFilterClasificacion] = useState<string>("all")
  const [filterComuna, setFilterComuna] = useState<string>("all")
  const [comentariosPredefinidos, setComentariosPredefinidos] = useState<ComentarioPredefinido[]>([])
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const estadosUnicos = [...new Set(direcciones.map((d: DatabaseAddress) => d.estado_nombre).filter(Boolean))]
  const canalesUnicos = [...new Set(direcciones.map((d: DatabaseAddress) => d.canal_nombre).filter(Boolean))]
  const clasificacionesUnicas = [
    ...new Set(direcciones.map((d: DatabaseAddress) => d.clasificacion_nombre).filter(Boolean)),
  ]
  const comunasUnicas = [...new Set(direcciones.map((d: DatabaseAddress) => d.comuna_nombre).filter(Boolean))]

  const tiposFeedback = [
    { value: "problema", label: "Problema", color: "bg-red-100 text-red-800" },
    { value: "sugerencia", label: "Sugerencia", color: "bg-blue-100 text-blue-800" },
    { value: "informacion", label: "Información", color: "bg-green-100 text-green-800" },
    { value: "mantenimiento", label: "Mantenimiento", color: "bg-yellow-100 text-yellow-800" },
  ]

  const categoriasFeedback = [
    "accesibilidad",
    "conectividad",
    "estado_fisico",
    "señalizacion",
    "trafico",
    "seguridad",
    "infraestructura",
    "otros",
  ]

  const filteredFeatures = features.filter((feature: MapFeature) => {
    const address = feature.properties.address
    if (!address) return false

    const matchesSearch =
      searchTerm === "" ||
      address.direccion_final.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.comuna_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.id_cto?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEstado = filterEstado === "all" || address.estado_nombre === filterEstado
    const matchesCanal = filterCanal === "all" || address.canal_nombre === filterCanal
    const matchesClasificacion = filterClasificacion === "all" || address.clasificacion_nombre === filterClasificacion
    const matchesComuna = filterComuna === "all" || address.comuna_nombre === filterComuna

    return matchesSearch && matchesEstado && matchesCanal && matchesClasificacion && matchesComuna
  })

  const handleFeatureSelect = async (feature: MapFeature | null) => {
    if (!feature) {
      setSelectedFeature(null)
      setIsDialogOpen(false)
      return
    }

    setSelectedFeature(feature)
    if (feature.properties.address) {
      const comentarios = await fetchExistingComments(feature.properties.address.id_direccion, setComentariosExistentes)
      setSelectedFeature({
        ...feature,
        feedback: comentarios,
      })
      setIsDialogOpen(true)
    }
  }

  const generateSearchSuggestions = (term: string) => {
    if (term.length < 2) {
      setSearchSuggestions([])
      setShowSuggestions(false)
      return
    }

    const suggestions = new Set<string>()

    direcciones.forEach((dir) => {
      if (dir.direccion_final.toLowerCase().includes(term.toLowerCase())) {
        suggestions.add(dir.direccion_final)
      }
      if (dir.comuna_nombre?.toLowerCase().includes(term.toLowerCase())) {
        suggestions.add(dir.comuna_nombre)
      }
      if (dir.id_cto?.toLowerCase().includes(term.toLowerCase())) {
        suggestions.add(dir.id_cto)
      }
    })

    setSearchSuggestions(Array.from(suggestions).slice(0, 5))
    setShowSuggestions(true)
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    generateSearchSuggestions(value)
  }

  useEffect(() => {
    fetchDirecciones(setLoading, setDirecciones, setFeatures, toast)
    fetchComentariosPredefinidos(setComentariosPredefinidos)
  }, [])

  useEffect(() => {
    console.log("[v0] Estado actual de comentariosPredefinidos:", comentariosPredefinidos)
  }, [comentariosPredefinidos])

  return (
    <div className="pt-16 p-6 space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mapa Feedback</h1>
          <p className="text-gray-600">Visualiza direcciones reales y proporciona feedback en tiempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Modo Feedback Activo</span>
        </div>
      </div>

      <div className="fixed top-20 left-6 right-6 z-[1000] pointer-events-none">
        <Card className="shadow-xl border-2 border-blue-200 bg-white/95 backdrop-blur-sm pointer-events-auto">
          {!showFilters ? (
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(true)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Filter className="mr-1 h-4 w-4" />
                    Filtros
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>

                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      Búsqueda: {searchTerm}
                      <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                    </Badge>
                  )}

                  {filterEstado !== "all" && (
                    <Badge variant="outline" className="text-xs">
                      Estado: {filterEstado}
                      <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setFilterEstado("all")} />
                    </Badge>
                  )}

                  {filterCanal !== "all" && (
                    <Badge variant="outline" className="text-xs">
                      Canal: {filterCanal}
                      <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setFilterCanal("all")} />
                    </Badge>
                  )}

                  {filterClasificacion !== "all" && (
                    <Badge variant="outline" className="text-xs">
                      Clasificación: {filterClasificacion}
                      <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setFilterClasificacion("all")} />
                    </Badge>
                  )}

                  {filterComuna !== "all" && (
                    <Badge variant="outline" className="text-xs">
                      Comuna: {filterComuna}
                      <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setFilterComuna("all")} />
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    {filteredFeatures.length} de {features.length}
                  </span>
                  {(searchTerm ||
                    filterEstado !== "all" ||
                    filterCanal !== "all" ||
                    filterClasificacion !== "all" ||
                    filterComuna !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("")
                        setFilterEstado("all")
                        setFilterCanal("all")
                        setFilterClasificacion("all")
                        setFilterComuna("all")
                        setShowSuggestions(false)
                      }}
                      className="text-xs"
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filtros Dinámicos
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>Busca y filtra direcciones para feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-2 relative">
                    <Label>Buscar con Autocompletado</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Dirección, comuna, CTO..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="pl-10"
                      />
                      {showSuggestions && searchSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                          {searchSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                              onClick={() => {
                                setSearchTerm(suggestion)
                                setShowSuggestions(false)
                              }}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
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
                        {estadosUnicos.map((estado: string) => (
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
                        {canalesUnicos.map((canal: string) => (
                          <SelectItem key={canal} value={canal}>
                            {canal}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Clasificación</Label>
                    <Select value={filterClasificacion} onValueChange={setFilterClasificacion}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las clasificaciones</SelectItem>
                        {clasificacionesUnicas.map((clasificacion: string) => (
                          <SelectItem key={clasificacion} value={clasificacion}>
                            {clasificacion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Comuna</Label>
                    <Select value={filterComuna} onValueChange={setFilterComuna}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las comunas</SelectItem>
                        {comunasUnicas.map((comuna: string) => (
                          <SelectItem key={comuna} value={comuna}>
                            {comuna}
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
                      setFilterClasificacion("all")
                      setFilterComuna("all")
                      setShowSuggestions(false)
                    }}
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card className="shadow-xl border-2 border-gray-100">
          <CardContent className="p-0">
            {loading ? (
              <div className="h-[600px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Cargando direcciones con auto zoom...</p>
                  <p className="text-sm text-gray-500 mt-2">Haz clic en un punto para agregar feedback</p>
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
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg mx-auto top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10000] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
              {selectedFeature?.name}
            </DialogTitle>
            <DialogDescription className="text-sm">{selectedFeature?.description}</DialogDescription>
          </DialogHeader>

          {selectedFeature && (
            <div className="space-y-4">
              {selectedFeature.properties.address && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium">Estado:</span>
                      <Badge
                        variant={selectedFeature.properties.address.verificada ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {selectedFeature.properties.address.estado_nombre || "Pendiente"}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Comuna:</span>
                      <span className="ml-2">{selectedFeature.properties.address.comuna_nombre || "N/A"}</span>
                    </div>
                    {selectedFeature.properties.address.id_cto && (
                      <div className="col-span-2">
                        <span className="font-medium">CTO:</span>
                        <span className="ml-2">{selectedFeature.properties.address.id_cto}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3 p-4 border-2 border-blue-100 rounded-lg bg-blue-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Feedback Rápido
                </h3>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Selecciona un comentario:</Label>
                  <Select value={comentarioSeleccionado} onValueChange={setComentarioSeleccionado}>
                    <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 bg-white">
                      <SelectValue placeholder="Selecciona un comentario predefinido..." />
                    </SelectTrigger>
                    <SelectContent className="z-[10001] bg-white border shadow-lg">
                      {comentariosPredefinidos.length === 0 ? (
                        <SelectItem value="no-comments" disabled>
                          No hay comentarios predefinidos disponibles
                        </SelectItem>
                      ) : (
                        comentariosPredefinidos.map((comentario: ComentarioPredefinido, index: number) => (
                          <SelectItem key={`comentario-${index}`} value={comentario.comentario}>
                            <div className="flex flex-col py-1">
                              <span className="font-medium text-sm">{comentario.comentario}</span>
                              <span className="text-xs text-gray-500">
                                {comentario.tipo_feedback} • {comentario.categoria}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {comentariosPredefinidos.length > 0
                      ? `${comentariosPredefinidos.length} comentarios disponibles`
                      : "Cargando comentarios predefinidos..."}
                  </p>
                </div>

                <Button
                  onClick={() =>
                    handleSubmitFeedbackSimplificado(
                      selectedFeature,
                      comentarioSeleccionado,
                      setIsDialogOpen,
                      setComentarioSeleccionado,
                      toast,
                      comentariosPredefinidos,
                    )
                  }
                  disabled={!comentarioSeleccionado.trim() || comentariosPredefinidos.length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Enviar Feedback
                </Button>
              </div>

              {comentariosExistentes && comentariosExistentes.length > 0 && (
                <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Comentarios Anteriores ({comentariosExistentes.length})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {comentariosExistentes.slice(0, 3).map((comentario: ComentarioReal) => (
                      <div key={comentario.id_coment} className="p-2 bg-white border rounded text-xs">
                        <p className="text-gray-700">{comentario.comentario}</p>
                        <p className="text-gray-500 mt-1">
                          {new Date(comentario.fecha_comentario || comentario.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {comentariosExistentes.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{comentariosExistentes.length - 3} comentarios más
                      </p>
                    )}
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
