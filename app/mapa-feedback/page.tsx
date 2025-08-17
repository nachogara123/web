"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, MessageSquare } from "lucide-react"
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

export default function MapaFeedbackPage() {
  const [features, setFeatures] = useState<MapFeature[]>(mockFeatures)
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedComment, setSelectedComment] = useState("")

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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mapa Feedback</h1>
          <p className="text-gray-600">Visualiza puntos del mapa y proporciona feedback en tiempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">Modo Feedback Activo</span>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <MapComponent
            features={features}
            selectedFeature={selectedFeature}
            onFeatureSelect={handleFeatureSelect}
            onFeatureCreate={() => {}}
            isDrawMode={false}
            isFeedbackMode={true}
          />
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
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {getCategoryLabel(selectedFeature.properties.category || "")}
                  </Badge>
                  <Badge className={`text-xs ${getStatusColor(selectedFeature.properties.status || "")}`}>
                    {selectedFeature.properties.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">Creado: {selectedFeature.createdAt}</p>
              </div>

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
