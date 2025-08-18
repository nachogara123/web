"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Navigation, Clock, Route, Fuel, Calculator, ArrowRight, RotateCcw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Importación dinámica para el mapa de rutas
const RouteMapComponent = dynamic(() => import("@/components/route-map-component"), {
  ssr: false,
  loading: () => <div className="h-[500px] bg-gray-100 animate-pulse rounded-lg" />,
})

interface RoutePoint {
  id: string
  name: string
  address: string
  coordinates: [number, number]
  type: "origin" | "destination" | "waypoint"
  estimatedTime?: number
  priority?: "high" | "medium" | "low"
}

interface OptimizedRoute {
  id: string
  name: string
  points: RoutePoint[]
  totalDistance: number
  totalTime: number
  estimatedFuel: number
  optimizationScore: number
  createdAt: string
}

const mockRoutePoints: RoutePoint[] = [
  {
    id: "1",
    name: "Oficina Central",
    address: "Calle Mayor 123, Madrid",
    coordinates: [40.4168, -3.7038],
    type: "origin",
  },
  {
    id: "2",
    name: "Cliente A",
    address: "Avenida de la Paz 45, Madrid",
    coordinates: [40.42, -3.71],
    type: "waypoint",
    estimatedTime: 30,
    priority: "high",
  },
  {
    id: "3",
    name: "Cliente B",
    address: "Plaza España 12, Madrid",
    coordinates: [40.424, -3.712],
    type: "waypoint",
    estimatedTime: 45,
    priority: "medium",
  },
]

const mockOptimizedRoutes: OptimizedRoute[] = [
  {
    id: "1",
    name: "Ruta Comercial Norte",
    points: mockRoutePoints,
    totalDistance: 25.4,
    totalTime: 120,
    estimatedFuel: 3.2,
    optimizationScore: 85,
    createdAt: "2024-01-15",
  },
]

