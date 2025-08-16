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
      <Sidebar />
      <div className="pt-16">{children}</div>
    </ProtectedRoute>
  )
}
