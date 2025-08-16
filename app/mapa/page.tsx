"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Edit3, Trash2, Eye, MessageSquare, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"

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
  feedback?: {
    id: string
    comment: string
    type: "issue" | "suggestion" | "info"
    createdAt: string
    user: string
  }[]
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
    feedback: [
      {
        id: "f1",
        comment: "Mucha congestión en horas pico",
        type: "issue",
        createdAt: "2024-01-16",
        user: "Juan Pérez",
      },
    ],
  },
  {
    id: "2",
    type: "marker",
    name: "Puerta del Sol",
    description: "Centro neurálgico de Madrid",
    coordinates: [40.4168, -3.7038],
    properties: {
      color: "#3b82f6",
      category: "landmark",
      status: "active",
    },
    createdAt: "2024-01-14",
    feedback: [],
  },
  {
    id: "3",
    type: "marker",
    name: "Parque del Retiro",
    description: "Principal parque de la ciudad",
    coordinates: [40.4152, -3.6844],
    properties: {
      color: "#10b981",
      category: "park",
      status: "active",
    },
    createdAt: "2024-01-13",
    feedback: [
      {
        id: "f2",
        comment: "Excelente para actividades al aire libre",
        type: "info",
        createdAt: "2024-01-14",
        user: "María García",
      },
    ],
  },
  {
    id: "4",
    type: "polygon",
    name: "Zona Centro",
    description: "Área peatonal del centro histórico",
    coordinates: [
      [40.415, -3.708],
      [40.418, -3.708],
      [40.418, -3.7],
      [40.415, -3.7],
    ],
    properties: {
      color: "#f59e0b",
      category: "restricted",
      status: "active",
    },
    createdAt: "2024-01-12",
    feedback: [],
  },
]

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

