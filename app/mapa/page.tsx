"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Filter } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

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
}

export default function MapaPage() {
  const { user } = useAuth()
  const [direcciones, setDirecciones] = useState<DatabaseAddress[]>([])
  const [features, setFeatures] = useState<MapFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAddress, setSelectedAddress] = useState<DatabaseAddress | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("all")
  const [filterCanal, setFilterCanal] = useState<string>("all")
  const [stats, setStats] = useState({
    total: 0,
    verificadas: 0,
    pendientes: 0,
    showing: 0,
  })

  const fetchDirecciones = async (bounds?: {
    north: number
    south: number
    east: number
    west: number
  }) => {
    try {
      setLoading(true)
      console.log("[v0] Obteniendo direcciones desde la API...")

      let url = "/api/direcciones?limit=1000"
      if (bounds) {
        url += `&north=${bounds.north}&south=${bounds.south}&east=${bounds.east}&west=${bounds.west}`
      }

      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        console.log(`[v0] Direcciones obtenidas: ${result.data.length}`)
        setDirecciones(result.data)
        setStats({
          total: result.total,
          verificadas: result.data.filter((d: DatabaseAddress) => d.verificada).length,
          pendientes: result.data.filter((d: DatabaseAddress) => !d.verificada).length,
          showing: result.showing,
        })

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
          }))

        setFeatures(mapFeatures)
        toast({
          title: "Direcciones cargadas",
          description: `Se cargaron ${mapFeatures.length} direcciones en el mapa.`,
        })
      } else {
        console.error("[v0] Error en respuesta:", result.error)
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

  const filteredDirecciones = direcciones.filter((dir) => {
    const matchesSearch =
      searchTerm === "" ||
      dir.direccion_final.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dir.comuna_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dir.id_cto?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEstado = filterEstado === "all" || dir.estado_nombre === filterEstado
    const matchesCanal = filterCanal === "all" || dir.canal_nombre === filterCanal

    return matchesSearch && matchesEstado && matchesCanal
  })

  const handleAddressSelect = (address: DatabaseAddress) => {
    setSelectedAddress(address)
    console.log("[v0] Dirección seleccionada:", address)
  }

  const estadosUnicos = [...new Set(direcciones.map((d) => d.estado_nombre).filter(Boolean))]
  const canalesUnicos = [...new Set(direcciones.map((d) => d.canal_nombre).filter(Boolean))]

  return (
    <div className="pt-16 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mapa de Direcciones</h1>
          <p className="text-gray-600">Visualiza y gestiona direcciones en tiempo real</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchDirecciones()} disabled={loading}>
            <MapPin className="mr-2 h-4 w-4" />
            {loading ? "Cargando..." : "Actualizar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verificadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.verificadas}</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
              </div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mostrando</p>
                <p className="text-2xl font-bold text-blue-600">{stats.showing}</p>
              </div>
              <Filter className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <div className="h-[700px]">
                {loading ? (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Cargando direcciones...</p>
                    </div>
                  </div>
                ) : (
                  <MapComponent
                    features={features}
                    selectedFeature={selectedAddress ? `address-${selectedAddress.id_direccion}` : null}
                    onFeatureSelect={(feature) => {
                      if (feature?.properties?.address) {
                        handleAddressSelect(feature.properties.address)
                      }
                    }}
                    onFeatureCreate={() => {}}
                    isDrawMode={false}
                    isFeedbackMode={false}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Filtros</CardTitle>
              <CardDescription>Busca y filtra direcciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">
                  Mostrando {filteredDirecciones.length} de {direcciones.length} direcciones
                </p>
              </div>
            </CardContent>
          </Card>

          {selectedAddress && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Dirección Seleccionada</CardTitle>
                <CardDescription>ID: {selectedAddress.id_direccion}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Dirección</Label>
                  <p className="text-sm text-gray-700">{selectedAddress.direccion_final}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Comuna</Label>
                    <p className="text-sm text-gray-700">{selectedAddress.comuna_nombre || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estado</Label>
                    <Badge variant={selectedAddress.verificada ? "default" : "secondary"}>
                      {selectedAddress.estado_nombre || "Sin estado"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium">Canal</Label>
                    <p className="text-sm text-gray-700">{selectedAddress.canal_nombre || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tipo Vivienda</Label>
                    <p className="text-sm text-gray-700">{selectedAddress.tipo_vivienda_nombre || "N/A"}</p>
                  </div>
                </div>

                {selectedAddress.id_cto && (
                  <div>
                    <Label className="text-sm font-medium">CTO</Label>
                    <p className="text-sm text-gray-700">{selectedAddress.id_cto}</p>
                  </div>
                )}

                {selectedAddress.nota && (
                  <div>
                    <Label className="text-sm font-medium">Nota</Label>
                    <p className="text-sm text-gray-700">{selectedAddress.nota}</p>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: getColorByStatus(selectedAddress.estado_nombre, selectedAddress.verificada),
                      }}
                    ></div>
                    <span className="text-sm text-gray-600">
                      {selectedAddress.verificada ? "Verificada" : "Sin verificar"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Direcciones</CardTitle>
              <CardDescription>{filteredDirecciones.length} direcciones encontradas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {filteredDirecciones.slice(0, 50).map((direccion) => (
                <div
                  key={direccion.id_direccion}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedAddress?.id_direccion === direccion.id_direccion
                      ? "bg-blue-50 border-blue-300 shadow-md"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleAddressSelect(direccion)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getColorByStatus(direccion.estado_nombre, direccion.verificada) }}
                        ></div>
                        <span className="font-medium text-sm text-gray-900 truncate">{direccion.direccion_final}</span>
                      </div>
                      <p className="text-xs text-gray-600">{direccion.comuna_nombre}</p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {direccion.estado_nombre || "Sin estado"}
                        </Badge>
                        {direccion.verificada && (
                          <Badge variant="default" className="text-xs">
                            Verificada
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredDirecciones.length > 50 && (
                <div className="p-3 text-center text-sm text-gray-500 border-t">
                  Mostrando primeras 50 direcciones. Usa los filtros para refinar la búsqueda.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
