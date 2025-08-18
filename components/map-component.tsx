"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, Circle, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet-draw"

// Fix para los iconos de Leaflet en Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface MapFeature {
  id: string
  type: "marker" | "polygon" | "polyline" | "circle"
  name: string
  description: string
  coordinates: any
  properties: {
    color?: string
    category?: string
    status?: "active" | "inactive" | "pending"
  }
  createdAt: string
}

interface MapComponentProps {
  features: MapFeature[]
  selectedFeature: MapFeature | null
  onFeatureSelect: (feature: MapFeature | null) => void
  onFeatureCreate: (featureData: any) => void
  isDrawMode: boolean
  isFeedbackMode: boolean
}

function AutoZoom({ features }: { features: MapFeature[] }) {
  const map = useMap()

  useEffect(() => {
    if (!map || features.length === 0) return

    try {
      const bounds = L.latLngBounds([])
      let hasValidBounds = false

      features.forEach((feature) => {
        if (feature.type === "marker" && Array.isArray(feature.coordinates) && feature.coordinates.length === 2) {
          bounds.extend([feature.coordinates[0], feature.coordinates[1]])
          hasValidBounds = true
        } else if (feature.type === "polygon" && Array.isArray(feature.coordinates)) {
          feature.coordinates.forEach((coord: [number, number]) => {
            if (Array.isArray(coord) && coord.length === 2) {
              bounds.extend([coord[0], coord[1]])
              hasValidBounds = true
            }
          })
        } else if (feature.type === "polyline" && Array.isArray(feature.coordinates)) {
          feature.coordinates.forEach((coord: [number, number]) => {
            if (Array.isArray(coord) && coord.length === 2) {
              bounds.extend([coord[0], coord[1]])
              hasValidBounds = true
            }
          })
        } else if (feature.type === "circle" && feature.coordinates.center) {
          bounds.extend([feature.coordinates.center[0], feature.coordinates.center[1]])
          hasValidBounds = true
        }
      })

      if (hasValidBounds && bounds.isValid()) {
        // Agregar padding para que los markers no estén en el borde
        map.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 16, // Evitar zoom excesivo cuando hay pocos puntos
        })
        console.log(`[v0] Auto zoom aplicado a ${features.length} features`)
      }
    } catch (error) {
      console.error("[v0] Error aplicando auto zoom:", error)
    }
  }, [map, features])

  return null
}

function DrawControl({ onFeatureCreate, isDrawMode }: { onFeatureCreate: any; isDrawMode: boolean }) {
  const map = useMap()
  const drawControlRef = useRef<L.Control.Draw | null>(null)

  useEffect(() => {
    if (!map) return

    const drawnItems = new L.FeatureGroup()
    map.addLayer(drawnItems)

    if (isDrawMode && !drawControlRef.current) {
      const drawControl = new L.Control.Draw({
        edit: {
          featureGroup: drawnItems,
        },
        draw: {
          polygon: {
            allowIntersection: false,
            drawError: {
              color: "#e1e100",
              message: "<strong>Error:</strong> Las líneas no pueden cruzarse!",
            },
            shapeOptions: {
              color: "#3b82f6",
            },
          },
          polyline: {
            shapeOptions: {
              color: "#3b82f6",
            },
          },
          circle: {
            shapeOptions: {
              color: "#3b82f6",
            },
          },
          rectangle: {
            shapeOptions: {
              color: "#3b82f6",
            },
          },
          marker: true,
          circlemarker: false,
        },
      })

      drawControlRef.current = drawControl
      map.addControl(drawControl)

      map.on(L.Draw.Event.CREATED, (event: any) => {
        const { layer, layerType } = event
        drawnItems.addLayer(layer)

        let coordinates
        if (layerType === "marker") {
          coordinates = [layer.getLatLng().lat, layer.getLatLng().lng]
        } else if (layerType === "polygon" || layerType === "rectangle") {
          coordinates = layer.getLatLngs()[0].map((latlng: L.LatLng) => [latlng.lat, latlng.lng])
        } else if (layerType === "polyline") {
          coordinates = layer.getLatLngs().map((latlng: L.LatLng) => [latlng.lat, latlng.lng])
        } else if (layerType === "circle") {
          coordinates = {
            center: [layer.getLatLng().lat, layer.getLatLng().lng],
            radius: layer.getRadius(),
          }
        }

        onFeatureCreate({
          type: layerType,
          coordinates,
        })
      })
    } else if (!isDrawMode && drawControlRef.current) {
      map.removeControl(drawControlRef.current)
      drawControlRef.current = null
    }

    return () => {
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current)
        drawControlRef.current = null
      }
    }
  }, [map, isDrawMode, onFeatureCreate])

  return null
}

