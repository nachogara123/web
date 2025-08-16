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
import { MapPin, Edit3, Trash2, Shield, AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

// Importación dinámica para evitar problemas de SSR con Leaflet
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-gray-100 animate-pulse rounded-lg" />,
})

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
  }
  createdAt: string
  createdBy: string
}

const mockFeatures: MapFeature[] = [
  {
    id: "1",
    type: "marker",
    name: "Estación Atocha",
    description: "Estación principal de trenes de Madrid",
    coordinates: [40.4067, -3.6925],
    properties: {
      color: "#ef4444",
      category: "transport",
      status: "active",
    },
    createdAt: "2024-01-15",
    createdBy: "admin",
  },
]

export default function MapaDibujoPage() {
  const { user } = useAuth()
  const [features, setFeatures] = useState<MapFeature[]>(mockFeatures)
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null)
  const [isDrawMode, setIsDrawMode] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [newFeatureData, setNewFeatureData] = useState({
    name: "",
    description: "",
    category: "monitoring",
    color: "#3b82f6",
  })

  useEffect(() => {
    // Verificar si el usuario tiene permisos (admin o supervisor)
    if (user && (user.role === "admin" || user.role === "supervisor")) {
      setHasAccess(true)
    } else {
      setHasAccess(false)
    }
  }, [user])

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

  return (
    <div className="pt-16 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mapa Dibujo</h1>
          <p className="text-gray-600">Crea y gestiona elementos geoespaciales en el mapa</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-600">Modo Dibujo - {user?.role}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="shadow-lg">
            <CardContent className="p-0">
              <MapComponent
                features={features}
                selectedFeature={selectedFeature}
                onFeatureSelect={setSelectedFeature}
                onFeatureCreate={handleFeatureCreate}
                isDrawMode={isDrawMode}
                isFeedbackMode={false}
              />
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
                  Haz clic en el mapa para crear marcadores, o usa las herramientas de dibujo para crear formas.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Lista de elementos */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Elementos del Mapa</CardTitle>
              <CardDescription>{features.length} elementos totales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {features.map((feature) => (
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
                    </div>
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
