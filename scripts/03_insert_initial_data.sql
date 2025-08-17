-- Insert initial roles
INSERT INTO roles (nombre, descripcion, permisos) VALUES
('Administrador', 'Acceso completo al sistema', '{"all": true}'),
('Supervisor', 'Gestión de equipos y planes de trabajo', '{"teams": true, "plans": true, "reports": true}'),
('Técnico', 'Acceso a rutas y ubicaciones asignadas', '{"routes": true, "locations": true}'),
('Analista', 'Acceso a reportes y análisis', '{"reports": true, "analytics": true}'),
('Usuario', 'Acceso básico al sistema', '{"basic": true}');

-- Insert initial states
INSERT INTO estados_direccion (nombre, descripcion, color_hex) VALUES
('Pendiente', 'Dirección pendiente de verificación', '#FFA500'),
('Verificada', 'Dirección verificada y confirmada', '#00FF00'),
('Rechazada', 'Dirección rechazada o inválida', '#FF0000'),
('En Proceso', 'Dirección en proceso de verificación', '#0000FF'),
('Completada', 'Trabajo completado en esta dirección', '#800080');

-- Insert initial channels
INSERT INTO canales (nombre, descripcion) VALUES
('Fibra Óptica', 'Conexión por fibra óptica'),
('ADSL', 'Conexión ADSL tradicional'),
('Cable', 'Conexión por cable coaxial'),
('Móvil', 'Conexión móvil 4G/5G'),
('Satelital', 'Conexión satelital');

-- Insert initial housing types
INSERT INTO tipos_vivienda (nombre, descripcion) VALUES
('Casa', 'Casa unifamiliar'),
('Departamento', 'Departamento en edificio'),
('Oficina', 'Oficina comercial'),
('Local Comercial', 'Local comercial'),
('Industria', 'Instalación industrial');

-- Insert initial classifications
INSERT INTO clasificaciones (nombre, descripcion, prioridad) VALUES
('Alta Prioridad', 'Requiere atención inmediata', 5),
('Media Prioridad', 'Atención en plazo normal', 3),
('Baja Prioridad', 'Puede esperar', 1),
('Urgente', 'Atención urgente requerida', 5),
('Rutinario', 'Trabajo de rutina', 2);

-- Insert some Chilean communes
INSERT INTO comunas (nombre, codigo_postal, region) VALUES
('Santiago', '8320000', 'Región Metropolitana'),
('Las Condes', '7550000', 'Región Metropolitana'),
('Providencia', '7500000', 'Región Metropolitana'),
('Ñuñoa', '7750000', 'Región Metropolitana'),
('Valparaíso', '2340000', 'Región de Valparaíso'),
('Viña del Mar', '2520000', 'Región de Valparaíso'),
('Concepción', '4030000', 'Región del Biobío'),
('Temuco', '4780000', 'Región de La Araucanía');

-- Insert system configurations
INSERT INTO configuraciones_sistema (clave, valor, descripcion, tipo_dato) VALUES
('max_ubicaciones_por_dia', '1000', 'Máximo número de ubicaciones a registrar por usuario por día', 'number'),
('radio_zona_trabajo_metros', '5000', 'Radio en metros para definir zona de trabajo', 'number'),
('notificaciones_email_activas', 'true', 'Activar notificaciones por email', 'boolean'),
('tiempo_sesion_horas', '8', 'Tiempo máximo de sesión en horas', 'number'),
('version_app', '1.0.0', 'Versión actual de la aplicación', 'string');
