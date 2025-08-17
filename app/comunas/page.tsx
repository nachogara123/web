"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Loader2, Plus, Edit, Trash2, Globe, Search, MapPin } from "lucide-react"
import { ComunaService } from "@/lib/services/comuna.service"

interface Comuna {
  id: number
  nombre: string
  codigo?: string
  region: string
  provincia: string
  activo: boolean
  createdAt: Date
  updatedAt: Date
}

const REGIONES_CHILE = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes",
]

export default function ComunasPage() {
  const [comunas, setComunas] = useState<Comuna[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingComuna, setEditingComuna] = useState<Comuna | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [regionFilter, setRegionFilter] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    region: "Arica y Parinacota", // Updated default value
    provincia: "",
    activo: true,
  })

  const comunaService = new ComunaService()

  const loadComunas = async () => {
    try {
      setIsLoading(true)
      const data = await comunaService.findAll()
      setComunas(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las comunas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadComunas()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingComuna) {
        await comunaService.update(editingComuna.id, formData)
        toast({
          title: "Éxito",
          description: "Comuna actualizada correctamente",
        })
      } else {
        await comunaService.create(formData)
        toast({
          title: "Éxito",
          description: "Comuna creada correctamente",
        })
      }

      setIsDialogOpen(false)
      setEditingComuna(null)
      setFormData({ nombre: "", codigo: "", region: "Arica y Parinacota", provincia: "", activo: true }) // Updated default value
      loadComunas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la comuna",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (comuna: Comuna) => {
    setEditingComuna(comuna)
    setFormData({
      nombre: comuna.nombre,
      codigo: comuna.codigo || "",
      region: comuna.region,
      provincia: comuna.provincia,
      activo: comuna.activo,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta comuna?")) {
      try {
        await comunaService.delete(id)
        toast({
          title: "Éxito",
          description: "Comuna eliminada correctamente",
        })
        loadComunas()
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la comuna",
          variant: "destructive",
        })
      }
    }
  }

  const filteredComunas = comunas.filter((comuna) => {
    const matchesSearch =
      comuna.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comuna.provincia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comuna.codigo && comuna.codigo.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRegion = !regionFilter || regionFilter === "all" || comuna.region === regionFilter
    return matchesSearch && matchesRegion
  })

  const stats = {
    total: comunas.length,
    activas: comunas.filter((c) => c.activo).length,
    regiones: new Set(comunas.map((c) => c.region)).size,
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="pt-16 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Comunas</h1>
                <p className="text-gray-600">Gestión de comunas de Chile</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingComuna(null)
                      setFormData({ nombre: "", codigo: "", region: "Arica y Parinacota", provincia: "", activo: true }) // Updated default value
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Comuna
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingComuna ? "Editar Comuna" : "Nueva Comuna"}</DialogTitle>
                    <DialogDescription>
                      {editingComuna ? "Modifica los datos de la comuna" : "Completa los datos de la nueva comuna"}
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
                        placeholder="ej: Santiago, Valparaíso, Concepción"
                      />
                    </div>
                    <div>
                      <Label htmlFor="codigo">Código</Label>
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                        placeholder="Código INE (opcional)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="region">Región *</Label>
                      <Select
                        value={formData.region}
                        onValueChange={(value) => setFormData({ ...formData, region: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una región" />
                        </SelectTrigger>
                        <SelectContent>
                          {REGIONES_CHILE.map((region) => (
                            <SelectItem key={region} value={region}>
                              {region}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="provincia">Provincia *</Label>
                      <Input
                        id="provincia"
                        value={formData.provincia}
                        onChange={(e) => setFormData({ ...formData, provincia: e.target.value })}
                        required
                        placeholder="ej: Santiago, Valparaíso, Concepción"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="activo"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                      />
                      <Label htmlFor="activo">Comuna activa</Label>
                    </div>
                    <DialogFooter>
                      <Button type="submit">{editingComuna ? "Actualizar" : "Crear"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Comunas</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Comunas Activas</p>
                      <p className="text-2xl font-bold">{stats.activas}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Regiones</p>
                      <p className="text-2xl font-bold">{stats.regiones}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Lista de Comunas
                </CardTitle>
                <CardDescription>
                  Total: {filteredComunas.length} comunas {regionFilter && `en ${regionFilter}`}
                </CardDescription>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar comunas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por región" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las regiones</SelectItem>
                      {REGIONES_CHILE.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        <TableHead>Código</TableHead>
                        <TableHead>Provincia</TableHead>
                        <TableHead>Región</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha Creación</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredComunas.map((comuna) => (
                        <TableRow key={comuna.id}>
                          <TableCell className="font-medium">{comuna.nombre}</TableCell>
                          <TableCell>{comuna.codigo || "-"}</TableCell>
                          <TableCell>{comuna.provincia}</TableCell>
                          <TableCell>{comuna.region}</TableCell>
                          <TableCell>
                            <Badge variant={comuna.activo ? "default" : "secondary"}>
                              {comuna.activo ? "Activa" : "Inactiva"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(comuna.createdAt).toLocaleDateString("es-ES")}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(comuna)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleDelete(comuna.id)}>
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
