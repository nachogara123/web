"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, Edit, Trash2, Loader2, Shield } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { PermissionGuard } from "@/components/permission-guard"
import { RolService } from "@/lib/services/rol.service"
import type { Rol } from "@prisma/client"

export default function RolesPage() {
  const [roles, setRoles] = useState<Rol[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Rol | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoading(true)
        const rolesData = await RolService.obtenerTodos()
        setRoles(rolesData)
      } catch (error) {
        console.error("Error cargando roles:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los roles.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadRoles()
  }, [])

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => role.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [roles, searchTerm])

  const handleCreateRole = async () => {
    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre del rol es obligatorio.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const newRole = await RolService.crear({ nombre: formData.nombre.trim() })
      setRoles([...roles, newRole])
      setIsCreateDialogOpen(false)
      setFormData({ nombre: "" })
      toast({
        title: "Rol creado",
        description: "El rol ha sido creado exitosamente.",
      })
    } catch (error) {
      console.error("Error creando rol:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el rol. Verifica que el nombre no esté duplicado.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditRole = async () => {
    if (!selectedRole || !formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre del rol es obligatorio.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const updatedRole = await RolService.actualizar(selectedRole.id_rol, {
        nombre: formData.nombre.trim(),
      })
      const updatedRoles = roles.map((role) => (role.id_rol === selectedRole.id_rol ? updatedRole : role))
      setRoles(updatedRoles)
      setIsEditDialogOpen(false)
      setSelectedRole(null)
      setFormData({ nombre: "" })
      toast({
        title: "Rol actualizado",
        description: "El rol ha sido actualizado exitosamente.",
      })
    } catch (error) {
      console.error("Error actualizando rol:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol. Verifica que el nombre no esté duplicado.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    try {
      await RolService.eliminar(roleId)
      setRoles(roles.filter((role) => role.id_rol !== roleId))
      toast({
        title: "Rol eliminado",
        description: "El rol ha sido eliminado del sistema.",
      })
    } catch (error) {
      console.error("Error eliminando rol:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el rol. Puede que tenga usuarios asignados.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (role: Rol) => {
    setSelectedRole(role)
    setFormData({ nombre: role.nombre })
    setIsEditDialogOpen(true)
  }

  const getRoleBadgeColor = (roleName: string) => {
    const name = roleName.toLowerCase()
    if (name.includes("admin")) return "bg-red-100 text-red-800"
    if (name.includes("supervisor")) return "bg-blue-100 text-blue-800"
    if (name.includes("ejecutivo")) return "bg-green-100 text-green-800"
    return "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="pt-16 p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando roles...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Roles</h1>
          <p className="text-gray-600">Administra los roles y permisos del sistema GeoVision</p>
        </div>

        <PermissionGuard permission="usuarios">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Rol
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Rol</DialogTitle>
                <DialogDescription>Define un nuevo rol para asignar a los usuarios del sistema.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre del Rol *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ nombre: e.target.value })}
                    placeholder="Ej: Coordinador, Analista, etc."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={submitting}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateRole} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Crear Rol
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PermissionGuard>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-gray-900 flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Lista de Roles
          </CardTitle>
          <CardDescription>
            {filteredRoles.length} de {roles.length} roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-900">Nombre del Rol</TableHead>
                  <TableHead className="font-semibold text-gray-900">Fecha de Creación</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id_rol} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center">
                        <Badge className={getRoleBadgeColor(role.nombre)}>{role.nombre}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {new Date(role.created_at).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(role)}
                          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id_rol)}
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Rol</DialogTitle>
            <DialogDescription>Modifica el nombre del rol seleccionado.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-nombre">Nombre del Rol *</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ nombre: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleEditRole} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
