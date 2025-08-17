"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { MessageCircle, Plus, Calendar, MapPin } from "lucide-react"

interface Comment {
  id: string
  userId: string
  userName: string
  content: string
  location?: {
    lat: number
    lng: number
    address: string
  }
  date: string
  status: "pendiente" | "revisado" | "resuelto"
  category: "ruta" | "equipo" | "general" | "incidencia"
}

export default function ComentariosPage() {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Comment["category"]>("general")
  const [isAddingComment, setIsAddingComment] = useState(false)

  useEffect(() => {
    // Simular carga de comentarios del usuario actual
    const mockComments: Comment[] = [
      {
        id: "1",
        userId: user?.id || "1",
        userName: user?.name || "Usuario",
        content: "La ruta del sector norte presenta dificultades de acceso debido a construcción",
        location: {
          lat: -33.4489,
          lng: -70.6693,
          address: "Av. Providencia 1234, Providencia",
        },
        date: "2024-01-15T10:30:00Z",
        status: "revisado",
        category: "ruta",
      },
      {
        id: "2",
        userId: user?.id || "1",
        userName: user?.name || "Usuario",
        content: "Equipo GPS presenta fallas intermitentes",
        date: "2024-01-14T14:20:00Z",
        status: "pendiente",
        category: "equipo",
      },
      {
        id: "3",
        userId: user?.id || "1",
        userName: user?.name || "Usuario",
        content: "Sugerencia: implementar notificaciones push para alertas urgentes",
        date: "2024-01-13T09:15:00Z",
        status: "resuelto",
        category: "general",
      },
    ]
    setComments(mockComments)
  }, [user])

  const handleAddComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      userId: user?.id || "1",
      userName: user?.name || "Usuario",
      content: newComment,
      date: new Date().toISOString(),
      status: "pendiente",
      category: selectedCategory,
    }

    setComments([comment, ...comments])
    setNewComment("")
    setIsAddingComment(false)
  }

  const getStatusColor = (status: Comment["status"]) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      case "revisado":
        return "bg-blue-100 text-blue-800"
      case "resuelto":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: Comment["category"]) => {
    switch (category) {
      case "ruta":
        return "bg-purple-100 text-purple-800"
      case "equipo":
        return "bg-orange-100 text-orange-800"
      case "general":
        return "bg-blue-100 text-blue-800"
      case "incidencia":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Comentarios</h1>
          <p className="text-gray-600">Gestiona tus comentarios y sugerencias</p>
        </div>
        <Button onClick={() => setIsAddingComment(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Comentario
        </Button>
      </div>

      {isAddingComment && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar Nuevo Comentario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Categoría</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Comment["category"])}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="general">General</option>
                <option value="ruta">Ruta</option>
                <option value="equipo">Equipo</option>
                <option value="incidencia">Incidencia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Comentario</label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe tu comentario aquí..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddComment}>Guardar</Button>
              <Button variant="outline" onClick={() => setIsAddingComment(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {comments.map((comment) => (
          <Card key={comment.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">{comment.userName}</span>
                  <Badge className={getCategoryColor(comment.category)}>{comment.category}</Badge>
                  <Badge className={getStatusColor(comment.status)}>{comment.status}</Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {new Date(comment.date).toLocaleDateString("es-ES")}
                </div>
              </div>

              <p className="text-gray-700 mb-3">{comment.content}</p>

              {comment.location && (
                <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-50 p-2 rounded">
                  <MapPin className="h-4 w-4" />
                  <span>{comment.location.address}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {comments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay comentarios</h3>
            <p className="text-gray-500">Aún no has agregado ningún comentario.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
