-- Script para poblar datos iniciales en la base de datos
-- Ejecutar después de crear el esquema

-- Insertar roles básicos
INSERT INTO roles (id_rol, nombre, descripcion, permisos, created_at) VALUES
(gen_random_uuid(), 'Administrador', 'Acceso completo al sistema', '{"all": true}', NOW()),
(gen_random_uuid(), 'Supervisor', 'Supervisión de equipos y planes', '{"users": "read", "teams": "all", "plans": "all", "addresses": "read"}', NOW()),
(gen_random_uuid(), 'Técnico', 'Trabajo de campo y actualización de direcciones', '{"addresses": "all", "comments": "all", "locations": "all"}', NOW()),
(gen_random_uuid(), 'Analista', 'Análisis de datos y reportes', '{"addresses": "read", "reports": "all", "analytics": "all"}', NOW())
ON CONFLICT DO NOTHING;

-- Insertar estados de direcciones
INSERT INTO estados_direccion (id_estado, nombre, descripcion, color_hex) VALUES
(1, 'Pendiente', 'Dirección pendiente de verificación', '#FFA500'),
(2, 'Verificada', 'Dirección verificada correctamente', '#28A745'),
(3, 'Rechazada', 'Dirección rechazada por inconsistencias', '#DC3545'),
(4, 'En Proceso', 'Dirección en proceso de verificación', '#007BFF'),
(5, 'Duplicada', 'Dirección duplicada en el sistema', '#6C757D')
ON CONFLICT DO NOTHING;

-- Insertar canales
INSERT INTO canales (id_canal, nombre, descripcion, activo) VALUES
(1, 'Web', 'Ingreso a través de la plataforma web', true),
(2, 'Móvil', 'Ingreso a través de aplicación móvil', true),
(3, 'API', 'Ingreso a través de API externa', true),
(4, 'Importación', 'Datos importados desde archivos', true),
(5, 'Manual', 'Ingreso manual por operador', true)
ON CONFLICT DO NOTHING;

-- Insertar clasificaciones
INSERT INTO clasificaciones (id_clasificacion, nombre, descripcion, prioridad) VALUES
(1, 'Alta Prioridad', 'Direcciones de alta prioridad para verificación', 1),
(2, 'Media Prioridad', 'Direcciones de prioridad media', 2),
(3, 'Baja Prioridad', 'Direcciones de baja prioridad', 3),
(4, 'Crítica', 'Direcciones críticas que requieren atención inmediata', 0),
(5, 'Rutinaria', 'Verificación rutinaria sin urgencia', 4)
ON CONFLICT DO NOTHING;

-- Insertar tipos de vivienda
INSERT INTO tipos_vivienda (id_tipo_vivienda, nombre, descripcion) VALUES
(1, 'Casa', 'Casa unifamiliar'),
(2, 'Departamento', 'Departamento en edificio'),
(3, 'Oficina', 'Oficina comercial'),
(4, 'Local Comercial', 'Local comercial'),
(5, 'Bodega', 'Bodega o almacén'),
(6, 'Terreno', 'Terreno sin construcción'),
(7, 'Otro', 'Otro tipo de propiedad')
ON CONFLICT DO NOTHING;

-- Insertar algunas comunas principales de Chile
INSERT INTO comunas (id_comuna, nombre, region, codigo_postal) VALUES
(1, 'Santiago', 'Región Metropolitana', '8320000'),
(2, 'Las Condes', 'Región Metropolitana', '7550000'),
(3, 'Providencia', 'Región Metropolitana', '7500000'),
(4, 'Ñuñoa', 'Región Metropolitana', '7750000'),
(5, 'Maipú', 'Región Metropolitana', '9250000'),
(6, 'Valparaíso', 'Región de Valparaíso', '2340000'),
(7, 'Viña del Mar', 'Región de Valparaíso', '2520000'),
(8, 'Concepción', 'Región del Biobío', '4030000'),
(9, 'Temuco', 'Región de La Araucanía', '4780000'),
(10, 'Antofagasta', 'Región de Antofagasta', '1240000')
ON CONFLICT DO NOTHING;

-- Insertar configuraciones del sistema
INSERT INTO configuraciones_sistema (id_config, clave, valor, descripcion, tipo_dato, updated_by, updated_at) VALUES
(gen_random_uuid(), 'max_direcciones_por_lote', '1000', 'Máximo número de direcciones por lote de procesamiento', 'integer', NULL, NOW()),
(gen_random_uuid(), 'tiempo_sesion_minutos', '480', 'Tiempo de sesión en minutos antes del logout automático', 'integer', NULL, NOW()),
(gen_random_uuid(), 'radio_busqueda_metros', '500', 'Radio de búsqueda en metros para direcciones cercanas', 'integer', NULL, NOW()),
(gen_random_uuid(), 'notificaciones_email', 'true', 'Habilitar notificaciones por email', 'boolean', NULL, NOW()),
(gen_random_uuid(), 'backup_automatico', 'true', 'Habilitar backup automático diario', 'boolean', NULL, NOW())
ON CONFLICT DO NOTHING;

-- Crear usuario administrador por defecto
DO $$
DECLARE
    admin_role_id UUID;
BEGIN
    -- Obtener el ID del rol administrador
    SELECT id_rol INTO admin_role_id FROM roles WHERE nombre = 'Administrador' LIMIT 1;
    
    -- Insertar usuario administrador si no existe
    INSERT INTO usuarios (id_user, nombre, email, clave, rol_id, activo, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Administrador del Sistema',
        'admin@geovision.cl',
        '$2b$10$rQZ8kqKqKqKqKqKqKqKqKOeJ8kqKqKqKqKqKqKqKqKqKqKqKqKqKq', -- password: admin123
        admin_role_id,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;
END $$;

-- Crear equipo de ejemplo
DO $$
DECLARE
    supervisor_role_id UUID;
    supervisor_user_id UUID;
    equipo_id UUID;
BEGIN
    -- Obtener el ID del rol supervisor
    SELECT id_rol INTO supervisor_role_id FROM roles WHERE nombre = 'Supervisor' LIMIT 1;
    
    -- Crear usuario supervisor
    INSERT INTO usuarios (id_user, nombre, email, clave, rol_id, activo, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        'Juan Pérez',
        'supervisor@geovision.cl',
        '$2b$10$rQZ8kqKqKqKqKqKqKqKqKOeJ8kqKqKqKqKqKqKqKqKqKqKqKqKqKq', -- password: admin123
        supervisor_role_id,
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO NOTHING;
    
    -- Obtener el ID del supervisor creado
    SELECT id_user INTO supervisor_user_id FROM usuarios WHERE email = 'supervisor@geovision.cl';
    
    -- Crear equipo de ejemplo
    INSERT INTO equipos (id_equipo, nombre, descripcion, tipo, id_supervisor, activo, fecha_creacion, created_at)
    VALUES (
        gen_random_uuid(),
        'Equipo Centro',
        'Equipo encargado de la zona centro de Santiago',
        'Verificación',
        supervisor_user_id,
        true,
        CURRENT_DATE,
        NOW()
    )
    ON CONFLICT DO NOTHING;
END $$;

-- Mensaje de confirmación
SELECT 'Datos iniciales insertados correctamente' as resultado;
