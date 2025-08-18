"use client"

import type React from "react"

import { useAuth, type UserRole } from "@/hooks/use-auth"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldX } from "lucide-react"

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      fallback || (
        <div className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <ShieldX className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              No tienes permisos para acceder a esta página. Contacta al administrador si necesitas acceso.
            </AlertDescription>
          </Alert>
        </div>
      )
    )
  }

  return <>{children}</>
}
