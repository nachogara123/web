"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Edit3, Trash2, Shield, AlertTriangle, Search, Filter, ChevronUp, ChevronDown } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

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
  createdBy: string
}

export default function MapaDibujoPage() {
  const { user } = useAuth()
  const [direcciones, setDirecciones] = useState<DatabaseAddress[]>([])
  const [features, setFeatures] = useState<MapFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null)
  const [isDrawMode, setIsDrawMode] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("all")
  const [filterCanal, setFilterCanal] = useState<string>("all")
  const [filterClasificacion, setFilterClasificacion] = useState<string>("all")
  const [filterComuna, setFilterComuna] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(true)
  const [newFeatureData, setNewFeatureData] = useState({
    name: "",
    description: "",
    category: "monitoring",
    color: "#3b82f6",
  })

  const fetchDirecciones = async () => {
    try {
      setLoading(true)
      console.log("[v0] Obteniendo direcciones para dibujo...")

      const response = await fetch("/api/direcciones?limit=500")
      const result = await response.json()

      if (result.success) {
        console.log(`[v0] Direcciones obtenidas para dibujo: ${result.data.length}`)
        setDirecciones(result.data)

        // Convertir direcciones a features del mapa
        const addressFeatures: MapFeature[] = result.data
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
            createdBy: "Sistema",
          }))

        setFeatures(addressFeatures)
        toast({
          title: "Direcciones cargadas",
          description: `Se cargaron ${addressFeatures.length} direcciones base.`,
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
    // Verificar si el usuario tiene permisos (admin o supervisor)
    if (user && (user.role === "admin" || user.role === "supervisor")) {
      setHasAccess(true)
      fetchDirecciones()
    } else {
      setHasAccess(false)
    }
  }, [user])

  const filteredFeatures = features.filter((feature) => {
    const address = feature.properties.address
    if (!address) return true // Mostrar elementos dibujados que no son direcciones

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

  const estadosUnicos = [...new Set(direcciones.map((d) => d.estado_nombre).filter(Boolean))]
  const canalesUnicos = [...new Set(direcciones.map((d) => d.canal_nombre).filter(Boolean))]
  const clasificacionesUnicas = [...new Set(direcciones.map((d) => d.clasificacion_nombre).filter(Boolean))]
  const comunasUnicas = [...new Set(direcciones.map((d) => d.comuna_nombre).filter(Boolean))]

  if (!hasAccess) {
    return (
      <div className="pt-16 p-6">
        <Alert className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-center">
            <div className="space-y-2">
              <p className="font-semibold">Acceso Restringido</p>
              <p>
                Solo los administradores y supervisores pueden acceder a la funcionalidad de dibujo y creación de
                elementos en el mapa.
              </p>
              <p className="text-sm text-gray-600">Tu rol actual: {user?.role || "usuario"}</p>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleFeatureCreate = (featureData: any) => {
    const newFeature: MapFeature = {
      id: Date.now().toString(),
      type: featureData.type,
      name: newFeatureData.name || `Nueva ${featureData.type}`,
      description: newFeatureData.description,
      coordinates: featureData.coordinates,
      properties: {
        color: newFeatureData.color,
        category: newFeatureData.category,
        status: "active",
      },
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: user?.name || "Usuario",
    }

    setFeatures([...features, newFeature])
    setNewFeatureData({ name: "", description: "", category: "monitoring", color: "#3b82f6" })
    toast({
      title: "Elemento creado",
      description: "El nuevo elemento ha sido añadido al mapa.",
    })
  }

  const handleFeatureDelete = (featureId: string) => {
    // Solo permitir eliminar elementos creados por el usuario, no direcciones de la BD
    const feature = features.find((f) => f.id === featureId)
    if (feature?.properties.address) {
      toast({
        title: "No se puede eliminar",
        description: "No puedes eliminar direcciones de la base de datos.",
        variant: "destructive",
      })
      return
    }

    setFeatures(features.filter((f) => f.id !== featureId))
    if (selectedFeature?.id === featureId) {
      setSelectedFeature(null)
    }
    toast({
      title: "Elemento eliminado",
      description: "El elemento ha sido removido del mapa.",
    })
  }

  const getCategoryLabel = (category: string) => {
    const categories = {
      monitoring: "Monitoreo",
      restricted: "Restringida",
      public: "Pública",
      emergency: "Emergencia",
      transport: "Transporte",
      landmark: "Punto de Interés",
      park: "Parque",
      address: "Dirección",
    }
    return categories[category as keyof typeof categories] || category
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="pt-16 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mapa Dibujo</h1>
          <p className="text-gray-600">Crea elementos geoespaciales sobre direcciones reales</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            {showFilters ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Modo Dibujo - {user?.role}</span>
          </div>
        </div>
      </div>

      {showFilters && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Direcciones Base
            </CardTitle>
            <CardDescription>Filtra las direcciones de la base de datos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

              <div className="space-y-2">
                <Label>Clasificación</Label>
                <Select value={filterClasificacion} onValueChange={setFilterClasificacion}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las clasificaciones</SelectItem>
                    {clasificacionesUnicas.map((clasificacion) => (
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
                    {comunasUnicas.map((comuna) => (
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
                Mostrando {filteredFeatures.length} elementos ({direcciones.length} direcciones base)
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
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="shadow-lg">
            <CardContent className="p-0">
              {loading ? (
                <div className="h-[600px] flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando direcciones base...</p>
                  </div>
                </div>
              ) : (
                <MapComponent
                  features={filteredFeatures}
                  selectedFeature={selectedFeature}
                  onFeatureSelect={setSelectedFeature}
                  onFeatureCreate={handleFeatureCreate}
                  isDrawMode={isDrawMode}
                  isFeedbackMode={false}
                />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Panel de creación */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Nuevo Elemento
              </CardTitle>
              <CardDescription>Configura las propiedades del nuevo elemento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={newFeatureData.name}
                  onChange={(e) => setNewFeatureData({ ...newFeatureData, name: e.target.value })}
                  placeholder="Nombre del elemento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={newFeatureData.description}
                  onChange={(e) => setNewFeatureData({ ...newFeatureData, description: e.target.value })}
                  placeholder="Descripción del elemento"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={newFeatureData.category}
                  onValueChange={(value) => setNewFeatureData({ ...newFeatureData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monitoring">Monitoreo</SelectItem>
                    <SelectItem value="restricted">Restringida</SelectItem>
                    <SelectItem value="public">Pública</SelectItem>
                    <SelectItem value="emergency">Emergencia</SelectItem>
                    <SelectItem value="transport">Transporte</SelectItem>
                    <SelectItem value="landmark">Punto de Interés</SelectItem>
                    <SelectItem value="park">Parque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={newFeatureData.color}
                    onChange={(e) => setNewFeatureData({ ...newFeatureData, color: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={newFeatureData.color}
                    onChange={(e) => setNewFeatureData({ ...newFeatureData, color: e.target.value })}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="pt-2">
                <p className="text-sm text-gray-600">
                  Usa las herramientas de dibujo para crear elementos sobre las direcciones base cargadas desde la base
                  de datos.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Lista de elementos */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Elementos del Mapa</CardTitle>
              <CardDescription>{filteredFeatures.length} elementos totales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {filteredFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedFeature?.id === feature.id ? "bg-blue-50 border-blue-300 shadow-md" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedFeature(feature)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-sm text-gray-900">{feature.name}</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{feature.description}</p>
                      <div className="flex gap-1 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryLabel(feature.properties.category || "")}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(feature.properties.status || "")}`}>
                          {feature.properties.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">Creado por: {feature.createdBy}</p>
                      {feature.properties.address && (
                        <div className="mt-1 pt-1 border-t">
                          <p className="text-xs text-blue-600">
                            📍 Dirección BD - {feature.properties.address.comuna_nombre}
                          </p>
                        </div>
                      )}
                    </div>
                    {!feature.properties.address && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleFeatureDelete(feature.id)
                        }}
                        className="hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
