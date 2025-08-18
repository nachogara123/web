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
import { Loader2, Plus, Edit, Trash2, FileText, Search } from "lucide-react"
import { EstadoDireccionService } from "@/lib/services/estado-direccion.service"

interface EstadoDireccion {
  id: number
  nombre: string
  descripcion?: string
  color?: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

export default function EstadosDireccionesPage() {
  const [estados, setEstados] = useState<EstadoDireccion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEstado, setEditingEstado] = useState<EstadoDireccion | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    color: "#10B981",
    activo: true,
  })

  const estadoService = new EstadoDireccionService()

  const loadEstados = async () => {
    try {
      setIsLoading(true)
      const data = await estadoService.findAll()
      setEstados(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los estados de direcciones",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEstados()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingEstado) {
        await estadoService.update(editingEstado.id, formData)
        toast({
          title: "Éxito",
          description: "Estado actualizado correctamente",
        })
      } else {
        await estadoService.create(formData)
        toast({
          title: "Éxito",
          description: "Estado creado correctamente",
        })
      }

      setIsDialogOpen(false)
      setEditingEstado(null)
      setFormData({ nombre: "", descripcion: "", color: "#10B981", activo: true })
      loadEstados()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el estado",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (estado: EstadoDireccion) => {
    setEditingEstado(estado)
    setFormData({
      nombre: estado.nombre,
      descripcion: estado.descripcion || "",
      color: estado.color || "#10B981",
      activo: estado.activo,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este estado?")) {
      try {
        await estadoService.delete(id)
        toast({
          title: "Éxito",
          description: "Estado eliminado correctamente",
        })
        loadEstados()
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el estado",
          variant: "destructive",
        })
      }
    }
  }

  const filteredEstados = estados.filter(
    (estado) =>
      estado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (estado.descripcion && estado.descripcion.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="pt-16 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Estados de Direcciones</h1>
                <p className="text-gray-600">Gestión de estados para el seguimiento de direcciones</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingEstado(null)
                      setFormData({ nombre: "", descripcion: "", color: "#10B981", activo: true })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Estado
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingEstado ? "Editar Estado" : "Nuevo Estado"}</DialogTitle>
                    <DialogDescription>
                      {editingEstado ? "Modifica los datos del estado" : "Completa los datos del nuevo estado"}
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
                        placeholder="ej: Pendiente, En Proceso, Completado"
                      />
                    </div>
                    <div>
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        rows={3}
                        placeholder="Describe cuándo se usa este estado"
                      />
                    </div>
                    <div>
                      <Label htmlFor="color">Color de Estado</Label>
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
                          placeholder="#10B981"
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
                      <Label htmlFor="activo">Estado activo</Label>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{editingEstado ? "Actualizar" : "Crear"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Lista de Estados
                </CardTitle>
                <CardDescription>Total: {estados.length} estados registrados</CardDescription>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar estados..."
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
                      {filteredEstados.map((estado) => (
                        <TableRow key={estado.id}>
                          <TableCell className="font-medium">{estado.nombre}</TableCell>
                          <TableCell>{estado.descripcion || "-"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: estado.color }} />
                              <span className="text-sm text-gray-600">{estado.color}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={estado.activo ? "default" : "secondary"}>
                              {estado.activo ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(estado.createdAt).toLocaleDateString("es-ES")}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(estado)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(estado.id)}>
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
