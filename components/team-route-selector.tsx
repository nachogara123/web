"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet-draw"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Users, AlertTriangle } from "lucide-react"

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface TeamRoute {
  id: string
  teamName: string
  supervisorName: string
  date: string
  mainRoute: [number, number][]
  backupRoute?: [number, number][]
  meetingPoint: [number, number]
  color: string
}

interface TeamRouteSelectorProps {
  existingRoutes: TeamRoute[]
  onRouteComplete: (routeData: {
    mainRoute: [number, number][]
    backupRoute: [number, number][]
    meetingPoint: [number, number]
    mainRouteName: string
    backupRouteName: string
    meetingPointName: string
  }) => void
  teamName: string
  date: string
}

// Iconos personalizados
const createMeetingPointIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #10b981;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
      ">
        📍
      </div>
    `,
    className: "meeting-point-marker",
    iconSize: [35, 35],
    iconAnchor: [17, 17],
  })
}

function RouteDrawControl({
  onMainRouteCreate,
  onBackupRouteCreate,
  onMeetingPointCreate,
  currentMode,
}: {
  onMainRouteCreate: (coordinates: [number, number][]) => void
  onBackupRouteCreate: (coordinates: [number, number][]) => void
  onMeetingPointCreate: (coordinates: [number, number]) => void
  currentMode: "main" | "backup" | "meeting" | null
}) {
  const map = useMap()
  const drawControlRef = useRef<L.Control.Draw | null>(null)

  useEffect(() => {
    if (!map) return

    const drawnItems = new L.FeatureGroup()
    map.addLayer(drawnItems)

    if (currentMode && !drawControlRef.current) {
      const drawOptions: any = {
        edit: { featureGroup: drawnItems },
        draw: {
          polygon: false,
          circle: false,
          rectangle: false,
          circlemarker: false,
          polyline: false,
          marker: false,
        },
      }

      if (currentMode === "main" || currentMode === "backup") {
        drawOptions.draw.polyline = {
          shapeOptions: {
            color: currentMode === "main" ? "#3b82f6" : "#f59e0b",
            weight: 4,
          },
        }
      } else if (currentMode === "meeting") {
        drawOptions.draw.marker = true
      }

      const drawControl = new L.Control.Draw(drawOptions)
      drawControlRef.current = drawControl
      map.addControl(drawControl)

      map.on(L.Draw.Event.CREATED, (event: any) => {
        const { layer, layerType } = event
        drawnItems.addLayer(layer)

        if (layerType === "polyline") {
          const coordinates = layer.getLatLngs().map((latlng: L.LatLng) => [latlng.lat, latlng.lng])
          if (currentMode === "main") {
            onMainRouteCreate(coordinates)
          } else if (currentMode === "backup") {
            onBackupRouteCreate(coordinates)
          }
        } else if (layerType === "marker") {
          const coordinates: [number, number] = [layer.getLatLng().lat, layer.getLatLng().lng]
          onMeetingPointCreate(coordinates)
        }
      })
    } else if (!currentMode && drawControlRef.current) {
      map.removeControl(drawControlRef.current)
      drawControlRef.current = null
    }

    return () => {
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current)
        drawControlRef.current = null
      }
    }
  }, [map, currentMode, onMainRouteCreate, onBackupRouteCreate, onMeetingPointCreate])

  return null
}

export default function TeamRouteSelector({ existingRoutes, onRouteComplete, teamName, date }: TeamRouteSelectorProps) {
  const [currentMode, setCurrentMode] = useState<"main" | "backup" | "meeting" | null>(null)
  const [mainRoute, setMainRoute] = useState<[number, number][]>([])
  const [backupRoute, setBackupRoute] = useState<[number, number][]>([])
  const [meetingPoint, setMeetingPoint] = useState<[number, number] | null>(null)
  const [mainRouteName, setMainRouteName] = useState("")
  const [backupRouteName, setBackupRouteName] = useState("")
  const [meetingPointName, setMeetingPointName] = useState("")

  // Filtrar rutas del mismo día
  const sameDayRoutes = existingRoutes.filter((route) => route.date === date)

  const handleComplete = () => {
    if (
      mainRoute.length > 0 &&
      backupRoute.length > 0 &&
      meetingPoint &&
      mainRouteName &&
      backupRouteName &&
      meetingPointName
    ) {
      onRouteComplete({
        mainRoute,
        backupRoute,
        meetingPoint,
        mainRouteName,
        backupRouteName,
        meetingPointName,
      })
    }
  }

  const isComplete =
    mainRoute.length > 0 &&
    backupRoute.length > 0 &&
    meetingPoint &&
    mainRouteName &&
    backupRouteName &&
    meetingPointName

  return (
    <div className="space-y-6">
      {/* Información del equipo */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Configurando Ruta para: {teamName}</h3>
        </div>
        <p className="text-blue-700 text-sm">Fecha: {date}</p>
      </div>

      {/* Alertas de rutas existentes */}
      {sameDayRoutes.length > 0 && (
        <div className="bg-amber-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h4 className="font-semibold text-amber-900">Rutas del mismo día</h4>
          </div>
          <p className="text-amber-700 text-sm mb-2">
            Hay {sameDayRoutes.length} equipo(s) trabajando el mismo día. Evita solapar zonas.
          </p>
          <div className="flex flex-wrap gap-2">
            {sameDayRoutes.map((route) => (
              <Badge key={route.id} variant="outline" style={{ borderColor: route.color, color: route.color }}>
                {route.teamName} - {route.supervisorName}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Controles de dibujo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Ruta Principal</Label>
          <Input
            placeholder="Nombre de la ruta principal"
            value={mainRouteName}
            onChange={(e) => setMainRouteName(e.target.value)}
          />
          <Button
            onClick={() => setCurrentMode(currentMode === "main" ? null : "main")}
            variant={currentMode === "main" ? "default" : "outline"}
            className="w-full"
          >
            {currentMode === "main" ? "Cancelar Dibujo" : "Dibujar Ruta Principal"}
          </Button>
          {mainRoute.length > 0 && (
            <Badge variant="secondary" className="w-full justify-center">
              ✓ Ruta principal dibujada
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <Label>Ruta de Backup</Label>
          <Input
            placeholder="Nombre de la ruta de backup"
            value={backupRouteName}
            onChange={(e) => setBackupRouteName(e.target.value)}
          />
          <Button
            onClick={() => setCurrentMode(currentMode === "backup" ? null : "backup")}
            variant={currentMode === "backup" ? "default" : "outline"}
            className="w-full"
          >
            {currentMode === "backup" ? "Cancelar Dibujo" : "Dibujar Ruta Backup"}
          </Button>
          {backupRoute.length > 0 && (
            <Badge variant="secondary" className="w-full justify-center">
              ✓ Ruta backup dibujada
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <Label>Punto de Encuentro</Label>
          <Input
            placeholder="Ej: Metro Escuela Militar, Estación Central"
            value={meetingPointName}
            onChange={(e) => setMeetingPointName(e.target.value)}
          />
          <Button
            onClick={() => setCurrentMode(currentMode === "meeting" ? null : "meeting")}
            variant={currentMode === "meeting" ? "default" : "outline"}
            className="w-full"
          >
            {currentMode === "meeting" ? "Cancelar Marcador" : "Marcar Punto de Encuentro"}
          </Button>
          {meetingPoint && (
            <Badge variant="secondary" className="w-full justify-center">
              ✓ Punto de encuentro marcado
            </Badge>
          )}
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Instrucciones:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            • <strong>Ruta Principal:</strong> Haz clic en "Dibujar Ruta Principal" y dibuja la línea en el mapa
          </li>
          <li>
            • <strong>Ruta Backup:</strong> Haz clic en "Dibujar Ruta Backup" para la ruta alternativa
          </li>
          <li>
            • <strong>Punto de Encuentro:</strong> Haz clic en "Marcar Punto de Encuentro" y coloca el marcador
          </li>
          <li>• Las líneas rojas muestran rutas de otros equipos del mismo día</li>
        </ul>
      </div>

      {/* Mapa */}
      <div className="border rounded-lg overflow-hidden">
        <MapContainer
          center={[-33.4489, -70.6693]} // Santiago, Chile
          zoom={12}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Rutas existentes del mismo día */}
          {sameDayRoutes.map((route) => (
            <div key={route.id}>
              <Polyline
                positions={route.mainRoute}
                pathOptions={{
                  color: route.color,
                  weight: 3,
                  opacity: 0.7,
                  dashArray: "5, 5",
                }}
              >
                <Popup>
                  <div>
                    <h4 className="font-semibold">{route.teamName}</h4>
                    <p className="text-sm">Supervisor: {route.supervisorName}</p>
                    <p className="text-sm">Fecha: {route.date}</p>
                  </div>
                </Popup>
              </Polyline>
              <Marker position={route.meetingPoint} icon={createMeetingPointIcon()}>
                <Popup>
                  <div>
                    <h4 className="font-semibold">Punto de Encuentro</h4>
                    <p className="text-sm">{route.teamName}</p>
                  </div>
                </Popup>
              </Marker>
            </div>
          ))}

          {/* Ruta principal actual */}
          {mainRoute.length > 0 && (
            <Polyline
              positions={mainRoute}
              pathOptions={{
                color: "#3b82f6",
                weight: 4,
                opacity: 0.8,
              }}
            />
          )}

          {/* Ruta backup actual */}
          {backupRoute.length > 0 && (
            <Polyline
              positions={backupRoute}
              pathOptions={{
                color: "#f59e0b",
                weight: 4,
                opacity: 0.8,
                dashArray: "10, 5",
              }}
            />
          )}

          {/* Punto de encuentro actual */}
          {meetingPoint && (
            <Marker position={meetingPoint} icon={createMeetingPointIcon()}>
              <Popup>
                <div>
                  <h4 className="font-semibold">Punto de Encuentro</h4>
                  <p className="text-sm">{meetingPointName}</p>
                </div>
              </Popup>
            </Marker>
          )}

          <RouteDrawControl
            onMainRouteCreate={setMainRoute}
            onBackupRouteCreate={setBackupRoute}
            onMeetingPointCreate={setMeetingPoint}
            currentMode={currentMode}
          />
        </MapContainer>
      </div>

      {/* Botón de completar */}
      <div className="flex justify-end">
        <Button onClick={handleComplete} disabled={!isComplete} size="lg" className="min-w-[200px]">
          {isComplete ? "Completar Configuración de Ruta" : "Complete todos los campos"}
        </Button>
      </div>
    </div>
  )
}
