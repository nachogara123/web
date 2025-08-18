export interface UbicacionUsuario {
  id_historial: string
  id_usuario: string
  fecha_hora: Date
  latitud: number
  longitud: number
  precision_metros?: number
  velocidad_kmh?: number
  direccion_grados?: number
  usuario_nombre?: string
}

export interface GuardarUbicacionRequest {
  usuario_id: string
  latitud: number
  longitud: number
  precision_metros?: number
  velocidad_kmh?: number
  direccion_grados?: number
}

export interface UbicacionResponse {
  success: boolean
  id?: string
  message?: string
  error?: string
  details?: string
}