function FeedbackControl({ isFeedbackMode }: { isFeedbackMode: boolean }) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    if (isFeedbackMode) {
      map.on("click", (e) => {
        const popup = L.popup()
          .setLatLng(e.latlng)
          .setContent(
            `
            <div style="min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">Feedback</h4>
              <textarea 
                placeholder="Escribe tu comentario aquí..." 
                style="width: 100%; height: 60px; margin-bottom: 8px; padding: 4px; border: 1px solid #ccc; border-radius: 4px; resize: none;"
              ></textarea>
              <button 
                onclick="this.closest('.leaflet-popup').remove()" 
                style="background: #3b82f6; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;"
              >
                Enviar
              </button>
            </div>
          `,
          )
          .openOn(map)
      })

      map.getContainer().style.cursor = "crosshair"
    } else {
      map.off("click")
      map.getContainer().style.cursor = ""
    }

    return () => {
      map.off("click")
      map.getContainer().style.cursor = ""
    }
  }, [map, isFeedbackMode])

  return null
}

export default function MapComponent({
  features,
  selectedFeature,
  onFeatureSelect,
  onFeatureCreate,
  isDrawMode,
  isFeedbackMode,
}: MapComponentProps) {
  const renderFeature = (feature: MapFeature) => {
    const color = feature.properties.color || "#3b82f6"
    const isSelected = selectedFeature?.id === feature.id

    switch (feature.type) {
      case "marker":
        return (
          <Marker
            key={feature.id}
            position={feature.coordinates}
            eventHandlers={{
              click: () => onFeatureSelect(feature),
            }}
          >
            <Popup>
              <div>
                <h4 className="font-semibold">{feature.name}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </Popup>
          </Marker>
        )

      case "polygon":
        return (
          <Polygon
            key={feature.id}
            positions={feature.coordinates}
            pathOptions={{
              color: color,
              weight: isSelected ? 4 : 2,
              opacity: 0.8,
              fillOpacity: 0.3,
            }}
            eventHandlers={{
              click: () => onFeatureSelect(feature),
            }}
          >
            <Popup>
              <div>
                <h4 className="font-semibold">{feature.name}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </Popup>
          </Polygon>
        )

      case "polyline":
        return (
          <Polyline
            key={feature.id}
            positions={feature.coordinates}
            pathOptions={{
              color: color,
              weight: isSelected ? 4 : 2,
              opacity: 0.8,
            }}
            eventHandlers={{
              click: () => onFeatureSelect(feature),
            }}
          >
            <Popup>
              <div>
                <h4 className="font-semibold">{feature.name}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </Popup>
          </Polyline>
        )

      case "circle":
        return (
          <Circle
            key={feature.id}
            center={feature.coordinates.center}
            radius={feature.coordinates.radius}
            pathOptions={{
              color: color,
              weight: isSelected ? 4 : 2,
              opacity: 0.8,
              fillOpacity: 0.3,
            }}
            eventHandlers={{
              click: () => onFeatureSelect(feature),
            }}
          >
            <Popup>
              <div>
                <h4 className="font-semibold">{feature.name}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </Popup>
          </Circle>
        )

      default:
        return null
    }
  }

  return (
    <MapContainer
      center={[40.4168, -3.7038]}
      zoom={13}
      style={{ height: "600px", width: "100%" }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {features.map(renderFeature)}

      <AutoZoom features={features} />

      <DrawControl onFeatureCreate={onFeatureCreate} isDrawMode={isDrawMode} />
      <FeedbackControl isFeedbackMode={isFeedbackMode} />
    </MapContainer>
  )
}
