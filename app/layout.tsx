import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { Sidebar } from "@/components/sidebar"
import { ProtectedRoute } from "@/components/protected-route"

export const metadata: Metadata = {
  title: "GeoVision - Sistema de Gestión Geográfica",
  description: "Sistema completo para gestión de rutas y análisis geográfico",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <AuthProvider>
          <ProtectedRoute>
            <Sidebar />
            <div className="pt-16">{children}</div>
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  )
}
