-- Enhanced database schema with improvements
-- Core user management
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Roles table
CREATE TABLE roles (
  id_rol UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  permisos JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE usuarios (
  id_user UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  clave TEXT NOT NULL,
  telefono VARCHAR(20),
  avatar_url TEXT,
  rol_id UUID REFERENCES roles(id_rol),
  activo BOOLEAN DEFAULT true,
  ultimo_acceso TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE equipos (
  id_equipo UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  descripcion TEXT,
  fecha_creacion DATE DEFAULT CURRENT_DATE,
  id_supervisor UUID REFERENCES usuarios(id_user),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-team relationships
CREATE TABLE usuarios_equipos (
  id_usuario UUID REFERENCES usuarios(id_user) ON DELETE CASCADE,
  id_equipo UUID REFERENCES equipos(id_equipo) ON DELETE CASCADE,
  fecha_asignacion DATE DEFAULT CURRENT_DATE,
  rol_en_equipo VARCHAR(50) DEFAULT 'miembro',
  activo BOOLEAN DEFAULT true,
  PRIMARY KEY (id_usuario, id_equipo)
);

-- Work plans
CREATE TABLE planes_trabajo (
  id_plan UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_equipo UUID REFERENCES equipos(id_equipo),
  semana INTEGER NOT NULL,
  año INTEGER NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  objetivos TEXT,
  estado VARCHAR(50) DEFAULT 'planificado',
  progreso INTEGER DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
  creado_por UUID REFERENCES usuarios(id_user),
  actualizado_por UUID REFERENCES usuarios(id_user),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Geographic tables
CREATE TABLE rutas_sugeridas (
  id_ruta UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  geom GEOMETRY(Polygon, 4326),
  prioridad INTEGER DEFAULT 1 CHECK (prioridad >= 1 AND prioridad <= 5),
  distancia_km DECIMAL(10,2),
  tiempo_estimado_horas DECIMAL(5,2),
  id_usuario UUID REFERENCES usuarios(id_user),
  estado VARCHAR(50) DEFAULT 'propuesta',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE zonas_prioritarias (
  id_zona UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  geom GEOMETRY(Polygon, 4326),
  nivel_prioridad INTEGER DEFAULT 1 CHECK (nivel_prioridad >= 1 AND nivel_prioridad <= 5),
  color_hex VARCHAR(7) DEFAULT '#FF0000',
  id_usuario UUID REFERENCES usuarios(id_user),
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE zonas_asignadas (
  id_zona UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario UUID REFERENCES usuarios(id_user),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  geom GEOMETRY(Polygon, 4326),
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_vencimiento DATE,
  estado VARCHAR(50) DEFAULT 'asignada'
);

-- Location tracking
CREATE TABLE historial_ubicaciones (
  id_historial UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario UUID REFERENCES usuarios(id_user),
  fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  geom GEOMETRY(Point, 4326),
  precision_metros DECIMAL(8,2),
  velocidad_kmh DECIMAL(6,2),
  direccion_grados INTEGER CHECK (direccion_grados >= 0 AND direccion_grados <= 360)
);

-- Catalog tables
CREATE TABLE canales (
  id_canal SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true
);

CREATE TABLE comunas (
  id_comuna SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  codigo_postal VARCHAR(10),
  region VARCHAR(100)
);

CREATE TABLE estados_direccion (
  id_estado SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  color_hex VARCHAR(7) DEFAULT '#808080'
);

CREATE TABLE tipos_vivienda (
  id_tipo_vivienda SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT
);

CREATE TABLE clasificaciones (
  id_clasificacion SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  prioridad INTEGER DEFAULT 1
);

-- Addresses table
CREATE TABLE direcciones (
  id_direccion SERIAL PRIMARY KEY,
  direccion_final TEXT NOT NULL,
  lon DOUBLE PRECISION,
  lat DOUBLE PRECISION,
  id_canal INTEGER REFERENCES canales(id_canal),
  id_comuna INTEGER REFERENCES comunas(id_comuna),
  id_tipo_vivienda INTEGER REFERENCES tipos_vivienda(id_tipo_vivienda),
  nota VARCHAR(500),
  hub_feeder_zona VARCHAR(100),
  id_cto VARCHAR(100),
  id_estado INTEGER REFERENCES estados_direccion(id_estado),
  id_clasificacion INTEGER REFERENCES clasificaciones(id_clasificacion),
  contador INTEGER DEFAULT 0,
  total_comentarios INTEGER DEFAULT 0,
  geom GEOMETRY(Point, 4326),
  verificada BOOLEAN DEFAULT false,
  fecha_verificacion TIMESTAMP,
  verificada_por UUID REFERENCES usuarios(id_user),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments system
CREATE TABLE comentarios_pre (
  id_coment UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comentario VARCHAR(1000) NOT NULL,
  tipo_feedback VARCHAR(50) DEFAULT 'neutro' CHECK (tipo_feedback IN ('positivo', 'negativo', 'neutro')),
  categoria VARCHAR(50) DEFAULT 'otro' CHECK (categoria IN ('producto', 'servicio', 'logistica', 'tecnico', 'otro')),
  prioridad INTEGER DEFAULT 1 CHECK (prioridad >= 1 AND prioridad <= 5),
  resuelto BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  creado_por UUID REFERENCES usuarios(id_user)
);

CREATE TABLE historias_comentarios (
  id_histo UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_direccion INTEGER REFERENCES direcciones(id_direccion),
  id_comentario UUID REFERENCES comentarios_pre(id_coment),
  id_usuario UUID REFERENCES usuarios(id_user),
  fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(50) DEFAULT 'activo'
);

-- Additional improvements: Notifications system
CREATE TABLE notificaciones (
  id_notificacion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario UUID REFERENCES usuarios(id_user),
  titulo VARCHAR(200) NOT NULL,
  mensaje TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'info' CHECK (tipo IN ('info', 'warning', 'error', 'success')),
  leida BOOLEAN DEFAULT false,
  url_accion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System configuration
CREATE TABLE configuraciones_sistema (
  id_config UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT,
  descripcion TEXT,
  tipo_dato VARCHAR(20) DEFAULT 'string' CHECK (tipo_dato IN ('string', 'number', 'boolean', 'json')),
  updated_by UUID REFERENCES usuarios(id_user),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit trail
CREATE TABLE auditoria (
  id_auditoria UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tabla VARCHAR(100) NOT NULL,
  id_registro TEXT NOT NULL,
  accion VARCHAR(20) NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  id_usuario UUID REFERENCES usuarios(id_user),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
