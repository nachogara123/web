-- Script para poblar la base de datos con datos iniciales
-- Ejecutar después de crear el esquema

-- Insertar roles básicos
INSERT INTO roles (id_rol, nombre, descripcion, permisos, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Administrador', 'Acceso completo al sistema', '{"all": true}', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Supervisor', 'Supervisión de equipos y planes', '{"equipos": true, "planes": true, "usuarios": true}', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Técnico', 'Acceso a direcciones y comentarios', '{"direcciones": true, "comentarios": true}', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Analista', 'Acceso de solo lectura', '{"read_only": true}', NOW());

-- Insertar estados de direcciones
INSERT INTO estados_direccion (id_estado, nombre, descripcion, color_hex) VALUES
(1, 'Pendiente', 'Dirección pendiente de verificación', '#FFA500'),
(2, 'En Proceso', 'Dirección en proceso de verificación', '#0066CC'),
(3, 'Verificada', 'Dirección verificada correctamente', '#00AA00'),
(4, 'Rechazada', 'Dirección rechazada por inconsistencias', '#CC0000'),
(5, 'Incompleta', 'Dirección con información incompleta', '#FFCC00');

-- Insertar canales
INSERT INTO canales (id_canal, nombre, descripcion, activo) VALUES
(1, 'Web', 'Canal web principal', true),
(2, 'Móvil', 'Aplicación móvil', true),
(3, 'Call Center', 'Centro de llamadas', true),
(4, 'Terreno', 'Trabajo en terreno', true),
(5, 'API', 'Integración por API', true);

-- Insertar clasificaciones
INSERT INTO clasificaciones (id_clasificacion, nombre, descripcion, prioridad) VALUES
(1, 'Alta Prioridad', 'Direcciones de alta prioridad', 1),
(2, 'Media Prioridad', 'Direcciones de prioridad media', 2),
(3, 'Baja Prioridad', 'Direcciones de baja prioridad', 3),
(4, 'Urgente', 'Direcciones que requieren atención inmediata', 0),
(5, 'Comercial', 'Direcciones comerciales', 2),
(6, 'Residencial', 'Direcciones residenciales', 3);

-- Insertar tipos de vivienda
INSERT INTO tipos_vivienda (id_tipo_vivienda, nombre, descripcion) VALUES
(1, 'Casa', 'Casa unifamiliar'),
(2, 'Departamento', 'Departamento en edificio'),
(3, 'Oficina', 'Oficina comercial'),
(4, 'Local Comercial', 'Local comercial'),
(5, 'Bodega', 'Bodega o almacén'),
(6, 'Terreno', 'Terreno sin construcción');

