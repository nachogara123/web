"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { MapPin, Download, Search, Calendar, Users, Plus, Edit, Trash2, Loader2, Filter } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { DireccionService, type DireccionCompleta } from "@/lib/services/direccion.service"

export default function DireccionesPage() {
  const [direcciones, setDirecciones] = useState<DireccionCompleta[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState<string>("all")
  const [filterComuna, setFilterComuna] = useState<string>("all")
  const [filterClasificacion, setFilterClasificacion] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedDireccion, setSelectedDireccion] = useState<DireccionCompleta | null>(null)
  const [formData, setFormData] = useState({
    direccion_final: "",
    lon: "",
    lat: "",
    id_canal: "",
    id_comuna: "",
    id_tipo_vivienda: "",
    nota: "",
    hub_feeder_zona: "",
    id_cto: "",
    id_estado: "",
    id_clasificacion: "",
  })
  const [submitting, setSubmitting] = useState(false)

  // Estados para los selects
  const [canales, setCanales] = useState<Array<{ id_canal: number; nombre: string }>>([])
  const [comunas, setComunas] = useState<Array<{ id_comuna: number; nombre: string }>>([])
  const [tiposVivienda, setTiposVivienda] = useState<Array<{ id_tipo_vivienda: number; nombre: string }>>([])
  const [estados, setEstados] = useState<Array<{ id_estado: number; nombre: string }>>([])
  const [clasificaciones, setClasificaciones] = useState<Array<{ id_clasificacion: number; nombre: string }>>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const direccionesData = await DireccionService.obtenerTodas(100, 0)
        setDirecciones(direccionesData)

        // Extraer opciones únicas para los filtros
        const canalesUnicos = [
          ...new Set(direccionesData.map((d) => ({ id_canal: d.canal.id_canal, nombre: d.canal.nombre }))),
        ]
        const comunasUnicas = [
          ...new Set(direccionesData.map((d) => ({ id_comuna: d.comuna.id_comuna, nombre: d.comuna.nombre }))),
        ]
        const tiposUnicos = [
          ...new Set(
            direccionesData.map((d) => ({
              id_tipo_vivienda: d.tipo_vivienda.id_tipo_vivienda,
              nombre: d.tipo_vivienda.nombre,
            })),
          ),
        ]
        const estadosUnicos = [
          ...new Set(direccionesData.map((d) => ({ id_estado: d.estado.id_estado, nombre: d.estado.nombre }))),
        ]
        const clasificacionesUnicas = [
          ...new Set(
            direccionesData.map((d) => ({
              id_clasificacion: d.clasificacion.id_clasificacion,
              nombre: d.clasificacion.nombre,
            })),
          ),
        ]

        setCanales(canalesUnicos)
        setComunas(comunasUnicas)
        setTiposVivienda(tiposUnicos)
        setEstados(estadosUnicos)
        setClasificaciones(clasificacionesUnicas)
      } catch (error) {
        console.error("Error cargando direcciones:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las direcciones.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredDirecciones = direcciones.filter((direccion) => {
    const matchesSearch =
      direccion.direccion_final?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      direccion.comuna.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filterEstado === "all" || direccion.estado.id_estado.toString() === filterEstado
    const matchesComuna = filterComuna === "all" || direccion.comuna.id_comuna.toString() === filterComuna
    const matchesClasificacion =
      filterClasificacion === "all" || direccion.clasificacion.id_clasificacion.toString() === filterClasificacion

    return matchesSearch && matchesEstado && matchesComuna && matchesClasificacion
  })

  const handleCreateDireccion = async () => {
    if (
      !formData.direccion_final ||
      !formData.id_canal ||
      !formData.id_comuna ||
      !formData.id_tipo_vivienda ||
      !formData.id_estado ||
      !formData.id_clasificacion
    ) {
      toast({
        title: "Error",
        description: "Los campos obligatorios deben ser completados.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const nuevaDireccion = await DireccionService.crear({
        direccion_final: formData.direccion_final,
        lon: formData.lon ? Number.parseFloat(formData.lon) : undefined,
        lat: formData.lat ? Number.parseFloat(formData.lat) : undefined,
        id_canal: Number.parseInt(formData.id_canal),
        id_comuna: Number.parseInt(formData.id_comuna),
        id_tipo_vivienda: Number.parseInt(formData.id_tipo_vivienda),
        nota: formData.nota || undefined,
        hub_feeder_zona: formData.hub_feeder_zona || undefined,
        id_cto: formData.id_cto || undefined,
        id_estado: Number.parseInt(formData.id_estado),
        id_clasificacion: Number.parseInt(formData.id_clasificacion),
        contador: 0,
        total_comentarios: 0,
      })
      setDirecciones([...direcciones, nuevaDireccion])
      setIsCreateDialogOpen(false)
      resetForm()
      toast({
        title: "Dirección creada",
        description: "La dirección ha sido creada exitosamente.",
      })
    } catch (error) {
      console.error("Error creando dirección:", error)
      toast({
        title: "Error",
        description: "No se pudo crear la dirección.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditDireccion = async () => {
    if (
      !selectedDireccion ||
      !formData.direccion_final ||
      !formData.id_canal ||
      !formData.id_comuna ||
      !formData.id_tipo_vivienda ||
      !formData.id_estado ||
      !formData.id_clasificacion
    ) {
      toast({
        title: "Error",
        description: "Los campos obligatorios deben ser completados.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const direccionActualizada = await DireccionService.actualizar(selectedDireccion.id_direccion, {
        direccion_final: formData.direccion_final,
        lon: formData.lon ? Number.parseFloat(formData.lon) : undefined,
        lat: formData.lat ? Number.parseFloat(formData.lat) : undefined,
        id_canal: Number.parseInt(formData.id_canal),
        id_comuna: Number.parseInt(formData.id_comuna),
        id_tipo_vivienda: Number.parseInt(formData.id_tipo_vivienda),
        nota: formData.nota || undefined,
        hub_feeder_zona: formData.hub_feeder_zona || undefined,
        id_cto: formData.id_cto || undefined,
        id_estado: Number.parseInt(formData.id_estado),
        id_clasificacion: Number.parseInt(formData.id_clasificacion),
      })
      const direccionesActualizadas = direcciones.map((dir) =>
        dir.id_direccion === selectedDireccion.id_direccion ? direccionActualizada : dir,
      )
      setDirecciones(direccionesActualizadas)
      setIsEditDialogOpen(false)
      setSelectedDireccion(null)
      resetForm()
      toast({
        title: "Dirección actualizada",
        description: "La dirección ha sido actualizada exitosamente.",
      })
    } catch (error) {
      console.error("Error actualizando dirección:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la dirección.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteDireccion = async (direccionId: number) => {
    try {
      await DireccionService.eliminar(direccionId)
      setDirecciones(direcciones.filter((dir) => dir.id_direccion !== direccionId))
      toast({
        title: "Dirección eliminada",
        description: "La dirección ha sido eliminada del sistema.",
      })
    } catch (error) {
      console.error("Error eliminando dirección:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la dirección.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (direccion: DireccionCompleta) => {
    setSelectedDireccion(direccion)
    setFormData({
      direccion_final: direccion.direccion_final || "",
      lon: direccion.lon?.toString() || "",
      lat: direccion.lat?.toString() || "",
      id_canal: direccion.id_canal.toString(),
      id_comuna: direccion.id_comuna.toString(),
      id_tipo_vivienda: direccion.id_tipo_vivienda.toString(),
      nota: direccion.nota || "",
      hub_feeder_zona: direccion.hub_feeder_zona || "",
      id_cto: direccion.id_cto || "",
      id_estado: direccion.id_estado.toString(),
      id_clasificacion: direccion.id_clasificacion.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      direccion_final: "",
      lon: "",
      lat: "",
      id_canal: "",
      id_comuna: "",
      id_tipo_vivienda: "",
      nota: "",
      hub_feeder_zona: "",
      id_cto: "",
      id_estado: "",
      id_clasificacion: "",
    })
  }

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Dirección",
      "Comuna",
      "Latitud",
      "Longitud",
      "Canal",
      "Tipo Vivienda",
      "Estado",
      "Clasificación",
      "Nota",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredDirecciones.map((dir) =>
        [
          dir.id_direccion,
          `"${dir.direccion_final || ""}"`,
          dir.comuna.nombre,
          dir.lat || "",
          dir.lon || "",
          dir.canal.nombre,
          dir.tipo_vivienda.nombre,
          dir.estado.nombre,
          dir.clasificacion.nombre,
          `"${dir.nota || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `direcciones_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getEstadoBadgeColor = (estado: string) => {
    const estadoLower = estado.toLowerCase()
    if (estadoLower.includes("verificad")) return "bg-green-100 text-green-800"
    if (estadoLower.includes("pendiente")) return "bg-yellow-100 text-yellow-800"
    if (estadoLower.includes("error")) return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="pt-16 p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando direcciones...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Direcciones</h1>
          <p className="text-gray-600">Administra las direcciones del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Dirección
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva Dirección</DialogTitle>
                <DialogDescription>Completa la información para crear una nueva dirección</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="direccion">Dirección *</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion_final}
                    onChange={(e) => setFormData({ ...formData, direccion_final: e.target.value })}
                    placeholder="Ej: Av. Providencia 1234"
                  />
                </div>
                <div>
                  <Label htmlFor="lat">Latitud</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    placeholder="-33.4489"
                  />
                </div>
                <div>
                  <Label htmlFor="lon">Longitud</Label>
                  <Input
                    id="lon"
                    type="number"
                    step="any"
                    value={formData.lon}
                    onChange={(e) => setFormData({ ...formData, lon: e.target.value })}
                    placeholder="-70.6693"
                  />
                </div>
                <div>
                  <Label htmlFor="canal">Canal *</Label>
                  <Select
                    value={formData.id_canal}
                    onValueChange={(value) => setFormData({ ...formData, id_canal: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar canal" />
                    </SelectTrigger>
                    <SelectContent>
                      {canales.map((canal) => (
                        <SelectItem key={canal.id_canal} value={canal.id_canal.toString()}>
                          {canal.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="comuna">Comuna *</Label>
                  <Select
                    value={formData.id_comuna}
                    onValueChange={(value) => setFormData({ ...formData, id_comuna: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar comuna" />
                    </SelectTrigger>
                    <SelectContent>
                      {comunas.map((comuna) => (
                        <SelectItem key={comuna.id_comuna} value={comuna.id_comuna.toString()}>
                          {comuna.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tipo_vivienda">Tipo Vivienda *</Label>
                  <Select
                    value={formData.id_tipo_vivienda}
                    onValueChange={(value) => setFormData({ ...formData, id_tipo_vivienda: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposVivienda.map((tipo) => (
                        <SelectItem key={tipo.id_tipo_vivienda} value={tipo.id_tipo_vivienda.toString()}>
                          {tipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estado">Estado *</Label>
                  <Select
                    value={formData.id_estado}
                    onValueChange={(value) => setFormData({ ...formData, id_estado: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estados.map((estado) => (
                        <SelectItem key={estado.id_estado} value={estado.id_estado.toString()}>
                          {estado.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="clasificacion">Clasificación *</Label>
                  <Select
                    value={formData.id_clasificacion}
                    onValueChange={(value) => setFormData({ ...formData, id_clasificacion: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar clasificación" />
                    </SelectTrigger>
                    <SelectContent>
                      {clasificaciones.map((clasificacion) => (
                        <SelectItem
                          key={clasificacion.id_clasificacion}
                          value={clasificacion.id_clasificacion.toString()}
                        >
                          {clasificacion.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hub_feeder">Hub/Feeder/Zona</Label>
                  <Input
                    id="hub_feeder"
                    value={formData.hub_feeder_zona}
                    onChange={(e) => setFormData({ ...formData, hub_feeder_zona: e.target.value })}
                    placeholder="Zona técnica"
                  />
                </div>
                <div>
                  <Label htmlFor="cto">ID CTO</Label>
                  <Input
                    id="cto"
                    value={formData.id_cto}
                    onChange={(e) => setFormData({ ...formData, id_cto: e.target.value })}
                    placeholder="Identificador CTO"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="nota">Nota</Label>
                  <Textarea
                    id="nota"
                    value={formData.nota}
                    onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
                    placeholder="Observaciones adicionales"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={submitting}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateDireccion} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Crear Dirección
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2">Estado</Label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {estados.map((estado) => (
                    <SelectItem key={estado.id_estado} value={estado.id_estado.toString()}>
                      {estado.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2">Comuna</Label>
              <Select value={filterComuna} onValueChange={setFilterComuna}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {comunas.map((comuna) => (
                    <SelectItem key={comuna.id_comuna} value={comuna.id_comuna.toString()}>
                      {comuna.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2">Clasificación</Label>
              <Select value={filterClasificacion} onValueChange={setFilterClasificacion}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {clasificaciones.map((clasificacion) => (
                    <SelectItem key={clasificacion.id_clasificacion} value={clasificacion.id_clasificacion.toString()}>
                      {clasificacion.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{filteredDirecciones.length}</p>
                <p className="text-xs text-gray-500">Total Direcciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {filteredDirecciones.filter((d) => d.estado.nombre.toLowerCase().includes("verificad")).length}
                </p>
                <p className="text-xs text-gray-500">Verificadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {filteredDirecciones.filter((d) => d.total_comentarios && d.total_comentarios > 0).length}
                </p>
                <p className="text-xs text-gray-500">Con Comentarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{filteredDirecciones.filter((d) => d.lat && d.lon).length}</p>
                <p className="text-xs text-gray-500">Geolocalizadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de direcciones */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-gray-900">Lista de Direcciones</CardTitle>
          <CardDescription>
            Mostrando {filteredDirecciones.length} de {direcciones.length} direcciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-900">Dirección</TableHead>
                  <TableHead className="font-semibold text-gray-900">Comuna</TableHead>
                  <TableHead className="font-semibold text-gray-900">Coordenadas</TableHead>
                  <TableHead className="font-semibold text-gray-900">Canal</TableHead>
                  <TableHead className="font-semibold text-gray-900">Estado</TableHead>
                  <TableHead className="font-semibold text-gray-900">Comentarios</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDirecciones.map((direccion) => (
                  <TableRow key={direccion.id_direccion} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{direccion.direccion_final || "Sin dirección"}</div>
                        <div className="text-sm text-gray-600">{direccion.tipo_vivienda.nombre}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">{direccion.comuna.nombre}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {direccion.lat && direccion.lon
                        ? `${direccion.lat.toFixed(4)}, ${direccion.lon.toFixed(4)}`
                        : "Sin coordenadas"}
                    </TableCell>
                    <TableCell className="text-gray-700">{direccion.canal.nombre}</TableCell>
                    <TableCell>
                      <Badge className={getEstadoBadgeColor(direccion.estado.nombre)}>{direccion.estado.nombre}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">{direccion.total_comentarios || 0}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(direccion)}
                          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDireccion(direccion.id_direccion)}
                          className="hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Dirección</DialogTitle>
            <DialogDescription>Modifica la información de la dirección seleccionada</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="edit-direccion">Dirección *</Label>
              <Input
                id="edit-direccion"
                value={formData.direccion_final}
                onChange={(e) => setFormData({ ...formData, direccion_final: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-lat">Latitud</Label>
              <Input
                id="edit-lat"
                type="number"
                step="any"
                value={formData.lat}
                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-lon">Longitud</Label>
              <Input
                id="edit-lon"
                type="number"
                step="any"
                value={formData.lon}
                onChange={(e) => setFormData({ ...formData, lon: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-canal">Canal *</Label>
              <Select
                value={formData.id_canal}
                onValueChange={(value) => setFormData({ ...formData, id_canal: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {canales.map((canal) => (
                    <SelectItem key={canal.id_canal} value={canal.id_canal.toString()}>
                      {canal.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-comuna">Comuna *</Label>
              <Select
                value={formData.id_comuna}
                onValueChange={(value) => setFormData({ ...formData, id_comuna: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {comunas.map((comuna) => (
                    <SelectItem key={comuna.id_comuna} value={comuna.id_comuna.toString()}>
                      {comuna.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-estado">Estado *</Label>
              <Select
                value={formData.id_estado}
                onValueChange={(value) => setFormData({ ...formData, id_estado: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {estados.map((estado) => (
                    <SelectItem key={estado.id_estado} value={estado.id_estado.toString()}>
                      {estado.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-clasificacion">Clasificación *</Label>
              <Select
                value={formData.id_clasificacion}
                onValueChange={(value) => setFormData({ ...formData, id_clasificacion: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clasificaciones.map((clasificacion) => (
                    <SelectItem key={clasificacion.id_clasificacion} value={clasificacion.id_clasificacion.toString()}>
                      {clasificacion.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-nota">Nota</Label>
              <Textarea
                id="edit-nota"
                value={formData.nota}
                onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleEditDireccion} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {filteredDirecciones.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay direcciones</h3>
            <p className="text-gray-500">No se encontraron direcciones con los filtros aplicados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
