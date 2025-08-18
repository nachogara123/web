const { execSync } = require("child_process")

console.log("🔧 Instalando dependencias...")

try {
  // Instalar dependencias
  execSync("npm install", { stdio: "inherit" })
  console.log("✅ Dependencias instaladas correctamente")

  // Verificar que lucide-react esté disponible
  try {
    require("lucide-react")
    console.log("✅ lucide-react está disponible")
  } catch (error) {
    console.log("⚠️  Reinstalando lucide-react...")
    execSync("npm install lucide-react@latest", { stdio: "inherit" })
  }

  console.log("🎉 Todo listo para usar!")
} catch (error) {
  console.error("❌ Error instalando dependencias:", error.message)
}
