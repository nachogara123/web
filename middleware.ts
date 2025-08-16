import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas que requieren autenticación
const protectedRoutes = ["/dashboard", "/usuarios", "/mapa", "/supervisor", "/ejecutivo"]

// Rutas públicas que no requieren autenticación
const publicRoutes = ["/login"]

// Permisos por rol
const rolePermissions = {
  admin: ["/dashboard", "/usuarios", "/mapa", "/supervisor", "/ejecutivo"],
  supervisor: ["/dashboard", "/usuarios", "/mapa", "/supervisor"],
  ejecutivo: ["/dashboard", "/mapa", "/ejecutivo"],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Obtener información del usuario desde las cookies o headers
  const userCookie = request.cookies.get("geovision_user")
  let user = null

  if (userCookie) {
    try {
      user = JSON.parse(userCookie.value)
    } catch (error) {
      // Cookie inválida, limpiar
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("geovision_user")
      return response
    }
  }

  // Si está en una ruta pública y ya está autenticado, redirigir al dashboard
  if (publicRoutes.includes(pathname) && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Si está en una ruta protegida y no está autenticado, redirigir al login
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verificar permisos de rol para rutas específicas
  if (user && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const userRole = user.role as keyof typeof rolePermissions
    const allowedRoutes = rolePermissions[userRole] || []

    // Verificar si el usuario tiene permiso para acceder a esta ruta
    const hasPermission = allowedRoutes.some((route) => pathname.startsWith(route))

    if (!hasPermission) {
      // Redirigir a una página de acceso denegado o al dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Redirigir la raíz al dashboard si está autenticado, sino al login
  if (pathname === "/") {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