export default function OptimizarRutasPage() {
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>(mockRoutePoints)
  const [optimizedRoutes, setOptimizedRoutes] = useState<OptimizedRoute[]>(mockOptimizedRoutes)
  const [currentRoute, setCurrentRoute] = useState<OptimizedRoute | null>(null)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [newPoint, setNewPoint] = useState({
    name: "",
    address: "",
    type: "waypoint" as RoutePoint["type"],
    priority: "medium" as RoutePoint["priority"],
    estimatedTime: 30,
  })

  const handleAddPoint = () => {
    if (!newPoint.name || !newPoint.address) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos.",
        variant: "destructive",
      })
      return
    }

    const point: RoutePoint = {
      id: Date.now().toString(),
      name: newPoint.name,
      address: newPoint.address,
      coordinates: [40.4168 + Math.random() * 0.02, -3.7038 + Math.random() * 0.02], // Coordenadas simuladas
      type: newPoint.type,
      priority: newPoint.priority,
      estimatedTime: newPoint.estimatedTime,
    }

    setRoutePoints([...routePoints, point])
    setNewPoint({
      name: "",
      address: "",
      type: "waypoint",
      priority: "medium",
      estimatedTime: 30,
    })

    toast({
      title: "Punto agregado",
      description: "El punto ha sido añadido a la ruta.",
    })
  }

  const handleRemovePoint = (pointId: string) => {
    setRoutePoints(routePoints.filter((p) => p.id !== pointId))
    toast({
      title: "Punto eliminado",
      description: "El punto ha sido removido de la ruta.",
    })
  }

  const handleOptimizeRoute = async () => {
    if (routePoints.length < 2) {
      toast({
        title: "Error",
        description: "Necesitas al menos 2 puntos para optimizar una ruta.",
        variant: "destructive",
      })
      return
    }

    setIsOptimizing(true)

    // Simulación de optimización
    setTimeout(() => {
      const optimizedRoute: OptimizedRoute = {
        id: Date.now().toString(),
        name: `Ruta Optimizada ${new Date().toLocaleTimeString()}`,
        points: [...routePoints].sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return (priorityOrder[b.priority || "medium"] || 2) - (priorityOrder[a.priority || "medium"] || 2)
        }),
        totalDistance: Math.round((routePoints.length * 8.5 + Math.random() * 10) * 10) / 10,
        totalTime: routePoints.reduce((acc, point) => acc + (point.estimatedTime || 30), 0) + 45,
        estimatedFuel: Math.round((routePoints.length * 1.2 + Math.random() * 2) * 10) / 10,
        optimizationScore: Math.round(75 + Math.random() * 20),
        createdAt: new Date().toISOString().split("T")[0],
      }

      setOptimizedRoutes([optimizedRoute, ...optimizedRoutes])
      setCurrentRoute(optimizedRoute)
      setIsOptimizing(false)

      toast({
        title: "Ruta optimizada",
        description: `Ruta calculada con ${optimizedRoute.optimizationScore}% de eficiencia.`,
      })
    }, 2000)
  }

  const handleClearRoute = () => {
    setRoutePoints([])
    setCurrentRoute(null)
    toast({
      title: "Ruta limpiada",
      description: "Todos los puntos han sido eliminados.",
    })
  }

  const getTypeLabel = (type: string) => {
    const types = {
      origin: "Origen",
      destination: "Destino",
      waypoint: "Parada",
    }
    return types[type as keyof typeof types] || type
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "origin":
        return "bg-green-100 text-green-800"
      case "destination":
        return "bg-red-100 text-red-800"
      case "waypoint":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Optimización de Rutas</h1>
          <p className="text-muted-foreground">Planifica y optimiza rutas eficientes para tus operaciones</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClearRoute}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpiar
          </Button>
          <Button onClick={handleOptimizeRoute} disabled={isOptimizing || routePoints.length < 2}>
            {isOptimizing ? (
              <>
                <Calculator className="mr-2 h-4 w-4 animate-spin" />
                Optimizando...
              </>
            ) : (
              <>
                <Route className="mr-2 h-4 w-4" />
                Optimizar Ruta
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              <RouteMapComponent
                routePoints={routePoints}
                optimizedRoute={currentRoute}
                onPointSelect={(point) => console.log("Selected point:", point)}
              />
            </CardContent>
          </Card>

          {currentRoute && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Resumen de Ruta Optimizada
                </CardTitle>
                <CardDescription>{currentRoute.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Route className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Distancia</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{currentRoute.totalDistance} km</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Tiempo</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.floor(currentRoute.totalTime / 60)}h {currentRoute.totalTime % 60}m
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Fuel className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Combustible</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{currentRoute.estimatedFuel}L</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Calculator className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Eficiencia</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{currentRoute.optimizationScore}%</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div>
                  <h4 className="font-semibold mb-3">Secuencia de Paradas</h4>
                  <div className="space-y-2">
                    {currentRoute.points.map((point, index) => (
                      <div key={point.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{point.name}</p>
                          <p className="text-xs text-gray-600">{point.address}</p>
                        </div>
                        <div className="flex gap-1">
                          <Badge className={`text-xs ${getTypeColor(point.type)}`}>{getTypeLabel(point.type)}</Badge>
                          {point.priority && (
                            <Badge className={`text-xs ${getPriorityColor(point.priority)}`}>{point.priority}</Badge>
                          )}
                        </div>
                        {index < currentRoute.points.length - 1 && <ArrowRight className="h-4 w-4 text-gray-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Tabs defaultValue="points" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="points">Puntos</TabsTrigger>
              <TabsTrigger value="add">Agregar</TabsTrigger>
            </TabsList>

            <TabsContent value="points" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Puntos de Ruta</CardTitle>
                  <CardDescription>{routePoints.length} puntos configurados</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {routePoints.map((point, index) => (
                    <div key={point.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full">
                            {index + 1}
                          </div>
                          <span className="font-medium text-sm">{point.name}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleRemovePoint(point.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{point.address}</p>
                      <div className="flex gap-1 flex-wrap">
                        <Badge className={`text-xs ${getTypeColor(point.type)}`}>{getTypeLabel(point.type)}</Badge>
                        {point.priority && (
                          <Badge className={`text-xs ${getPriorityColor(point.priority)}`}>{point.priority}</Badge>
                        )}
                        {point.estimatedTime && (
                          <Badge variant="outline" className="text-xs">
                            {point.estimatedTime}min
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Agregar Punto</CardTitle>
                  <CardDescription>Configura un nuevo punto en la ruta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="point-name">Nombre</Label>
                    <Input
                      id="point-name"
                      value={newPoint.name}
                      onChange={(e) => setNewPoint({ ...newPoint, name: e.target.value })}
                      placeholder="Nombre del punto"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="point-address">Dirección</Label>
                    <Input
                      id="point-address"
                      value={newPoint.address}
                      onChange={(e) => setNewPoint({ ...newPoint, address: e.target.value })}
                      placeholder="Dirección completa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="point-type">Tipo</Label>
                    <Select
                      value={newPoint.type}
                      onValueChange={(value: RoutePoint["type"]) => setNewPoint({ ...newPoint, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="origin">Origen</SelectItem>
                        <SelectItem value="waypoint">Parada</SelectItem>
                        <SelectItem value="destination">Destino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="point-priority">Prioridad</Label>
                    <Select
                      value={newPoint.priority}
                      onValueChange={(value: RoutePoint["priority"]) => setNewPoint({ ...newPoint, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="low">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimated-time">Tiempo Estimado (min)</Label>
                    <Input
                      id="estimated-time"
                      type="number"
                      value={newPoint.estimatedTime}
                      onChange={(e) =>
                        setNewPoint({ ...newPoint, estimatedTime: Number.parseInt(e.target.value) || 30 })
                      }
                      min="5"
                      max="300"
                    />
                  </div>

                  <Button onClick={handleAddPoint} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Punto
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rutas Guardadas</CardTitle>
              <CardDescription>{optimizedRoutes.length} rutas disponibles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {optimizedRoutes.map((route) => (
                <div
                  key={route.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    currentRoute?.id === route.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setCurrentRoute(route)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-sm">{route.name}</span>
                    <Badge className="text-xs bg-green-100 text-green-800">{route.optimizationScore}%</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div>{route.totalDistance}km</div>
                    <div>
                      {Math.floor(route.totalTime / 60)}h {route.totalTime % 60}m
                    </div>
                    <div>{route.estimatedFuel}L</div>
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
