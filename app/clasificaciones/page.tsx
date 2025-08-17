"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { Loader2, Plus, Edit, Trash2, Tags, Search } from "lucide-react"
import { ClasificacionService } from "@/lib/services/clasificacion.service"

interface Clasificacion {
  id: number
  nombre: string
  descripcion?: string
  color?: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

export default function ClasificacionesPage() {
  const [clasificaciones, setClasificaciones] = useState<Clasificacion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClasificacion, setEditingClasificacion] = useState<Clasificacion | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    color: "#3B82F6",
    activo: true,
  })

  const clasificacionService = new ClasificacionService()

  const loadClasificaciones = async () => {
    try {
      setIsLoading(true)
      const data = await clasificacionService.findAll()
      setClasificaciones(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las clasificaciones",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadClasificaciones()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingClasificacion) {
        await clasificacionService.update(editingClasificacion.id, formData)
        toast({
          title: "Éxito",
          description: "Clasificación actualizada correctamente",
        })
      } else {
        await clasificacionService.create(formData)
        toast({
          title: "Éxito",
          description: "Clasificación creada correctamente",
        })
      }

      setIsDialogOpen(false)
      setEditingClasificacion(null)
      setFormData({ nombre: "", descripcion: "", color: "#3B82F6", activo: true })
      loadClasificaciones()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la clasificación",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (clasificacion: Clasificacion) => {
    setEditingClasificacion(clasificacion)
    setFormData({
      nombre: clasificacion.nombre,
      descripcion: clasificacion.descripcion || "",
      color: clasificacion.color || "#3B82F6",
      activo: clasificacion.activo,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta clasificación?")) {
      try {
        await clasificacionService.delete(id)
        toast({
          title: "Éxito",
          description: "Clasificación eliminada correctamente",
        })
        loadClasificaciones()
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la clasificación",
          variant: "destructive",
        })
      }
    }
  }

  const filteredClasificaciones = clasificaciones.filter(
    (clasificacion) =>
      clasificacion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (clasificacion.descripcion && clasificacion.descripcion.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="pt-16 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Clasificaciones</h1>
                <p className="text-gray-600">Gestión de clasificaciones de direcciones</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingClasificacion(null)
                      setFormData({ nombre: "", descripcion: "", color: "#3B82F6", activo: true })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Clasificación
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingClasificacion ? "Editar Clasificación" : "Nueva Clasificación"}</DialogTitle>
                    <DialogDescription>
                      {editingClasificacion
                        ? "Modifica los datos de la clasificación"
                        : "Completa los datos de la nueva clasificación"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="nombre">Nombre *</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="color">Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="activo"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      />
                      <Label htmlFor="activo">Clasificación activa</Label>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{editingClasificacion ? "Actualizar" : "Crear"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tags className="h-5 w-5" />
                  Lista de Clasificaciones
                </CardTitle>
                <CardDescription>Total: {clasificaciones.length} clasificaciones registradas</CardDescription>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar clasificaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Creación</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClasificaciones.map((clasificacion) => (
                        <TableRow key={clasificacion.id}>
                          <TableCell className="font-medium">{clasificacion.nombre}</TableCell>
                          <TableCell>{clasificacion.descripcion || "-"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: clasificacion.color }}
                              />
                              <span className="text-sm text-gray-600">{clasificacion.color}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={clasificacion.activo ? "default" : "secondary"}>
                              {clasificacion.activo ? "Activa" : "Inactiva"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(clasificacion.createdAt).toLocaleDateString("es-ES")}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(clasificacion)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(clasificacion.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
