"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { MapPin, Download, Search, Calendar, Users } from "lucide-react"

interface Address {
  id: string
  userId: string
  date: string
  address: string
  comuna: string
  lat: number
  lon: number
  classification: "residencial" | "comercial" | "industrial" | "publico"
  team?: string
  status: "visitado" | "pendiente" | "completado"
}

export default function DireccionesPage() {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [filteredAddresses, setFilteredAddresses] = useState<Address[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterClassification, setFilterClassification] = useState<string>("all")
  const [filterTeam, setFilterTeam] = useState<string>("all")

  useEffect(() => {
    // Simular carga de direcciones del usuario actual
    const mockAddresses: Address[] = [
      {
        id: "1",
        userId: user?.id || "1",
        date: "2024-01-15",
        address: "Av. Providencia 1234",
        comuna: "Providencia",
        lat: -33.4489,
        lon: -70.6693,
        classification: "comercial",
        team: "Equipo Norte",
        status: "completado",
      },
      {
        id: "2",
        userId: user?.id || "1",
        date: "2024-01-14",
        address: "Calle Los Leones 567",
        comuna: "Providencia",
        lat: -33.452,
        lon: -70.658,
        classification: "residencial",
        team: "Equipo Norte",
        status: "visitado",
      },
      {
        id: "3",
        userId: user?.id || "1",
        date: "2024-01-13",
        address: "Av. Las Condes 890",
        comuna: "Las Condes",
        lat: -33.415,
        lon: -70.547,
        classification: "comercial",
        status: "pendiente",
      },
      {
        id: "4",
        userId: user?.id || "1",
        date: "2024-01-12",
        address: "Calle Apoquindo 1122",
        comuna: "Las Condes",
        lat: -33.42,
        lon: -70.55,
        classification: "industrial",
        team: "Equipo Sur",
        status: "completado",
      },
    ]
    setAddresses(mockAddresses)
    setFilteredAddresses(mockAddresses)
  }, [user])

  useEffect(() => {
    const filtered = addresses.filter((address) => {
      const matchesSearch =
        address.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.comuna.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClassification = filterClassification === "all" || address.classification === filterClassification
      const matchesTeam = filterTeam === "all" || address.team === filterTeam

      return matchesSearch && matchesClassification && matchesTeam
    })

    setFilteredAddresses(filtered)
  }, [addresses, searchTerm, filterClassification, filterTeam])

  const exportToCSV = () => {
    const headers = ["Fecha", "Dirección", "Comuna", "Latitud", "Longitud", "Clasificación", "Equipo", "Estado"]
    const csvContent = [
      headers.join(","),
      ...filteredAddresses.map((addr) =>
        [
          addr.date,
          `"${addr.address}"`,
          addr.comuna,
          addr.lat,
          addr.lon,
          addr.classification,
          addr.team || "Sin equipo",
          addr.status,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `direcciones_${user?.name}_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getClassificationColor = (classification: Address["classification"]) => {
    switch (classification) {
      case "residencial":
        return "bg-green-100 text-green-800"
      case "comercial":
        return "bg-blue-100 text-blue-800"
      case "industrial":
        return "bg-orange-100 text-orange-800"
      case "publico":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: Address["status"]) => {
    switch (status) {
      case "completado":
        return "bg-green-100 text-green-800"
      case "visitado":
        return "bg-blue-100 text-blue-800"
      case "pendiente":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const uniqueTeams = [...new Set(addresses.map((addr) => addr.team).filter(Boolean))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mis Direcciones</h1>
          <p className="text-gray-600">Visualiza y exporta tus direcciones visitadas</p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por dirección o comuna..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Clasificación</label>
              <select
                value={filterClassification}
                onChange={(e) => setFilterClassification(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todas</option>
                <option value="residencial">Residencial</option>
                <option value="comercial">Comercial</option>
                <option value="industrial">Industrial</option>
                <option value="publico">Público</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Equipo</label>
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="all">Todos</option>
                {uniqueTeams.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
                <option value="sin-equipo">Sin equipo</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{filteredAddresses.length}</p>
                <p className="text-xs text-gray-500">Total Direcciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">
                  {filteredAddresses.filter((a) => a.status === "completado").length}
                </p>
                <p className="text-xs text-gray-500">Completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{filteredAddresses.filter((a) => a.team).length}</p>
                <p className="text-xs text-gray-500">Con Equipo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{filteredAddresses.filter((a) => a.status === "pendiente").length}</p>
                <p className="text-xs text-gray-500">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de direcciones */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Direcciones</CardTitle>
          <CardDescription>
            Mostrando {filteredAddresses.length} de {addresses.length} direcciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Fecha</th>
                  <th className="text-left p-2 font-medium">Dirección</th>
                  <th className="text-left p-2 font-medium">Comuna</th>
                  <th className="text-left p-2 font-medium">Coordenadas</th>
                  <th className="text-left p-2 font-medium">Clasificación</th>
                  <th className="text-left p-2 font-medium">Equipo</th>
                  <th className="text-left p-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredAddresses.map((address) => (
                  <tr key={address.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{new Date(address.date).toLocaleDateString("es-ES")}</td>
                    <td className="p-2">{address.address}</td>
                    <td className="p-2">{address.comuna}</td>
                    <td className="p-2 text-sm text-gray-600">
                      {address.lat.toFixed(4)}, {address.lon.toFixed(4)}
                    </td>
                    <td className="p-2">
                      <Badge className={getClassificationColor(address.classification)}>{address.classification}</Badge>
                    </td>
                    <td className="p-2">{address.team || "Sin equipo"}</td>
                    <td className="p-2">
                      <Badge className={getStatusColor(address.status)}>{address.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredAddresses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay direcciones</h3>
            <p className="text-gray-500">No se encontraron direcciones con los filtros aplicados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
