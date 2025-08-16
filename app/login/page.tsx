"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Shield, Briefcase } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const demoUsers = [
    {
      email: "admin@geovision.com",
      name: "Administrador General",
      role: "admin",
      department: "Administración",
      icon: Shield,
    },
    {
      email: "supervisor@geovision.com",
      name: "Carlos Supervisor",
      role: "supervisor",
      department: "Operaciones",
      icon: User,
    },
    {
      email: "ejecutivo@geovision.com",
      name: "Ana Ejecutiva",
      role: "ejecutivo",
      department: "Ventas",
      icon: Briefcase,
    },
    {
      email: "supervisor2@geovision.com",
      name: "María Supervisora",
      role: "supervisor",
      department: "Logística",
      icon: User,
    },
    {
      email: "ejecutivo2@geovision.com",
      name: "Luis Ejecutivo",
      role: "ejecutivo",
      department: "Marketing",
      icon: Briefcase,
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await login(email, password)
      if (success) {
        router.push("/dashboard")
      } else {
        setError("Credenciales incorrectas. Usa cualquier email de la lista con contraseña: password")
      }
    } catch (err) {
      setError("Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  const fillCredentials = (userEmail: string) => {
    setEmail(userEmail)
    setPassword("password")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de Login */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">GeoVision</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Selecciona un usuario o escribe tu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar Sesión
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Usuarios de Prueba</CardTitle>
            <CardDescription>
              Haz clic en cualquier usuario para llenar automáticamente las credenciales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoUsers.map((user, index) => (
                <div
                  key={index}
                  onClick={() => fillCredentials(user.email)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-600"
                          : user.role === "supervisor"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-green-100 text-green-600"
                      }`}
                    >
                      <user.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <Badge
                          variant={
                            user.role === "admin" ? "destructive" : user.role === "supervisor" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.department}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Contraseña para todos:</strong> password
                <br />
                <strong>Permisos:</strong> Cada rol tiene acceso a diferentes páginas del sistema
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
