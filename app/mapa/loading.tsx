import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="pt-16 p-6 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    </div>
  )
}
