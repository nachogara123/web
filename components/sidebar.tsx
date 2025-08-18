"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { PermissionGuard } from "@/components/permission-guard"
import {
  LayoutDashboard,
  Users,
  Route,
  Download,
  Menu,
  LogOut,
  ChevronLeft,
  Edit3,
  MessageSquare,
  UserCheck,
  Briefcase,
  BarChart3,
  Settings,
  MessageCircle,
  MapPin,
  Shield,
  Tags,
  MapPinned,
  Globe,
  FileText,
  Calendar,
  Search,
  MapPinIcon,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const getNavigationForRole = (role: string) => {
  const baseNavigation = {
    admin: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard" },
      { name: "Usuarios", href: "/usuarios", icon: Users, permission: "usuarios" },
      { name: "Roles", href: "/roles", icon: Shield, permission: "roles" },
      { name: "Equipos", href: "/equipos", icon: Users, permission: "equipos" },
      { name: "Planes de Trabajo", href: "/planes-trabajo", icon: Calendar, permission: "planes-trabajo" },
      { name: "Direcciones", href: "/direcciones", icon: MapPin, permission: "direcciones" },
      { name: "Zonas Geográficas", href: "/zonas-geograficas", icon: MapPinned, permission: "zonas-geograficas" },
      { name: "Canales", href: "/canales", icon: MessageSquare, permission: "canales" },
      { name: "Clasificaciones", href: "/clasificaciones", icon: Tags, permission: "clasificaciones" },
      { name: "Estados Direcciones", href: "/estados-direcciones", icon: FileText, permission: "estados-direcciones" },
      { name: "Comunas", href: "/comunas", icon: Globe, permission: "comunas" },
      { name: "Mapa Feedback", href: "/mapa-feedback", icon: MessageSquare, permission: "mapa-feedback" },
      { name: "Mapa Dibujo", href: "/mapa-dibujo", icon: Edit3, permission: "mapa-dibujo" },
      { name: "Optimizar Rutas", href: "/optimizar-rutas", icon: Route, permission: "optimizar-rutas" },
      { name: "Exportar", href: "/exportar", icon: Download, permission: "exportar" },
      { name: "Reportes", href: "/reportes", icon: BarChart3, permission: "reportes" },
      { name: "Configuración", href: "/configuracion", icon: Settings, permission: "configuracion" },
    ],
    supervisor: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard" },
      { name: "Panel Supervisor", href: "/supervisor", icon: UserCheck, permission: "supervisor-panel" },
      { name: "Usuarios", href: "/usuarios", icon: Users, permission: "usuarios" },
      { name: "Equipos", href: "/equipos", icon: Users, permission: "equipos" },
      { name: "Planes de Trabajo", href: "/planes-trabajo", icon: Calendar, permission: "planes-trabajo" },
      { name: "Direcciones", href: "/direcciones", icon: MapPin, permission: "direcciones" },
      { name: "Mapa Feedback", href: "/mapa-feedback", icon: MessageSquare, permission: "mapa-feedback" },
      { name: "Optimizar Rutas", href: "/optimizar-rutas", icon: Route, permission: "optimizar-rutas" },
      { name: "Reportes", href: "/reportes", icon: BarChart3, permission: "reportes" },
    ],
    ejecutivo: [
      { name: "Panel Ejecutivo", href: "/ejecutivo", icon: Briefcase, permission: "ejecutivo-panel" },
      { name: "Mis Comentarios", href: "/comentarios", icon: MessageCircle, permission: "comentarios" },
      { name: "Mis Direcciones", href: "/direcciones", icon: MapPin, permission: "direcciones" },
      { name: "Mapa Feedback", href: "/mapa-feedback", icon: MessageSquare, permission: "mapa-feedback" },
    ],
  }

  return baseNavigation[role as keyof typeof baseNavigation] || []
}

