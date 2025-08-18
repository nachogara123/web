"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GeolocationButtonProps {
  userId: string
  onLocationSaved?: (location: { latitud: number; longitud: number }) => void
  className?: string
}

export default function GeolocationButton({ userId, onLocationSaved, className }: GeolocationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "La geolocalización no está soportada en este navegador",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy, speed, heading } = position.coords

          const response = await fetch("/api/ubicaciones-equipo", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              usuario_id: userId,
              latitud: latitude,
              longitud: longitude,
              precision_metros: accuracy,
              velocidad_kmh: speed ? speed * 3.6 : null, // Convertir m/s a km/h
              direccion_grados: heading,
            }),
          })

          const result = await response.json()

          if (result.success) {
            toast({
              title: "Ubicación guardada",
              description: `Coordenadas: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            })

            onLocationSaved?.({ latitud: latitude, longitud: longitude })
          } else {
            throw new Error(result.error || "Error guardando ubicación")
          }
        } catch (error) {
          console.error("[v0] Error guardando ubicación:", error)
          toast({
            title: "Error",
            description: "No se pudo guardar la ubicación",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      },
      (error) => {
        console.error("[v0] Error obteniendo ubicación:", error)
        let message = "No se pudo obtener la ubicación"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Permiso de ubicación denegado"
            break
          case error.POSITION_UNAVAILABLE:
            message = "Ubicación no disponible"
            break
          case error.TIMEOUT:
            message = "Tiempo de espera agotado"
            break
        }

        toast({
          title: "Error de geolocalización",
          description: message,
          variant: "destructive",
        })
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  return (
    <Button onClick={handleGetLocation} disabled={isLoading} className={className} variant="outline">
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
      {isLoading ? "Obteniendo ubicación..." : "Obtener mi ubicación"}
    </Button>
  )
}
