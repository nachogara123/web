"use client"

import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