export default function MapaPage() {
  const [features, setFeatures] = useState<MapFeature[]>(mockFeatures)
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null)
  const [isDrawMode, setIsDrawMode] = useState(false)
  const [isFeedbackMode, setIsFeedbackMode] = useState(false)
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackType, setFeedbackType] = useState<"issue" | "suggestion" | "info">("info")
  const [newFeatureData, setNewFeatureData] = useState({
    name: "",
    description: "",
    category: "monitoring",
    color: "#3b82f6",
  })

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
    }

    setFeatures([...features, newFeature])
    setNewFeatureData({ name: "", description: "", category: "monitoring", color: "#3b82f6" })
    toast({
      title: "Elemento creado",
      description: "El nuevo elemento ha sido añadido al mapa.",
    })
  }

  const handleFeatureUpdate = (updatedFeature: MapFeature) => {
    setFeatures(features.map((f) => (f.id === updatedFeature.id ? updatedFeature : f)))
    setSelectedFeature(updatedFeature)
    toast({
      title: "Elemento actualizado",
      description: "Los cambios han sido guardados.",
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

  const handleAddFeedback = (featureId: string, comment: string, type: "issue" | "suggestion" | "info") => {
    const newFeedback = {
      id: Date.now().toString(),
      comment,
      type,
      createdAt: new Date().toISOString().split("T")[0],
      user: "Usuario Actual",
    }

    setFeatures(
      features.map((feature) =>
        feature.id === featureId ? { ...feature, feedback: [...(feature.feedback || []), newFeedback] } : feature,
      ),
    )

    if (selectedFeature?.id === featureId) {
      setSelectedFeature({
        ...selectedFeature,
        feedback: [...(selectedFeature.feedback || []), newFeedback],
      })
    }

    setFeedbackText("")
    toast({
      title: "Feedback agregado",
      description: "Tu comentario ha sido registrado exitosamente.",
    })
  }

  const handlePredefinedComment = (comment: string, type: "issue" | "suggestion" | "info") => {
    if (selectedFeature) {
      handleAddFeedback(selectedFeature.id, comment, type)
    }
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

  return (
    <div className="pt-16 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mapa Interactivo</h1>
          <p className="text-gray-600">Visualiza y gestiona elementos geoespaciales con feedback en tiempo real</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={isFeedbackMode ? "default" : "outline"}
            onClick={() => {
              setIsFeedbackMode(!isFeedbackMode)
              setIsDrawMode(false)
            }}
            className={isFeedbackMode ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <Eye className="mr-2 h-4 w-4" />
            Modo Feedback
          </Button>
          <Button
            variant={isDrawMode ? "default" : "outline"}
            onClick={() => {
              setIsDrawMode(!isDrawMode)
              setIsFeedbackMode(false)
            }}
            className={isDrawMode ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Modo Dibujo
          </Button>
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
                isFeedbackMode={isFeedbackMode}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="features">Elementos</TabsTrigger>
              <TabsTrigger value="create">Crear</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>

            <TabsContent value="features" className="space-y-4">
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
                            {feature.feedback && feature.feedback.length > 0 && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                {feature.feedback.length}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{feature.description}</p>
                          <div className="flex gap-1">
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryLabel(feature.properties.category || "")}
                            </Badge>
                            <Badge className={`text-xs ${getStatusColor(feature.properties.status || "")}`}>
                              {feature.properties.status}
                            </Badge>
                          </div>
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
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Nuevo Elemento</CardTitle>
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
                      {isDrawMode
                        ? "Activa el modo dibujo y haz clic en el mapa para crear elementos."
                        : "Activa el modo dibujo para comenzar a crear elementos en el mapa."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4">
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Sistema de Feedback</CardTitle>
                  <CardDescription>
                    {selectedFeature ? `Feedback para: ${selectedFeature.name}` : "Selecciona un elemento del mapa"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedFeature ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-900">Comentarios Rápidos</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {predefinedComments.map((comment, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handlePredefinedComment(comment.text, comment.type)}
                              className="justify-start text-left h-auto p-2 hover:bg-gray-50"
                            >
                              <Plus className="h-3 w-3 mr-2 flex-shrink-0" />
                              <span className="text-xs">{comment.text}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="feedback" className="text-sm font-medium text-gray-900">
                          Comentario Personalizado
                        </Label>
                        <Textarea
                          id="feedback"
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Escribe tu comentario..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Select value={feedbackType} onValueChange={(value: any) => setFeedbackType(value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="info">Info</SelectItem>
                              <SelectItem value="issue">Problema</SelectItem>
                              <SelectItem value="suggestion">Sugerencia</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={() =>
                              feedbackText.trim() && handleAddFeedback(selectedFeature.id, feedbackText, feedbackType)
                            }
                            disabled={!feedbackText.trim()}
                            className="flex-1"
                          >
                            Agregar Feedback
                          </Button>
                        </div>
                      </div>

                      {selectedFeature.feedback && selectedFeature.feedback.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-900">Feedback Existente</Label>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {selectedFeature.feedback.map((fb) => (
                              <div key={fb.id} className="p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-start justify-between mb-1">
                                  <Badge className={`text-xs ${getFeedbackTypeColor(fb.type)}`}>{fb.type}</Badge>
                                  <span className="text-xs text-gray-500">{fb.createdAt}</span>
                                </div>
                                <p className="text-xs text-gray-700">{fb.comment}</p>
                                <p className="text-xs text-gray-500 mt-1">- {fb.user}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      Selecciona un elemento del mapa para agregar feedback
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {selectedFeature && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Elemento Seleccionado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-900">Nombre</Label>
                  <p className="text-sm text-gray-600">{selectedFeature.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900">Descripción</Label>
                  <p className="text-sm text-gray-600">{selectedFeature.description}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900">Tipo</Label>
                  <p className="text-sm text-gray-600 capitalize">{selectedFeature.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900">Categoría</Label>
                  <Badge variant="secondary" className="text-xs">
                    {getCategoryLabel(selectedFeature.properties.category || "")}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-900">Estado</Label>
                  <Badge className={`text-xs ${getStatusColor(selectedFeature.properties.status || "")}`}>
                    {selectedFeature.properties.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
