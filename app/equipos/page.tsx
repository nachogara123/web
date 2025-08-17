"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Users, Plus, Edit, Trash2, Calendar, Loader2, UserPlus } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { EquipoService, type EquipoConSupervisor } from "@/lib/services/equipo.service"
import { UsuarioService, type UsuarioConRol } from "@/lib/services/usuario.service"

export default function EquiposPage() {
  const [equipos, setEquipos] = useState<EquipoConSupervisor[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioConRol[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedEquipo, setSelectedEquipo] = useState<EquipoConSupervisor | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "",
    id_supervisor: "",
  })
  const [assignData, setAssignData] = useState({
    equipoId: "",
    usuarioId: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [equiposData, usuariosData] = await Promise.all([
          EquipoService.obtenerTodos(),
          UsuarioService.obtenerTodos(),
        ])
        setEquipos(equiposData)
        setUsuarios(usuariosData)
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

  const handleCreateEquipo = async () => {
    if (!formData.nombre || !formData.tipo || !formData.id_supervisor) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const nuevoEquipo = await EquipoService.crear({
        nombre: formData.nombre,
        tipo: formData.tipo,
        fecha_creacion: new Date(),
        id_supervisor: formData.id_supervisor,
      })
      setEquipos([...equipos, nuevoEquipo])
      setIsCreateDialogOpen(false)
      setFormData({ nombre: "", tipo: "", id_supervisor: "" })
      toast({
        title: "Equipo creado",
        description: "El equipo ha sido creado exitosamente.",
      })
    } catch (error) {
      console.error("Error creando equipo:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el equipo.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditEquipo = async () => {
    if (!selectedEquipo || !formData.nombre || !formData.tipo || !formData.id_supervisor) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const equipoActualizado = await EquipoService.actualizar(selectedEquipo.id_equipo, {
        nombre: formData.nombre,
        tipo: formData.tipo,
        id_supervisor: formData.id_supervisor,
      })
      const equiposActualizados = equipos.map((equipo) =>
        equipo.id_equipo === selectedEquipo.id_equipo ? equipoActualizado : equipo,
      )
      setEquipos(equiposActualizados)
      setIsEditDialogOpen(false)
      setSelectedEquipo(null)
      setFormData({ nombre: "", tipo: "", id_supervisor: "" })
      toast({
        title: "Equipo actualizado",
        description: "El equipo ha sido actualizado exitosamente.",
      })
    } catch (error) {
      console.error("Error actualizando equipo:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el equipo.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEquipo = async (equipoId: string) => {
    try {
      await EquipoService.eliminar(equipoId)
      setEquipos(equipos.filter((equipo) => equipo.id_equipo !== equipoId))
      toast({
        title: "Equipo eliminado",
        description: "El equipo ha sido eliminado del sistema.",
      })
    } catch (error) {
      console.error("Error eliminando equipo:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el equipo. Puede que tenga usuarios asignados.",
        variant: "destructive",
      })
    }
  }

  const handleAssignUser = async () => {
    if (!assignData.equipoId || !assignData.usuarioId) {
      toast({
        title: "Error",
        description: "Selecciona un equipo y un usuario.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      await EquipoService.asignarUsuario(assignData.equipoId, assignData.usuarioId)
      // Recargar datos
      const equiposData = await EquipoService.obtenerTodos()
      setEquipos(equiposData)
      setIsAssignDialogOpen(false)
      setAssignData({ equipoId: "", usuarioId: "" })
      toast({
        title: "Usuario asignado",
        description: "El usuario ha sido asignado al equipo exitosamente.",
      })
    } catch (error) {
      console.error("Error asignando usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo asignar el usuario al equipo.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnassignUser = async (equipoId: string, usuarioId: string) => {
    try {
      await EquipoService.desasignarUsuario(equipoId, usuarioId)
      // Recargar datos
      const equiposData = await EquipoService.obtenerTodos()
      setEquipos(equiposData)
      toast({
        title: "Usuario desasignado",
        description: "El usuario ha sido removido del equipo.",
      })
    } catch (error) {
      console.error("Error desasignando usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo desasignar el usuario del equipo.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (equipo: EquipoConSupervisor) => {
    setSelectedEquipo(equipo)
    setFormData({
      nombre: equipo.nombre,
      tipo: equipo.tipo,
      id_supervisor: equipo.id_supervisor,
    })
    setIsEditDialogOpen(true)
  }

  const openAssignDialog = (equipoId: string) => {
    setAssignData({ equipoId, usuarioId: "" })
    setIsAssignDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="pt-16 p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando equipos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Equipos</h1>
          <p className="text-gray-600">Administra los equipos de trabajo y sus miembros</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Asignar Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Asignar Usuario a Equipo</DialogTitle>
                <DialogDescription>Selecciona un equipo y un usuario para realizar la asignación</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="equipo">Equipo</Label>
                  <Select
                    value={assignData.equipoId}
                    onValueChange={(value) => setAssignData({ ...assignData, equipoId: value })}
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
                  <Label htmlFor="usuario">Usuario</Label>
                  <Select
                    value={assignData.usuarioId}
                    onValueChange={(value) => setAssignData({ ...assignData, usuarioId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map((usuario) => (
                        <SelectItem key={usuario.id_user} value={usuario.id_user}>
                          {usuario.nombre} - {usuario.rol.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)} disabled={submitting}>
                  Cancelar
                </Button>
                <Button onClick={handleAssignUser} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Asignar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Crear Equipo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Equipo</DialogTitle>
                <DialogDescription>Completa la información para crear un nuevo equipo de trabajo</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre del Equipo *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Equipo Centro"
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo de Equipo *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Campo">Campo</SelectItem>
                      <SelectItem value="Oficina">Oficina</SelectItem>
                      <SelectItem value="Mixto">Mixto</SelectItem>
                      <SelectItem value="Especializado">Especializado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supervisor">Supervisor *</Label>
                  <Select
                    value={formData.id_supervisor}
                    onValueChange={(value) => setFormData({ ...formData, id_supervisor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios
                        .filter((usuario) => usuario.rol.nombre.toLowerCase().includes("supervisor"))
                        .map((supervisor) => (
                          <SelectItem key={supervisor.id_user} value={supervisor.id_user}>
                            {supervisor.nombre}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={submitting}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateEquipo} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Crear Equipo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {equipos.map((equipo) => (
          <Card key={equipo.id_equipo} className="relative shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {equipo.nombre}
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-800">{equipo.tipo}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Supervisor:</span>
                  <span>{equipo.supervisor.nombre}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Creado:</span>
                  <span>{new Date(equipo.fecha_creacion).toLocaleDateString("es-ES")}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Miembros ({equipo.usuarios.length})</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {equipo.usuarios.map((usuarioEquipo) => (
                    <div key={usuarioEquipo.usuario.id_user} className="flex items-center justify-between text-sm">
                      <span>{usuarioEquipo.usuario.nombre}</span>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {usuarioEquipo.usuario.rol.nombre}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnassignUser(equipo.id_equipo, usuarioEquipo.usuario.id_user)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {equipo.usuarios.length === 0 && <p className="text-gray-500 text-xs">No hay miembros asignados</p>}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => openEditDialog(equipo)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => openAssignDialog(equipo.id_equipo)}>
                  <UserPlus className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteEquipo(equipo.id_equipo)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Equipo</DialogTitle>
            <DialogDescription>Modifica la información del equipo seleccionado</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nombre">Nombre del Equipo *</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-tipo">Tipo de Equipo *</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Campo">Campo</SelectItem>
                  <SelectItem value="Oficina">Oficina</SelectItem>
                  <SelectItem value="Mixto">Mixto</SelectItem>
                  <SelectItem value="Especializado">Especializado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-supervisor">Supervisor *</Label>
              <Select
                value={formData.id_supervisor}
                onValueChange={(value) => setFormData({ ...formData, id_supervisor: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {usuarios
                    .filter((usuario) => usuario.rol.nombre.toLowerCase().includes("supervisor"))
                    .map((supervisor) => (
                      <SelectItem key={supervisor.id_user} value={supervisor.id_user}>
                        {supervisor.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleEditEquipo} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
