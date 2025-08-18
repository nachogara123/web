-- Performance indexes
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol_id);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

CREATE INDEX idx_equipos_supervisor ON equipos(id_supervisor);
CREATE INDEX idx_equipos_tipo ON equipos(tipo);

CREATE INDEX idx_planes_trabajo_equipo ON planes_trabajo(id_equipo);
CREATE INDEX idx_planes_trabajo_fecha ON planes_trabajo(fecha_inicio, fecha_fin);
CREATE INDEX idx_planes_trabajo_estado ON planes_trabajo(estado);

CREATE INDEX idx_direcciones_geom ON direcciones USING GIST(geom);
CREATE INDEX idx_direcciones_comuna ON direcciones(id_comuna);
CREATE INDEX idx_direcciones_estado ON direcciones(id_estado);
CREATE INDEX idx_direcciones_canal ON direcciones(id_canal);

CREATE INDEX idx_historial_ubicaciones_usuario ON historial_ubicaciones(id_usuario);
CREATE INDEX idx_historial_ubicaciones_fecha ON historial_ubicaciones(fecha_hora);
CREATE INDEX idx_historial_ubicaciones_geom ON historial_ubicaciones USING GIST(geom);

CREATE INDEX idx_rutas_sugeridas_geom ON rutas_sugeridas USING GIST(geom);
CREATE INDEX idx_rutas_sugeridas_prioridad ON rutas_sugeridas(prioridad);

CREATE INDEX idx_zonas_prioritarias_geom ON zonas_prioritarias USING GIST(geom);
CREATE INDEX idx_zonas_asignadas_geom ON zonas_asignadas USING GIST(geom);
CREATE INDEX idx_zonas_asignadas_usuario ON zonas_asignadas(id_usuario);

CREATE INDEX idx_comentarios_direccion ON historias_comentarios(id_direccion);
CREATE INDEX idx_comentarios_usuario ON historias_comentarios(id_usuario);
CREATE INDEX idx_comentarios_fecha ON historias_comentarios(fecha_comentario);

CREATE INDEX idx_notificaciones_usuario ON notificaciones(id_usuario);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_fecha ON notificaciones(created_at);

CREATE INDEX idx_auditoria_tabla ON auditoria(tabla);
CREATE INDEX idx_auditoria_usuario ON auditoria(id_usuario);
CREATE INDEX idx_auditoria_fecha ON auditoria(created_at);
