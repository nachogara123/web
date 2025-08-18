"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { isValidUUID } from "@/lib/utils/uuid"

export type UserRole = "admin" | "supervisor" | "ejecutivo"

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department?: string
  permissions: string[]
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  hasPermission: (permission: string) => boolean
  adminMode: UserRole | null
  setAdminMode: (mode: UserRole) => void
  isAdminModeActive: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const mockUsers = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    email: "admin@geovision.com",
    name: "Administrador General",
    role: "admin" as UserRole,
    department: "Administración",
    permissions: [
      "dashboard",
      "usuarios",
      "mapa-feedback",
      "mapa-dibujo",
      "optimizar-rutas",
      "exportar",
      "reportes",
      "configuracion",
      "supervisor-panel",
      "ejecutivo-panel",
      "equipos",
      "comentarios",
      "direcciones",
    ],
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    email: "supervisor@geovision.com",
    name: "Carlos Supervisor",
    role: "supervisor" as UserRole,
    department: "Operaciones",
    permissions: [
      "dashboard",
      "usuarios",
      "mapa-feedback",
      "optimizar-rutas",
      "reportes",
      "supervisor-panel",
      "equipos",
    ],
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    email: "ejecutivo@geovision.com",
    name: "Ana Ejecutiva",
    role: "ejecutivo" as UserRole,
    department: "Ventas",
    permissions: ["dashboard", "mapa-feedback", "mapa-dibujo", "ejecutivo-panel", "comentarios", "direcciones"],
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    email: "supervisor2@geovision.com",
    name: "María Supervisora",
    role: "supervisor" as UserRole,
    department: "Logística",
    permissions: [
      "dashboard",
      "usuarios",
      "mapa-feedback",
      "optimizar-rutas",
      "reportes",
      "supervisor-panel",
      "equipos",
    ],
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    email: "ejecutivo2@geovision.com",
    name: "Luis Ejecutivo",
    role: "ejecutivo" as UserRole,
    department: "Marketing",
    permissions: ["dashboard", "mapa-feedback", "mapa-dibujo", "ejecutivo-panel", "comentarios", "direcciones"],
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [adminMode, setAdminModeState] = useState<UserRole | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("geovision_user")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        if (userData && isValidUUID(userData.id)) {
          setUser(userData)
          if (userData.role === "admin") {
            setAdminModeState("admin")
          }
        } else {
          console.warn("[v0] Usuario con UUID inválido en localStorage, limpiando...")
          localStorage.removeItem("geovision_user")
        }
      } catch (error) {
        console.error("[v0] Error parseando usuario de localStorage:", error)
        localStorage.removeItem("geovision_user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Intentar autenticación con API real
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const { user: userData } = await response.json()
        setUser(userData)
        localStorage.setItem("geovision_user", JSON.stringify(userData))
        if (userData.role === "admin") {
          setAdminModeState("admin")
        }
        console.log("[v0] Login exitoso con base de datos real")
        return true
      }

      // Fallback a usuarios mock si la API falla
      console.log("[v0] API falló, usando usuarios mock como fallback")
      if (password === "password") {
        const userData = mockUsers.find((u) => u.email === email)
        if (userData) {
          setUser(userData)
          localStorage.setItem("geovision_user", JSON.stringify(userData))
          if (userData.role === "admin") {
            setAdminModeState("admin")
          }
          return true
        }
      }

      return false
    } catch (error) {
      console.error("[v0] Error en login:", error)

      // Fallback a usuarios mock en caso de error
      if (password === "password") {
        const userData = mockUsers.find((u) => u.email === email)
        if (userData) {
          setUser(userData)
          localStorage.setItem("geovision_user", JSON.stringify(userData))
          if (userData.role === "admin") {
            setAdminModeState("admin")
          }
          return true
        }
      }

      return false
    }
  }

  const logout = () => {
    setUser(null)
    setAdminModeState(null)
    localStorage.removeItem("geovision_user")
  }

  const setAdminMode = (mode: UserRole) => {
    if (user?.role === "admin") {
      setAdminModeState(mode)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (user?.role === "admin") {
      return true
    }
    return user?.permissions.includes(permission) || false
  }

  const isAdminModeActive = user?.role === "admin" && adminMode !== null

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading,
        hasPermission,
        adminMode,
        setAdminMode,
        isAdminModeActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