function GlobalSearchBar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSearch = async (value: string) => {
    setSearchTerm(value)
    if (value.length >= 2) {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`)
        const data = await response.json()
        setSuggestions(data.suggestions || [])
        setShowSuggestions(true)
      } catch (error) {
        console.log("[v0] Error en búsqueda:", error)
        setSuggestions([])
      }
    } else {
      setShowSuggestions(false)
    }
  }

  return (
    <div className="relative flex-1 max-w-md mx-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar direcciones, comunas, CTOs..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => {
                setSearchTerm(suggestion.text)
                setShowSuggestions(false)
                // Navegar a la dirección o aplicar filtro
                if (suggestion.type === "direccion") {
                  window.location.href = `/mapa-feedback?direccion=${suggestion.id}`
                }
              }}
            >
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="text-sm font-medium">{suggestion.text}</div>
                  <div className="text-xs text-gray-500">
                    {suggestion.type} • {suggestion.comuna}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LocationTracker() {
  const [isTracking, setIsTracking] = useState(false)
  const { user } = useAuth()

  const trackLocation = async () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada en este navegador")
      return
    }

    setIsTracking(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const response = await fetch("/api/ubicaciones-equipo", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              usuario_id: user?.id,
              latitud: latitude,
              longitud: longitude,
              timestamp: new Date().toISOString(),
            }),
          })

          if (response.ok) {
            console.log("[v0] Ubicación guardada:", { latitude, longitude })
            alert("Ubicación guardada correctamente")
          } else {
            throw new Error("Error al guardar ubicación")
          }
        } catch (error) {
          console.log("[v0] Error guardando ubicación:", error)
          alert("Error al guardar la ubicación")
        } finally {
          setIsTracking(false)
        }
      },
      (error) => {
        console.log("[v0] Error de geolocalización:", error)
        alert("Error al obtener la ubicación")
        setIsTracking(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={trackLocation}
      disabled={isTracking}
      className="flex items-center gap-2 bg-transparent"
    >
      <MapPinIcon className="h-4 w-4" />
      {isTracking ? "Obteniendo..." : "Mi Ubicación"}
    </Button>
  )
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { logout, user, adminMode, setAdminMode, isAdminModeActive } = useAuth()

  const currentRole = user?.role === "admin" && adminMode ? adminMode : user?.role
  const navigation = currentRole ? getNavigationForRole(currentRole) : []

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center px-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="ml-4 text-xl font-bold text-gray-900">GeoVision</h1>

        <GlobalSearchBar />

        <div className="flex items-center gap-4">
          <LocationTracker />

          {user && (
            <>
              {user.role === "admin" && (
                <Select value={adminMode || "admin"} onValueChange={(value) => setAdminMode(value as any)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Modo Admin</SelectItem>
                    <SelectItem value="supervisor">Modo Supervisor</SelectItem>
                    <SelectItem value="ejecutivo">Modo Ejecutivo</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <div className="text-sm text-gray-600">
                <span className="capitalize font-medium">{isAdminModeActive ? `${adminMode} (Admin)` : user.role}</span>
                {user.department && <span className="ml-2 text-gray-400">• {user.department}</span>}
              </div>
            </>
          )}
        </div>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />}

      <div
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 shadow-xl",
          isCollapsed ? "w-16" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-12 items-center justify-end px-4 border-b border-gray-200">
            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)}>
              <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <PermissionGuard key={item.name} permission={item.permission}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-blue-50 hover:text-blue-700",
                      isActive ? "bg-blue-100 text-blue-700 border border-blue-200" : "text-gray-700",
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                </PermissionGuard>
              )
            })}
          </nav>

          {/* User info and logout */}
          <div className="border-t border-gray-200 p-4">
            {!isCollapsed && user && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <p className="text-xs text-blue-600 capitalize font-medium">
                  {isAdminModeActive ? `${adminMode} (Admin)` : user.role}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size={isCollapsed ? "icon" : "sm"}
              className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Cerrar Sesión</span>}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
