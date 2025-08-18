"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Loader2, Target, Route, Users, Search } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Interfaces para los elementos geográficos
interface ZonaPrioritaria {
  id: string
  nombre: string
  nivel_prioridad: number
  usuario_propuso: string
  usuario_nombre?: string
  created_at: string
  descripcion?: string
}

interface RutaSugerida {
  id: string
  nombre: string
  prioridad: number
  usuario_sugirio: string
  usuario_nombre?: string
  created_at: string
  descripcion?: string
}

interface ZonaAsignada {
  id: string
  nombre: string
  usuario_asignado: string
  usuario_nombre?: string
  fecha_asignacion: string
  descripcion?: string
}

export default function ZonasGeograficasPage() {
  const [zonasPrioritarias, setZonasPrioritarias] = useState<ZonaPrioritaria[]>([])
  const [rutasSugeridas, setRutasSugeridas] = useState<RutaSugerida[]>([])
  const [zonasAsignadas, setZonasAsignadas] = useState<ZonaAsignada[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("zonas-prioritarias")

  // Estados para diálogos
  const [isCreateZonaDialogOpen, setIsCreateZonaDialogOpen] = useState(false)
  const [isCreateRutaDialogOpen, setIsCreateRutaDialogOpen] = useState(false)
  const [isCreateAsignacionDialogOpen, setIsCreateAsignacionDialogOpen] = useState(false)

  // Estados para formularios
  const [zonaFormData, setZonaFormData] = useState({
    nombre: "",
    nivel_prioridad: 1,
    descripcion: "",
  })
  const [rutaFormData, setRutaFormData] = useState({
    nombre: "",
    prioridad: 1,
    descripcion: "",
  })
  const [asignacionFormData, setAsignacionFormData] = useState({
    nombre: "",
    usuario_asignado: "",
    descripcion: "",
  })

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        // Datos simulados - en producción se conectarían a los servicios reales
        const mockZonasPrioritarias: ZonaPrioritaria[] = [
          {
            id: "1",
            nombre: "Zona Centro Crítica",
            nivel_prioridad: 5,
            usuario_propuso: "user1",
            usuario_nombre: "Juan Pérez",
            created_at: new Date().toISOString(),
            descripcion: "Zona con alta densidad poblacional que requiere atención prioritaria",
          },
          {
            id: "2",
            nombre: "Sector Industrial Norte",
            nivel_prioridad: 3,
            usuario_propuso: "user2",
            usuario_nombre: "María García",
            created_at: new Date().toISOString(),
            descripcion: "Área industrial con necesidades específicas de cobertura",
          },
        ]

        const mockRutasSugeridas: RutaSugerida[] = [
          {
            id: "1",
            nombre: "Ruta Óptima Centro-Norte",
            prioridad: 4,
            usuario_sugirio: "user1",
            usuario_nombre: "Juan Pérez",
            created_at: new Date().toISOString(),
            descripcion: "Ruta optimizada para conectar zona centro con sector norte",
          },
          {
            id: "2",
            nombre: "Circuito Residencial Sur",
            prioridad: 2,
            usuario_sugirio: "user3",
            usuario_nombre: "Carlos López",
            created_at: new Date().toISOString(),
            descripcion: "Circuito para atender eficientemente el sector residencial sur",
          },
        ]

        const mockZonasAsignadas: ZonaAsignada[] = [
          {
            id: "1",
            nombre: "Sector A - Providencia",
            usuario_asignado: "user1",
            usuario_nombre: "Juan Pérez",
            fecha_asignacion: new Date().toISOString(),
            descripcion: "Zona asignada para cobertura completa del sector A",
          },
          {
            id: "2",
            nombre: "Sector B - Las Condes",
            usuario_asignado: "user2",
            usuario_nombre: "María García",
            fecha_asignacion: new Date().toISOString(),
            descripcion: "Responsabilidad sobre el sector B de Las Condes",
          },
        ]

        setZonasPrioritarias(mockZonasPrioritarias)
        setRutasSugeridas(mockRutasSugeridas)
        setZonasAsignadas(mockZonasAsignadas)
      } catch (error) {
        console.error("Error cargando datos geográficos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos geográficos.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCreateZona = async () => {
    if (!zonaFormData.nombre) {
      toast({
        title: "Error",
        description: "El nombre de la zona es obligatorio.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const nuevaZona: ZonaPrioritaria = {
        id: Date.now().toString(),
        nombre: zonaFormData.nombre,
        nivel_prioridad: zonaFormData.nivel_prioridad,
        usuario_propuso: "current-user",
        usuario_nombre: "Usuario Actual",
        created_at: new Date().toISOString(),
        descripcion: zonaFormData.descripcion,
      }
      setZonasPrioritarias([...zonasPrioritarias, nuevaZona])
      setIsCreateZonaDialogOpen(false)
      setZonaFormData({ nombre: "", nivel_prioridad: 1, descripcion: "" })
      toast({
        title: "Zona creada",
        description: "La zona prioritaria ha sido creada exitosamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la zona prioritaria.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateRuta = async () => {
    if (!rutaFormData.nombre) {
      toast({
        title: "Error",
        description: "El nombre de la ruta es obligatorio.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const nuevaRuta: RutaSugerida = {
        id: Date.now().toString(),
        nombre: rutaFormData.nombre,
        prioridad: rutaFormData.prioridad,
        usuario_sugirio: "current-user",
        usuario_nombre: "Usuario Actual",
        created_at: new Date().toISOString(),
        descripcion: rutaFormData.descripcion,
      }
      setRutasSugeridas([...rutasSugeridas, nuevaRuta])
      setIsCreateRutaDialogOpen(false)
      setRutaFormData({ nombre: "", prioridad: 1, descripcion: "" })
      toast({
        title: "Ruta creada",
        description: "La ruta sugerida ha sido creada exitosamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la ruta sugerida.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateAsignacion = async () => {
    if (!asignacionFormData.nombre || !asignacionFormData.usuario_asignado) {
      toast({
        title: "Error",
        description: "El nombre de la zona y el usuario son obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const nuevaAsignacion: ZonaAsignada = {
        id: Date.now().toString(),
        nombre: asignacionFormData.nombre,
        usuario_asignado: asignacionFormData.usuario_asignado,
        usuario_nombre: "Usuario Seleccionado", // En producción se obtendría del servicio
        fecha_asignacion: new Date().toISOString(),
        descripcion: asignacionFormData.descripcion,
      }
      setZonasAsignadas([...zonasAsignadas, nuevaAsignacion])
      setIsCreateAsignacionDialogOpen(false)
      setAsignacionFormData({ nombre: "", usuario_asignado: "", descripcion: "" })
      toast({
        title: "Zona asignada",
        description: "La zona ha sido asignada exitosamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la asignación de zona.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getPrioridadBadgeColor = (prioridad: number) => {
    if (prioridad >= 4) return "bg-red-100 text-red-800"
    if (prioridad >= 3) return "bg-orange-100 text-orange-800"
    if (prioridad >= 2) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  const getPrioridadLabel = (prioridad: number) => {
    if (prioridad >= 4) return "Muy Alta"
    if (prioridad >= 3) return "Alta"
    if (prioridad >= 2) return "Media"
    return "Baja"
  }

  if (loading) {
    return (
      <div className="pt-16 p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando datos geográficos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Zonas Geográficas</h1>
          <p className="text-gray-600">Administra zonas prioritarias, rutas sugeridas y asignaciones</p>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{zonasPrioritarias.length}</p>
                <p className="text-xs text-gray-500">Zonas Prioritarias</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Route className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{rutasSugeridas.length}</p>
                <p className="text-xs text-gray-500">Rutas Sugeridas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{zonasAsignadas.length}</p>
                <p className="text-xs text-gray-500">Zonas Asignadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtro de búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar zonas, rutas o asignaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs para diferentes tipos de elementos geográficos */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="zonas-prioritarias">Zonas Prioritarias</TabsTrigger>
          <TabsTrigger value="rutas-sugeridas">Rutas Sugeridas</TabsTrigger>
          <TabsTrigger value="zonas-asignadas">Zonas Asignadas</TabsTrigger>
        </TabsList>

        <TabsContent value="zonas-prioritarias" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Zonas Prioritarias</h2>
            <Dialog open={isCreateZonaDialogOpen} onOpenChange={setIsCreateZonaDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Zona Prioritaria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Zona Prioritaria</DialogTitle>
                  <DialogDescription>Define una nueva zona que requiere atención prioritaria</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="zona-nombre">Nombre de la Zona *</Label>
                    <Input
                      id="zona-nombre"
                      value={zonaFormData.nombre}
                      onChange={(e) => setZonaFormData({ ...zonaFormData, nombre: e.target.value })}
                      placeholder="Ej: Zona Centro Crítica"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zona-prioridad">Nivel de Prioridad</Label>
                    <Select
                      value={zonaFormData.nivel_prioridad.toString()}
                      onValueChange={(value) =>
                        setZonaFormData({ ...zonaFormData, nivel_prioridad: Number.parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Baja</SelectItem>
                        <SelectItem value="2">2 - Media</SelectItem>
                        <SelectItem value="3">3 - Alta</SelectItem>
                        <SelectItem value="4">4 - Muy Alta</SelectItem>
                        <SelectItem value="5">5 - Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zona-descripcion">Descripción</Label>
                    <Textarea
                      id="zona-descripcion"
                      value={zonaFormData.descripcion}
                      onChange={(e) => setZonaFormData({ ...zonaFormData, descripcion: e.target.value })}
                      placeholder="Describe por qué esta zona es prioritaria"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateZonaDialogOpen(false)} disabled={submitting}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateZona} disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Crear Zona
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Propuesto por</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zonasPrioritarias
                    .filter((zona) => zona.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((zona) => (
                      <TableRow key={zona.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{zona.nombre}</div>
                            {zona.descripcion && <div className="text-sm text-gray-600">{zona.descripcion}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPrioridadBadgeColor(zona.nivel_prioridad)}>
                            {getPrioridadLabel(zona.nivel_prioridad)}
                          </Badge>
                        </TableCell>
                        <TableCell>{zona.usuario_nombre}</TableCell>
                        <TableCell>{new Date(zona.created_at).toLocaleDateString("es-ES")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rutas-sugeridas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Rutas Sugeridas</h2>
            <Dialog open={isCreateRutaDialogOpen} onOpenChange={setIsCreateRutaDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Ruta Sugerida
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Ruta Sugerida</DialogTitle>
                  <DialogDescription>Propón una nueva ruta optimizada</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ruta-nombre">Nombre de la Ruta *</Label>
                    <Input
                      id="ruta-nombre"
                      value={rutaFormData.nombre}
                      onChange={(e) => setRutaFormData({ ...rutaFormData, nombre: e.target.value })}
                      placeholder="Ej: Ruta Óptima Centro-Norte"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ruta-prioridad">Prioridad</Label>
                    <Select
                      value={rutaFormData.prioridad.toString()}
                      onValueChange={(value) => setRutaFormData({ ...rutaFormData, prioridad: Number.parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Baja</SelectItem>
                        <SelectItem value="2">2 - Media</SelectItem>
                        <SelectItem value="3">3 - Alta</SelectItem>
                        <SelectItem value="4">4 - Muy Alta</SelectItem>
                        <SelectItem value="5">5 - Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ruta-descripcion">Descripción</Label>
                    <Textarea
                      id="ruta-descripcion"
                      value={rutaFormData.descripcion}
                      onChange={(e) => setRutaFormData({ ...rutaFormData, descripcion: e.target.value })}
                      placeholder="Describe la ruta y sus beneficios"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateRutaDialogOpen(false)} disabled={submitting}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateRuta} disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Crear Ruta
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Sugerido por</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rutasSugeridas
                    .filter((ruta) => ruta.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((ruta) => (
                      <TableRow key={ruta.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{ruta.nombre}</div>
                            {ruta.descripcion && <div className="text-sm text-gray-600">{ruta.descripcion}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPrioridadBadgeColor(ruta.prioridad)}>
                            {getPrioridadLabel(ruta.prioridad)}
                          </Badge>
                        </TableCell>
                        <TableCell>{ruta.usuario_nombre}</TableCell>
                        <TableCell>{new Date(ruta.created_at).toLocaleDateString("es-ES")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zonas-asignadas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Zonas Asignadas</h2>
            <Dialog open={isCreateAsignacionDialogOpen} onOpenChange={setIsCreateAsignacionDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Asignación
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Asignar Zona</DialogTitle>
                  <DialogDescription>Asigna una zona específica a un usuario</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="asignacion-nombre">Nombre de la Zona *</Label>
                    <Input
                      id="asignacion-nombre"
                      value={asignacionFormData.nombre}
                      onChange={(e) => setAsignacionFormData({ ...asignacionFormData, nombre: e.target.value })}
                      placeholder="Ej: Sector A - Providencia"
                    />
                  </div>
                  <div>
                    <Label htmlFor="asignacion-usuario">Usuario Asignado *</Label>
                    <Select
                      value={asignacionFormData.usuario_asignado}
                      onValueChange={(value) =>
                        setAsignacionFormData({ ...asignacionFormData, usuario_asignado: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user1">Juan Pérez</SelectItem>
                        <SelectItem value="user2">María García</SelectItem>
                        <SelectItem value="user3">Carlos López</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="asignacion-descripcion">Descripción</Label>
                    <Textarea
                      id="asignacion-descripcion"
                      value={asignacionFormData.descripcion}
                      onChange={(e) => setAsignacionFormData({ ...asignacionFormData, descripcion: e.target.value })}
                      placeholder="Describe las responsabilidades de esta asignación"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateAsignacionDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateAsignacion} disabled={submitting}>
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Asignar Zona
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre de la Zona</TableHead>
                    <TableHead>Usuario Asignado</TableHead>
                    <TableHead>Fecha de Asignación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zonasAsignadas
                    .filter((zona) => zona.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((zona) => (
                      <TableRow key={zona.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{zona.nombre}</div>
                            {zona.descripcion && <div className="text-sm text-gray-600">{zona.descripcion}</div>}
                          </div>
                        </TableCell>
                        <TableCell>{zona.usuario_nombre}</TableCell>
                        <TableCell>{new Date(zona.fecha_asignacion).toLocaleDateString("es-ES")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
