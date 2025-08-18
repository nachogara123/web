export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export function generateUUID(): string {
  return crypto.randomUUID()
}

export function validateAndFixUUID(id: string | undefined | null): string {
  if (!id || !isValidUUID(id)) {
    console.warn(`[v0] UUID inválido detectado: "${id}", generando nuevo UUID`)
    return generateUUID()
  }
  return id
}

export const DEFAULT_ADMIN_UUID = "550e8400-e29b-41d4-a716-446655440001"
export const DEFAULT_USER_UUID = "550e8400-e29b-41d4-a716-446655440002"
