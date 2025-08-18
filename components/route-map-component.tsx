"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface RoutePoint {
  id: string
  name: string
  address: string
  coordinates: [number, number]
  type: "origin" | "destination" | "waypoint"
  estimatedTime?: number
  priority?: "high" | "medium" | "low"
}

interface OptimizedRoute {
  id: string
  name: string
  points: RoutePoint[]
  totalDistance: number
  totalTime: number
  estimatedFuel: number
  optimizationScore: number
  createdAt: string
}

interface RouteMapComponentProps {
  routePoints: RoutePoint[]
  optimizedRoute: OptimizedRoute | null
  onPointSelect: (point: RoutePoint) => void
}

// Iconos personalizados para diferentes tipos de puntos
const createCustomIcon = (type: string, index?: number) => {
  const colors = {
    origin: "#22c55e",
    destination: "#ef4444",
    waypoint: "#3b82f6",
  }

  const color = colors[type as keyof typeof colors] || "#6b7280"

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">
        ${index !== undefined ? index + 1 : type === "origin" ? "O" : type === "destination" ? "D" : "•"}
      </div>
    `,
    className: "custom-marker",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

function MapUpdater({
  routePoints,
  optimizedRoute,
}: { routePoints: RoutePoint[]; optimizedRoute: OptimizedRoute | null }) {
  const map = useMap()

  useEffect(() => {
    if (routePoints.length > 0) {
      const group = new L.FeatureGroup(routePoints.map((point) => L.marker(point.coordinates)))
      map.fitBounds(group.getBounds().pad(0.1))
    }
  }, [map, routePoints, optimizedRoute])

  return null
}

export default function RouteMapComponent({ routePoints, optimizedRoute, onPointSelect }: RouteMapComponentProps) {
  const displayPoints = optimizedRoute ? optimizedRoute.points : routePoints

  // Generar líneas de ruta si hay una ruta optimizada
  const routeLines = optimizedRoute
    ? optimizedRoute.points
        .map((point, index) => {
          if (index === optimizedRoute.points.length - 1) return null
          const nextPoint = optimizedRoute.points[index + 1]
          return {
            positions: [point.coordinates, nextPoint.coordinates] as [number, number][],
            color: "#3b82f6",
          }
        })
        .filter(Boolean)
    : []

  return (
    <MapContainer
      center={[40.4168, -3.7038]}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater routePoints={routePoints} optimizedRoute={optimizedRoute} />

      {/* Renderizar puntos */}
      {displayPoints.map((point, index) => (
        <Marker
          key={point.id}
          position={point.coordinates}
          icon={createCustomIcon(point.type, optimizedRoute ? index : undefined)}
          eventHandlers={{
            click: () => onPointSelect(point),
          }}
        >
          <Popup>
            <div className="min-w-[200px]">
              <h4 className="font-semibold mb-1">{point.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{point.address}</p>
              <div className="flex gap-1 flex-wrap">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    point.type === "origin"
                      ? "bg-green-100 text-green-800"
                      : point.type === "destination"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {point.type === "origin" ? "Origen" : point.type === "destination" ? "Destino" : "Parada"}
                </span>
                {point.priority && (
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      point.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : point.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {point.priority}
                  </span>
                )}
                {point.estimatedTime && (
                  <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">{point.estimatedTime}min</span>
                )}
              </div>
              {optimizedRoute && (
                <div className="mt-2 text-xs text-gray-500">Parada #{index + 1} en la ruta optimizada</div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Renderizar líneas de ruta */}
      {routeLines.map(
        (line, index) =>
          line && (
            <Polyline
              key={index}
              positions={line.positions}
              pathOptions={{
                color: line.color,
                weight: 4,
                opacity: 0.7,
                dashArray: "10, 10",
              }}
            />
          ),
      )}
    </MapContainer>
  )
}
