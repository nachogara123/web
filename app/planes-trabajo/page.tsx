"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Plus, Edit, Trash2, Loader2, Target, Users, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { PlanTrabajoService, type PlanTrabajoCompleto } from "@/lib/services/plan-trabajo.service"
import { EquipoService, type EquipoConSupervisor } from "@/lib/services/equipo.service"

const getWeekNumber = (date: Date): number => {
  const tempDate = new Date(date.getTime())
  tempDate.setHours(0, 0, 0, 0)
  tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7))
  const week1 = new Date(tempDate.getFullYear(), 0, 4)
  return 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
}

export default function PlanesTrabajoPage() {
  const [planes, setPlanes] = useState<PlanTrabajoCompleto[]>([])
  const [equipos, setEquipos] = useState<EquipoConSupervisor[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanTrabajoCompleto | null>(null)
  const [formData, setFormData] = useState({
    id_equipo: "",
    semana: getWeekNumber(new Date()), // Usando función standalone
    año: new Date().getFullYear(),
    fecha_inicio: "",
    fecha_fin: "",
    objetivos: "",
    estado: "planificado",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [planesData, equiposData] = await Promise.all([
          PlanTrabajoService.obtenerTodos(),
          EquipoService.obtenerTodos(),
        ])
        setPlanes(planesData)
        setEquipos(equiposData)
      } catch (error) {
        console.error("Error cargando datos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCreatePlan = async () => {
    if (!formData.id_equipo || !formData.fecha_inicio || !formData.fecha_fin || !formData.objetivos) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      // Simular usuario actual - en producción vendría del contexto de autenticación
      const usuarioActual = "user-id-placeholder"

      const nuevoPlan = await PlanTrabajoService.crear({
        id_equipo: formData.id_equipo,
        semana: formData.semana,
        año: formData.año,
        fecha_inicio: new Date(formData.fecha_inicio),
        fecha_fin: new Date(formData.fecha_fin),
        objetivos: formData.objetivos,
        estado: formData.estado,
        creado_por: usuarioActual,
        actualizado_por: usuarioActual,
      })
      setPlanes([...planes, nuevoPlan])
      setIsCreateDialogOpen(false)
      resetForm()
      toast({
        title: "Plan creado",
        description: "El plan de trabajo ha sido creado exitosamente.",
      })
    } catch (error) {
      console.error("Error creando plan:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el plan de trabajo.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditPlan = async () => {
    if (!selectedPlan || !formData.fecha_inicio || !formData.fecha_fin || !formData.objetivos) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const usuarioActual = "user-id-placeholder"

      const planActualizado = await PlanTrabajoService.actualizar(selectedPlan.id_plan, {
        semana: formData.semana,
        año: formData.año,
        fecha_inicio: new Date(formData.fecha_inicio),
        fecha_fin: new Date(formData.fecha_fin),
        objetivos: formData.objetivos,
        estado: formData.estado,
        actualizado_por: usuarioActual,
      })
      const planesActualizados = planes.map((plan) => (plan.id_plan === selectedPlan.id_plan ? planActualizado : plan))
      setPlanes(planesActualizados)
      setIsEditDialogOpen(false)
      setSelectedPlan(null)
      resetForm()
      toast({
        title: "Plan actualizado",
        description: "El plan de trabajo ha sido actualizado exitosamente.",
      })
    } catch (error) {
      console.error("Error actualizando plan:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el plan de trabajo.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePlan = async (planId: string) => {
    try {
      await PlanTrabajoService.eliminar(planId)
      setPlanes(planes.filter((plan) => plan.id_plan !== planId))
      toast({
        title: "Plan eliminado",
        description: "El plan de trabajo ha sido eliminado del sistema.",
      })
    } catch (error) {
      console.error("Error eliminando plan:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el plan de trabajo.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (plan: PlanTrabajoCompleto) => {
    setSelectedPlan(plan)
    setFormData({
      id_equipo: plan.id_equipo,
      semana: plan.semana,
      año: plan.año,
      fecha_inicio: plan.fecha_inicio.toISOString().split("T")[0],
      fecha_fin: plan.fecha_fin.toISOString().split("T")[0],
      objetivos: plan.objetivos || "",
      estado: plan.estado,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      id_equipo: "",
      semana: getWeekNumber(new Date()), // Usando función standalone
      año: new Date().getFullYear(),
      fecha_inicio: "",
      fecha_fin: "",
      objetivos: "",
      estado: "planificado",
    })
  }

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "planificado":
        return "bg-blue-100 text-blue-800"
      case "en_progreso":
        return "bg-yellow-100 text-yellow-800"
      case "completado":
        return "bg-green-100 text-green-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEstadoLabel = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "planificado":
        return "Planificado"
      case "en_progreso":
        return "En Progreso"
      case "completado":
        return "Completado"
      case "cancelado":
        return "Cancelado"
      default:
        return estado
    }
  }

  if (loading) {
    return (
      <div className="pt-16 p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando planes de trabajo...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planes de Trabajo</h1>
          <p className="text-gray-600">Gestiona los planes de trabajo de los equipos</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Plan de Trabajo</DialogTitle>
              <DialogDescription>Define un nuevo plan de trabajo para un equipo</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="equipo">Equipo *</Label>
                <Select
                  value={formData.id_equipo}
                  onValueChange={(value) => setFormData({ ...formData, id_equipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un equipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipos.map((equipo) => (
                      <SelectItem key={equipo.id_equipo} value={equipo.id_equipo}>
                        {equipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planificado">Planificado</SelectItem>
                    <SelectItem value="en_progreso">En Progreso</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="semana">Semana</Label>
                <Input
                  id="semana"
                  type="number"
                  min="1"
                  max="53"
                  value={formData.semana}
                  onChange={(e) => setFormData({ ...formData, semana: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="año">Año</Label>
                <Input
                  id="año"
                  type="number"
                  min="2020"
                  max="2030"
                  value={formData.año}
                  onChange={(e) => setFormData({ ...formData, año: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="fecha_inicio">Fecha Inicio *</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fecha_fin">Fecha Fin *</Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="objetivos">Objetivos *</Label>
                <Textarea
                  id="objetivos"
                  value={formData.objetivos}
                  onChange={(e) => setFormData({ ...formData, objetivos: e.target.value })}
                  placeholder="Describe los objetivos y metas del plan de trabajo"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePlan} disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Crear Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Planes</p>
                <p className="text-2xl font-bold text-gray-900">{planes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Progreso</p>
                <p className="text-2xl font-bold text-gray-900">
                  {planes.filter((p) => p.estado === "en_progreso").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {planes.filter((p) => p.estado === "completado").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold text-gray-900">
                  {planes.filter((p) => p.semana === getWeekNumber(new Date())).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de planes */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-gray-900">Lista de Planes de Trabajo</CardTitle>
          <CardDescription>{planes.length} planes registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-900">Equipo</TableHead>
                  <TableHead className="font-semibold text-gray-900">Semana/Año</TableHead>
                  <TableHead className="font-semibold text-gray-900">Período</TableHead>
                  <TableHead className="font-semibold text-gray-900">Estado</TableHead>
                  <TableHead className="font-semibold text-gray-900">Creado por</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planes.map((plan) => (
                  <TableRow key={plan.id_plan} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{plan.equipo.nombre}</div>
                        <div className="text-sm text-gray-600">{plan.equipo.supervisor.nombre}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      Semana {plan.semana}/{plan.año}
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {new Date(plan.fecha_inicio).toLocaleDateString("es-ES")} -{" "}
                      {new Date(plan.fecha_fin).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell>
                      <Badge className={getEstadoBadgeColor(plan.estado)}>{getEstadoLabel(plan.estado)}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">{plan.usuario_creador.nombre}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(plan)}
                          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePlan(plan.id_plan)}
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
            <DialogTitle>Editar Plan de Trabajo</DialogTitle>
            <DialogDescription>Modifica la información del plan seleccionado</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planificado">Planificado</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-semana">Semana</Label>
              <Input
                id="edit-semana"
                type="number"
                min="1"
                max="53"
                value={formData.semana}
                onChange={(e) => setFormData({ ...formData, semana: Number.parseInt(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="edit-fecha_inicio">Fecha Inicio *</Label>
              <Input
                id="edit-fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-fecha_fin">Fecha Fin *</Label>
              <Input
                id="edit-fecha_fin"
                type="date"
                value={formData.fecha_fin}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-objetivos">Objetivos *</Label>
              <Textarea
                id="edit-objetivos"
                value={formData.objetivos}
                onChange={(e) => setFormData({ ...formData, objetivos: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleEditPlan} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
