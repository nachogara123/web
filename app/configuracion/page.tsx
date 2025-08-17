"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Bell, Shield, Database, Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

interface SystemSettings {
  siteName: string
  siteDescription: string
  defaultLanguage: string
  timezone: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  dataRetentionDays: number
  backupFrequency: string
  maxFileSize: number
  allowedFileTypes: string[]
}

export default function ConfiguracionPage() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "GeoVision",
    siteDescription: "Sistema de Gestión Geográfica",
    defaultLanguage: "es",
    timezone: "Europe/Madrid",
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    dataRetentionDays: 365,
    backupFrequency: "daily",
    maxFileSize: 10,
    allowedFileTypes: ["jpg", "png", "pdf", "csv", "xlsx"],
  })

  const [userPreferences, setUserPreferences] = useState({
    theme: "light",
    language: "es",
    notifications: true,
    emailUpdates: true,
    dashboardLayout: "default",
  })

  const handleSaveSettings = () => {
    toast({
      title: "Configuración guardada",
      description: "Los cambios han sido aplicados exitosamente",
    })
  }

  const handleSavePreferences = () => {
    toast({
      title: "Preferencias actualizadas",
      description: "Tus preferencias personales han sido guardadas",
    })
  }

  const languages = [
    { value: "es", label: "Español" },
    { value: "en", label: "English" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
  ]

  const timezones = [
    { value: "Europe/Madrid", label: "Madrid (UTC+1)" },
    { value: "America/New_York", label: "New York (UTC-5)" },
    { value: "America/Los_Angeles", label: "Los Angeles (UTC-8)" },
    { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
  ]

  const backupFrequencies = [
    { value: "hourly", label: "Cada hora" },
    { value: "daily", label: "Diario" },
    { value: "weekly", label: "Semanal" },
    { value: "monthly", label: "Mensual" },
  ]

  return (
    <div className="pt-16 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Configuración</h1>
          <p className="text-gray-600">Gestiona la configuración del sistema y tus preferencias</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="lg:col-span-1">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Secciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 text-blue-700">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Sistema</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <User className="h-4 w-4" />
                <span className="text-sm">Perfil</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <Bell className="h-4 w-4" />
                <span className="text-sm">Notificaciones</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Seguridad</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                <Database className="h-4 w-4" />
                <span className="text-sm">Base de Datos</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* System Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Settings className="h-5 w-5" />
                Configuración del Sistema
              </CardTitle>
              <CardDescription>Configuración general de la aplicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nombre del Sistema</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Descripción</Label>
                  <Input
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Idioma por Defecto</Label>
                  <Select
                    value={settings.defaultLanguage}
                    onValueChange={(value) => setSettings({ ...settings, defaultLanguage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Zona Horaria</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Opciones del Sistema</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Modo Mantenimiento</Label>
                      <p className="text-sm text-gray-600">Desactiva el acceso público al sistema</p>
                    </div>
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Registro de Usuarios</Label>
                      <p className="text-sm text-gray-600">Permite el registro de nuevos usuarios</p>
                    </div>
                    <Switch
                      checked={settings.registrationEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, registrationEnabled: checked })}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración del Sistema
              </Button>
            </CardContent>
          </Card>

          {/* User Preferences */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <User className="h-5 w-5" />
                Preferencias Personales
              </CardTitle>
              <CardDescription>Configuración específica de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {user && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <Badge className="mt-1 capitalize">{user.role}</Badge>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select
                    value={userPreferences.theme}
                    onValueChange={(value) => setUserPreferences({ ...userPreferences, theme: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select
                    value={userPreferences.language}
                    onValueChange={(value) => setUserPreferences({ ...userPreferences, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificaciones</Label>
                    <p className="text-sm text-gray-600">Recibir notificaciones del sistema</p>
                  </div>
                  <Switch
                    checked={userPreferences.notifications}
                    onCheckedChange={(checked) => setUserPreferences({ ...userPreferences, notifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Actualizaciones por Email</Label>
                    <p className="text-sm text-gray-600">Recibir actualizaciones importantes por correo</p>
                  </div>
                  <Switch
                    checked={userPreferences.emailUpdates}
                    onCheckedChange={(checked) => setUserPreferences({ ...userPreferences, emailUpdates: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleSavePreferences} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Guardar Preferencias
              </Button>
            </CardContent>
          </Card>

          {/* Data & Backup Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Database className="h-5 w-5" />
                Datos y Respaldos
              </CardTitle>
              <CardDescription>Configuración de almacenamiento y respaldos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Retención de Datos (días)</Label>
                  <Input
                    type="number"
                    value={settings.dataRetentionDays}
                    onChange={(e) => setSettings({ ...settings, dataRetentionDays: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frecuencia de Respaldo</Label>
                  <Select
                    value={settings.backupFrequency}
                    onValueChange={(value) => setSettings({ ...settings, backupFrequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {backupFrequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tamaño Máximo de Archivo (MB)</Label>
                <Input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({ ...settings, maxFileSize: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipos de Archivo Permitidos</Label>
                <div className="flex flex-wrap gap-2">
                  {settings.allowedFileTypes.map((type) => (
                    <Badge key={type} variant="outline">
                      .{type}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
