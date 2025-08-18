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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2, Filter, Upload, FileText, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { PermissionGuard } from "@/components/permission-guard"
import { api, type User } from "@/lib/api"
import { RolService } from "@/lib/services/rol.service"
import type { Rol } from "@prisma/client"

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Rol[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    status: "active" as User["status"],
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [usersData, rolesData] = await Promise.all([api.getAllUsers(), RolService.obtenerTodos()])
        setUsers(usersData)
        setRoles(rolesData)
      } catch (error) {
        console.error("Error cargando datos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos. Usando datos de ejemplo.",
          variant: "destructive",
        })
        // Datos de respaldo
        setUsers([])
        setRoles([
          { id_rol: "1", nombre: "Administrador", created_at: new Date() },
          { id_rol: "2", nombre: "Supervisor", created_at: new Date() },
          { id_rol: "3", nombre: "Ejecutivo", created_at: new Date() },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesStatus = statusFilter === "all" || user.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, roleFilter, statusFilter])

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const newUser = await api.createUser({
        nombre: formData.name,
        email: formData.email,
        clave: formData.password, // En producción, esto debería ser hasheado
        rol_id: formData.role,
      })

      setUsers([...users, newUser])
      setIsCreateDialogOpen(false)
      setFormData({ name: "", email: "", password: "", role: "", status: "active" })
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente.",
      })
    } catch (error) {
      console.error("Error creando usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el usuario. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser || !formData.name || !formData.email || !formData.role) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const updateData: any = {
        nombre: formData.name,
        email: formData.email,
        rol_id: formData.role,
      }

      if (formData.password) {
        updateData.clave = formData.password
      }

      const updatedUser = await api.updateUser(selectedUser.id, updateData)
      const updatedUsers = users.map((user) => (user.id === selectedUser.id ? updatedUser : user))

      setUsers(updatedUsers)
      setIsEditDialogOpen(false)
      setSelectedUser(null)
      setFormData({ name: "", email: "", password: "", role: "", status: "active" })
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados.",
      })
    } catch (error) {
      console.error("Error actualizando usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleBulkUpload = () => {
    if (!uploadFile) return

    // Mock processing of CSV file
    const mockNewUsers = [
      { name: "Usuario Masivo 1", email: "user1@bulk.com", role: roles[0]?.id_rol || "", status: "active" as const },
      { name: "Usuario Masivo 2", email: "user2@bulk.com", role: roles[0]?.id_rol || "", status: "active" as const },
    ]

    const newUsers = mockNewUsers.map((userData) => ({
      id: Date.now().toString() + Math.random(),
      ...userData,
      roleName: roles.find((r) => r.id_rol === userData.role)?.nombre,
      lastAccess: undefined,
      createdAt: new Date().toISOString(),
    }))

    setUsers([...users, ...newUsers])
    setIsBulkUploadOpen(false)
    setUploadFile(null)
    toast({
      title: "Usuarios cargados",
      description: `Se han creado ${newUsers.length} usuarios desde el archivo.`,
    })
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.deleteUser(userId)
      setUsers(users.filter((user) => user.id !== userId))
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado del sistema.",
      })
    } catch (error) {
      console.error("Error eliminando usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario. Inténtalo de nuevo.",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // No mostrar contraseña actual
      role: user.role,
      status: user.status,
    })
    setIsEditDialogOpen(true)
  }

  const getRoleBadgeColor = (roleId: string) => {
    const role = roles.find((r) => r.id_rol === roleId)
    const roleName = role?.nombre.toLowerCase() || ""

    if (roleName.includes("admin")) return "bg-red-100 text-red-800"
    if (roleName.includes("supervisor")) return "bg-blue-100 text-blue-800"
    return "bg-gray-100 text-gray-800"
  }

  const getStatusBadgeColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
  }

  const getRoleName = (roleId: string) => {
    return roles.find((r) => r.id_rol === roleId)?.nombre || "Desconocido"
  }

  if (loading) {
    return (
      <div className="pt-16 p-6 space-y-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Cargando usuarios...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600">Administra los usuarios del sistema GeoVision</p>
        </div>

        <div className="flex gap-2">
          <PermissionGuard permission="usuarios">
            <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Carga Masiva
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Carga Masiva de Usuarios</DialogTitle>
                  <DialogDescription>
                    Sube un archivo CSV con los datos de múltiples usuarios para crearlos automáticamente.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <Label htmlFor="csv-upload" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500">Seleccionar archivo CSV</span>
                      </Label>
                      <Input
                        id="csv-upload"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      />
                      <p className="text-sm text-gray-500">Formato: nombre,email,rol,estado</p>
                      {uploadFile && <p className="text-sm text-green-600">Archivo seleccionado: {uploadFile.name}</p>}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleBulkUpload} disabled={!uploadFile}>
                    Procesar Archivo
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </PermissionGuard>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>Completa los datos para crear un nuevo usuario en el sistema.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nombre completo"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="usuario@ejemplo.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Contraseña segura"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Rol *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id_rol} value={role.id_rol}>
                          {role.nombre}
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
                <Button onClick={handleCreateUser} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Crear Usuario
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-gray-900">Lista de Usuarios</CardTitle>
          <CardDescription>
            {filteredUsers.length} de {users.length} usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[140px] border-gray-300">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id_rol} value={role.id_rol}>
                      {role.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] border-gray-300">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-900">Usuario</TableHead>
                  <TableHead className="font-semibold text-gray-900">Rol</TableHead>
                  <TableHead className="font-semibold text-gray-900">Estado</TableHead>
                  <TableHead className="font-semibold text-gray-900">Último Acceso</TableHead>
                  <TableHead className="font-semibold text-gray-900">Fecha Creación</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>{getRoleName(user.role)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(user.status)}>
                        {user.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">{user.lastAccess || "Nunca"}</TableCell>
                    <TableCell className="text-gray-700">
                      {new Date(user.createdAt).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                          className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
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
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>Modifica los datos del usuario seleccionado.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-password">Nueva Contraseña (opcional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Dejar vacío para mantener actual"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Rol *</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id_rol} value={role.id_rol}>
                      {role.nombre}
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
            <Button onClick={handleEditUser} disabled={submitting}>
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
