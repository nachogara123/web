-- Script para crear usuarios de demostración en la base de datos real
-- Primero crear roles si no existen
INSERT INTO roles (id_rol, nombre, descripcion, permisos, created_at) VALUES
  (gen_random_uuid(), 'admin', 'Administrador del sistema', '["dashboard", "usuarios", "mapa-feedback", "mapa-dibujo", "optimizar-rutas", "exportar", "reportes", "configuracion", "supervisor-panel", "ejecutivo-panel", "equipos", "comentarios", "direcciones"]'::jsonb, NOW()),
  (gen_random_uuid(), 'supervisor', 'Supervisor de operaciones', '["dashboard", "usuarios", "mapa-feedback", "optimizar-rutas", "reportes", "supervisor-panel", "equipos"]'::jsonb, NOW()),
  (gen_random_uuid(), 'ejecutivo', 'Ejecutivo de ventas', '["dashboard", "mapa-feedback", "mapa-dibujo", "ejecutivo-panel", "comentarios", "direcciones"]'::jsonb, NOW())
ON CONFLICT (nombre) DO NOTHING;

-- Crear usuarios de demostración
WITH role_ids AS (
  SELECT id_rol, nombre FROM roles WHERE nombre IN ('admin', 'supervisor', 'ejecutivo')
)
INSERT INTO usuarios (id_user, email, nombre, clave, rol_id, activo, created_at, updated_at) VALUES
  (gen_random_uuid(), 'admin@geovision.com', 'Administrador General', 'password', (SELECT id_rol FROM role_ids WHERE nombre = 'admin'), true, NOW(), NOW()),
  (gen_random_uuid(), 'supervisor@geovision.com', 'Carlos Supervisor', 'password', (SELECT id_rol FROM role_ids WHERE nombre = 'supervisor'), true, NOW(), NOW()),
  (gen_random_uuid(), 'ejecutivo@geovision.com', 'Ana Ejecutiva', 'password', (SELECT id_rol FROM role_ids WHERE nombre = 'ejecutivo'), true, NOW(), NOW()),
  (gen_random_uuid(), 'supervisor2@geovision.com', 'María Supervisora', 'password', (SELECT id_rol FROM role_ids WHERE nombre = 'supervisor'), true, NOW(), NOW()),
  (gen_random_uuid(), 'ejecutivo2@geovision.com', 'Luis Ejecutivo', 'password', (SELECT id_rol FROM role_ids WHERE nombre = 'ejecutivo'), true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
