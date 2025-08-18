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
import { Loader2, Plus, Edit, Trash2, MessageSquare, Search } from "lucide-react"
import { CanalService } from "@/lib/services/canal.service"

interface Canal {
  id: number
  nombre: string
  descripcion?: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

export default function CanalesPage() {
  const [canales, setCanales] = useState<Canal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCanal, setEditingCanal] = useState<Canal | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    activo: true,
  })

  const canalService = new CanalService()

  const loadCanales = async () => {
    try {
      setIsLoading(true)
      const data = await canalService.findAll()
      setCanales(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los canales",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCanales()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCanal) {
        await canalService.update(editingCanal.id, formData)
        toast({
          title: "Éxito",
          description: "Canal actualizado correctamente",
        })
      } else {
        await canalService.create(formData)
        toast({
          title: "Éxito",
          description: "Canal creado correctamente",
        })
      }

      setIsDialogOpen(false)
      setEditingCanal(null)
      setFormData({ nombre: "", descripcion: "", activo: true })
      loadCanales()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el canal",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (canal: Canal) => {
    setEditingCanal(canal)
    setFormData({
      nombre: canal.nombre,
      descripcion: canal.descripcion || "",
      activo: canal.activo,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este canal?")) {
      try {
        await canalService.delete(id)
        toast({
          title: "Éxito",
          description: "Canal eliminado correctamente",
        })
        loadCanales()
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el canal",
          variant: "destructive",
        })
      }
    }
  }

  const filteredCanales = canales.filter(
    (canal) =>
      canal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (canal.descripcion && canal.descripcion.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="pt-16 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Canales</h1>
                <p className="text-gray-600">Gestión de canales de comunicación</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingCanal(null)
                      setFormData({ nombre: "", descripcion: "", activo: true })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Canal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCanal ? "Editar Canal" : "Nuevo Canal"}</DialogTitle>
                    <DialogDescription>
                      {editingCanal ? "Modifica los datos del canal" : "Completa los datos del nuevo canal"}
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
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="activo"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      />
                      <Label htmlFor="activo">Canal activo</Label>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{editingCanal ? "Actualizar" : "Crear"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Lista de Canales
                </CardTitle>
                <CardDescription>Total: {canales.length} canales registrados</CardDescription>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar canales..."
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
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Creación</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCanales.map((canal) => (
                        <TableRow key={canal.id}>
                          <TableCell className="font-medium">{canal.nombre}</TableCell>
                          <TableCell>{canal.descripcion || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={canal.activo ? "default" : "secondary"}>
                              {canal.activo ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(canal.createdAt).toLocaleDateString("es-ES")}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(canal)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(canal.id)}>
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