-- Insertar algunas comunas principales de Chile
INSERT INTO comunas (id_comuna, nombre, region, codigo_postal) VALUES
(1, 'Santiago', 'Región Metropolitana', '8320000'),
(2, 'Las Condes', 'Región Metropolitana', '7550000'),
(3, 'Providencia', 'Región Metropolitana', '7500000'),
(4, 'Ñuñoa', 'Región Metropolitana', '7750000'),
(5, 'Maipú', 'Región Metropolitana', '9250000'),
(6, 'La Florida', 'Región Metropolitana', '8240000'),
(7, 'Puente Alto', 'Región Metropolitana', '8150000'),
(8, 'Valparaíso', 'Región de Valparaíso', '2340000'),
(9, 'Viña del Mar', 'Región de Valparaíso', '2520000'),
(10, 'Concepción', 'Región del Biobío', '4030000'),
(11, 'Temuco', 'Región de La Araucanía', '4780000'),
(12, 'Antofagasta', 'Región de Antofagasta', '1240000'),
(13, 'La Serena', 'Región de Coquimbo', '1700000'),
(14, 'Rancagua', 'Región del Libertador Bernardo O'Higgins', '2820000'),
(15, 'Talca', 'Región del Maule', '3460000');

-- Insertar configuraciones del sistema
INSERT INTO configuraciones_sistema (id_config, clave, valor, descripcion, tipo_dato, updated_by, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'max_direcciones_por_pagina', '50', 'Máximo número de direcciones por página', 'integer', '550e8400-e29b-41d4-a716-446655440001', NOW()),
('550e8400-e29b-41d4-a716-446655440102', 'tiempo_sesion_minutos', '480', 'Tiempo de sesión en minutos', 'integer', '550e8400-e29b-41d4-a716-446655440001', NOW()),
('550e8400-e29b-41d4-a716-446655440103', 'radio_busqueda_metros', '1000', 'Radio de búsqueda por defecto en metros', 'integer', '550e8400-e29b-41d4-a716-446655440001', NOW()),
('550e8400-e29b-41d4-a716-446655440104', 'notificaciones_email', 'true', 'Enviar notificaciones por email', 'boolean', '550e8400-e29b-41d4-a716-446655440001', NOW()),
('550e8400-e29b-41d4-a716-446655440105', 'backup_automatico', 'true', 'Realizar backup automático', 'boolean', '550e8400-e29b-41d4-a716-446655440001', NOW());

-- Insertar usuario administrador de prueba
INSERT INTO usuarios (id_user, nombre, email, clave, telefono, rol_id, activo, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440201', 'Administrador Sistema', 'admin@geovision.cl', '$2b$10$rQZ8kHWKtGKVQ1Zm5rQZ8eJ1kQZ8kHWKtGKVQ1Zm5rQZ8eJ1kQZ8k', '+56912345678', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440202', 'Juan Supervisor', 'supervisor@geovision.cl', '$2b$10$rQZ8kHWKtGKVQ1Zm5rQZ8eJ1kQZ8kHWKtGKVQ1Zm5rQZ8eJ1kQZ8k', '+56987654321', '550e8400-e29b-41d4-a716-446655440002', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440203', 'María Técnico', 'tecnico@geovision.cl', '$2b$10$rQZ8kHWKtGKVQ1Zm5rQZ8eJ1kQZ8kHWKtGKVQ1Zm5rQZ8eJ1kQZ8k', '+56911223344', '550e8400-e29b-41d4-a716-446655440003', true, NOW(), NOW());

-- Insertar equipo de prueba
INSERT INTO equipos (id_equipo, nombre, descripcion, tipo, id_supervisor, activo, fecha_creacion, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440301', 'Equipo Centro', 'Equipo de trabajo del centro de Santiago', 'Verificación', '550e8400-e29b-41d4-a716-446655440202', true, CURRENT_DATE, NOW()),
('550e8400-e29b-41d4-a716-446655440302', 'Equipo Norte', 'Equipo de trabajo zona norte', 'Verificación', '550e8400-e29b-41d4-a716-446655440202', true, CURRENT_DATE, NOW());

-- Asignar usuarios a equipos
INSERT INTO usuarios_equipos (id_usuario, id_equipo, rol_en_equipo, fecha_asignacion, activo) VALUES
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440301', 'Supervisor', CURRENT_DATE, true),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440301', 'Técnico', CURRENT_DATE, true);

-- Insertar plan de trabajo de prueba
INSERT INTO planes_trabajo (id_plan, id_equipo, semana, año, fecha_inicio, fecha_fin, objetivos, estado, progreso, creado_por, actualizado_por, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440301', 1, 2024, '2024-01-01', '2024-01-07', 'Verificar 100 direcciones en el centro de Santiago', 'activo', 25, '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440202', NOW(), NOW());

-- Insertar algunas direcciones de prueba
INSERT INTO direcciones (id_direccion, direccion_final, lat, lon, id_comuna, id_canal, id_clasificacion, id_tipo_vivienda, id_estado, verificada, contador, total_comentarios, nota, created_at, updated_at) VALUES
(1, 'Av. Libertador Bernardo O''Higgins 1449, Santiago', -33.4489, -70.6693, 1, 1, 1, 3, 1, false, 0, 0, 'Dirección de prueba 1', NOW(), NOW()),
(2, 'Av. Providencia 1208, Providencia', -33.4372, -70.6506, 3, 2, 2, 3, 2, false, 0, 0, 'Dirección de prueba 2', NOW(), NOW()),
(3, 'Av. Las Condes 12345, Las Condes', -33.4172, -70.5810, 2, 1, 1, 1, 3, true, 1, 2, 'Dirección verificada', NOW(), NOW());

-- Insertar comentarios de prueba
INSERT INTO comentarios_pre (id_coment, comentario, categoria, tipo_feedback, prioridad, creado_por, resuelto, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440501', 'Dirección no encontrada en el lugar indicado', 'Ubicación', 'Problema', 1, '550e8400-e29b-41d4-a716-446655440203', false, NOW()),
('550e8400-e29b-41d4-a716-446655440502', 'Verificación exitosa, dirección correcta', 'Verificación', 'Éxito', 3, '550e8400-e29b-41d4-a716-446655440203', true, NOW());

-- Insertar notificaciones de prueba
INSERT INTO notificaciones (id_notificacion, id_usuario, titulo, mensaje, tipo, leida, url_accion, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440201', 'Bienvenido al Sistema', 'Bienvenido a GeoVision. El sistema está listo para usar.', 'info', false, '/dashboard', NOW()),
('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440202', 'Nuevo Plan Asignado', 'Se te ha asignado un nuevo plan de trabajo.', 'trabajo', false, '/planes-trabajo', NOW());

COMMIT;
