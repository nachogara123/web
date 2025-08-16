"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const mockUsers = [
  {
    id: "1",
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
      "equipos", // Added team management permission for admin
    ],
  },
  {
    id: "2",
    email: "supervisor@geovision.com",
    name: "Carlos Supervisor",
    role: "supervisor" as UserRole,
    department: "Operaciones",
    permissions: ["dashboard", "usuarios", "mapa-feedback", "optimizar-rutas", "reportes", "supervisor-panel"],
  },
  {
    id: "3",
    email: "ejecutivo@geovision.com",
    name: "Ana Ejecutiva",
    role: "ejecutivo" as UserRole,
    department: "Ventas",
    permissions: ["dashboard", "mapa-feedback", "mapa-dibujo", "ejecutivo-panel"],
  },
  {
    id: "4",
    email: "supervisor2@geovision.com",
    name: "María Supervisora",
    role: "supervisor" as UserRole,
    department: "Logística",
    permissions: ["dashboard", "usuarios", "mapa-feedback", "optimizar-rutas", "reportes", "supervisor-panel"],
  },
  {
    id: "5",
    email: "ejecutivo2@geovision.com",
    name: "Luis Ejecutivo",
    role: "ejecutivo" as UserRole,
    department: "Marketing",
    permissions: ["dashboard", "mapa-feedback", "mapa-dibujo", "ejecutivo-panel"],
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("geovision_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo authentication - password es "password" para todos
    if (password === "password") {
      const userData = mockUsers.find((u) => u.email === email)
      if (userData) {
        setUser(userData)
        localStorage.setItem("geovision_user", JSON.stringify(userData))
        return true
      }
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("geovision_user")
  }

  const hasPermission = (permission: string): boolean => {
    if (user?.role === "admin") {
      return true
    }
    return user?.permissions.includes(permission) || false
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
