"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MessageCircle, Plus, Calendar, Edit, Trash2, Search, Filter } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ComentarioPredefinido {
  id_coment?: string
  comentario: string
  tipo_feedback: string
  categoria: string
  creado_por?: string
  created_at?: string
  resuelto?: boolean
  prioridad?: number
}

export default function ComentariosPage() {
  const [comentarios, setComentarios] = useState<ComentarioPredefinido[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingComentario, setEditingComentario] = useState<ComentarioPredefinido | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("all")
  const [filterCategoria, setFilterCategoria] = useState<string>("all")

  const [formData, setFormData] = useState<ComentarioPredefinido>({
    comentario: "",
    tipo_feedback: "informacion",
    categoria: "otros",
    prioridad: 1,
    resuelto: false,
  })

  const tiposFeedback = [
    { value: "problema", label: "Problema" },
    { value: "sugerencia", label: "Sugerencia" },
    { value: "informacion", label: "Información" },
    { value: "mantenimiento", label: "Mantenimiento" },
    { value: "urgente", label: "Urgente" },
  ]

  const categorias = [
    { value: "accesibilidad", label: "Accesibilidad" },
    { value: "conectividad", label: "Conectividad" },
    { value: "estado_fisico", label: "Estado Físico" },
    { value: "señalizacion", label: "Señalización" },
    { value: "trafico", label: "Tráfico" },
    { value: "seguridad", label: "Seguridad" },
    { value: "infraestructura", label: "Infraestructura" },
    { value: "otros", label: "Otros" },
  ]

  const fetchComentarios = async () => {
    try {
      setLoading(true)
      console.log("[v0] Obteniendo comentarios predefinidos para mantenedor...")

      const response = await fetch("/api/comentarios-predefinidos")
      const result = await response.json()

      if (result.success) {
        console.log(`[v0] Comentarios predefinidos obtenidos: ${result.data.length}`)
        setComentarios(result.data)
        toast({
          title: "Comentarios cargados",
          description: `Se cargaron ${result.data.length} comentarios predefinidos.`,
        })
      } else {
        throw new Error(result.message || "Error al cargar comentarios")
      }
    } catch (error) {
      console.error("[v0] Error obteniendo comentarios:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudieron cargar los comentarios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.comentario.trim()) {
      toast({
        title: "Error",
        description: "El comentario es requerido",
        variant: "destructive",
      })
      return
    }

    try {
      const method = editingComentario ? "PUT" : "POST"
      const url = editingComentario
        ? `/api/comentarios-predefinidos/${editingComentario.id_coment}`
        : "/api/comentarios-predefinidos"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          creado_por: "admin-usuario",
        }),
      })

      if (response.ok) {
        await fetchComentarios()
        setIsDialogOpen(false)
        resetForm()

        toast({
          title: editingComentario ? "Comentario actualizado" : "Comentario creado",
          description: "El comentario predefinido ha sido guardado exitosamente.",
        })
      } else {
        throw new Error("Error al guardar comentario")
      }
    } catch (error) {
      console.error("[v0] Error guardando comentario:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el comentario. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este comentario predefinido?")) {
      return
    }

    try {
      const response = await fetch(`/api/comentarios-predefinidos/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchComentarios()
        toast({
          title: "Comentario eliminado",
          description: "El comentario predefinido ha sido eliminado exitosamente.",
        })
      } else {
        throw new Error("Error al eliminar comentario")
      }
    } catch (error) {
      console.error("[v0] Error eliminando comentario:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el comentario. Intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      comentario: "",
      tipo_feedback: "informacion",
      categoria: "otros",
      prioridad: 1,
      resuelto: false,
    })
    setEditingComentario(null)
  }

  const handleEdit = (comentario: ComentarioPredefinido) => {
    setFormData(comentario)
    setEditingComentario(comentario)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const filteredComentarios = comentarios.filter((comentario) => {
    const matchesSearch = searchTerm === "" || comentario.comentario.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTipo = filterTipo === "all" || comentario.tipo_feedback === filterTipo
    const matchesCategoria = filterCategoria === "all" || comentario.categoria === filterCategoria

    return matchesSearch && matchesTipo && matchesCategoria
  })

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "problema":
        return "bg-red-100 text-red-800"
      case "sugerencia":
        return "bg-blue-100 text-blue-800"
      case "informacion":
        return "bg-green-100 text-green-800"
      case "mantenimiento":
        return "bg-yellow-100 text-yellow-800"
      case "urgente":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case "accesibilidad":
        return "bg-blue-100 text-blue-800"
      case "conectividad":
        return "bg-green-100 text-green-800"
      case "estado_fisico":
        return "bg-orange-100 text-orange-800"
      case "señalizacion":
        return "bg-purple-100 text-purple-800"
      case "trafico":
        return "bg-red-100 text-red-800"
      case "seguridad":
        return "bg-yellow-100 text-yellow-800"
      case "infraestructura":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  useEffect(() => {
    fetchComentarios()
  }, [])

  return (
    <div className="pt-16 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mantenedor de Comentarios</h1>
          <p className="text-gray-600">Gestiona comentarios predefinidos para feedback rápido</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Comentario
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar comentarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Feedback</Label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {tiposFeedback.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.value} value={categoria.value}>
                      {categoria.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando {filteredComentarios.length} de {comentarios.length} comentarios
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("")
                setFilterTipo("all")
                setFilterCategoria("all")
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Cargando comentarios...</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredComentarios.map((comentario) => (
            <Card key={comentario.id_coment}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <Badge className={getTipoColor(comentario.tipo_feedback)}>{comentario.tipo_feedback}</Badge>
                    <Badge className={getCategoriaColor(comentario.categoria)}>{comentario.categoria}</Badge>
                    {comentario.prioridad && comentario.prioridad > 1 && (
                      <Badge variant="outline">Prioridad: {comentario.prioridad}</Badge>
                    )}
                    {comentario.resuelto && <Badge className="bg-green-100 text-green-800">Resuelto</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    {comentario.created_at && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {new Date(comentario.created_at).toLocaleDateString("es-ES")}
                      </div>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(comentario)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comentario.id_coment!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-gray-700 mb-2">{comentario.comentario}</p>

                {comentario.creado_por && <p className="text-xs text-gray-500">Creado por: {comentario.creado_por}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredComentarios.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay comentarios</h3>
            <p className="text-gray-500">
              {searchTerm || filterTipo !== "all" || filterCategoria !== "all"
                ? "No se encontraron comentarios con los filtros aplicados."
                : "Aún no hay comentarios predefinidos. Crea el primero."}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingComentario ? "Editar Comentario" : "Nuevo Comentario"}</DialogTitle>
            <DialogDescription>
              {editingComentario
                ? "Modifica los datos del comentario predefinido"
                : "Crea un nuevo comentario predefinido para feedback rápido"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Comentario *</Label>
              <Input
                value={formData.comentario}
                onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                placeholder="Escribe el comentario predefinido..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Feedback</Label>
                <Select
                  value={formData.tipo_feedback}
                  onValueChange={(value) => setFormData({ ...formData, tipo_feedback: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposFeedback.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.value} value={categoria.value}>
                        {categoria.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prioridad</Label>
                <Select
                  value={formData.prioridad?.toString() || "1"}
                  onValueChange={(value) => setFormData({ ...formData, prioridad: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Baja (1)</SelectItem>
                    <SelectItem value="2">Media (2)</SelectItem>
                    <SelectItem value="3">Alta (3)</SelectItem>
                    <SelectItem value="4">Crítica (4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estado</Label>
                <Select
                  value={formData.resuelto ? "true" : "false"}
                  onValueChange={(value) => setFormData({ ...formData, resuelto: value === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Pendiente</SelectItem>
                    <SelectItem value="true">Resuelto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit} className="flex-1">
                {editingComentario ? "Actualizar" : "Crear"}
              </Button>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
