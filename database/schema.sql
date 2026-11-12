-- =====================================================================
-- FOODTECH: Sistema Integral de Gestión de Restaurantes en Tiempo Real
-- UNICEN - Carrera de Innovación Digital e IA
-- Base de Datos: unicen_app (MySQL 8.x)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS unicen_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE unicen_app;

-- 1. Tabla: usuarios (Personal con roles admin, cajero, cocina)
DROP TABLE IF EXISTS detalle_pedidos;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS lista_espera;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS mesas;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'cajero', 'cocina') NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_usuarios_rol (rol),
  INDEX idx_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla: mesas (Gestión de mesas y QR para acceso de clientes)
CREATE TABLE mesas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero INT UNSIGNED NOT NULL UNIQUE,
  capacidad INT UNSIGNED NOT NULL DEFAULT 4,
  estado ENUM('disponible', 'ocupada', 'reservada', 'inactiva') NOT NULL DEFAULT 'disponible',
  ubicacion VARCHAR(50) NOT NULL DEFAULT 'Salón Principal',
  qr_token VARCHAR(64) DEFAULT NULL UNIQUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_mesas_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla: categorias (Agrupación del menú gastronómico)
CREATE TABLE categorias (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT DEFAULT NULL,
  icono VARCHAR(50) DEFAULT NULL,
  orden INT NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabla: productos (Catálogo de platos y bebidas)
CREATE TABLE productos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  precio DECIMAL(10,2) NOT NULL,
  imagen_url VARCHAR(255) DEFAULT NULL,
  disponible BOOLEAN NOT NULL DEFAULT TRUE,
  tiempo_estimado_min INT UNSIGNED NOT NULL DEFAULT 15,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id)
    REFERENCES categorias(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_productos_categoria (categoria_id),
  INDEX idx_productos_disponible (disponible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabla: pedidos (Máquina de estados en tiempo real)
CREATE TABLE pedidos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mesa_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED DEFAULT NULL,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  estado ENUM('pendiente', 'en_proceso', 'terminado', 'entregado', 'pagado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  metodo_pago ENUM('efectivo', 'tarjeta', 'qr', 'transferencia') DEFAULT NULL,
  notas TEXT DEFAULT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pedidos_mesa FOREIGN KEY (mesa_id)
    REFERENCES mesas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pedidos_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_pedidos_mesa (mesa_id),
  INDEX idx_pedidos_estado (estado),
  INDEX idx_pedidos_creado (creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabla: detalle_pedidos (Snapshot de precio unitario y cantidad)
CREATE TABLE detalle_pedidos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT UNSIGNED NOT NULL,
  producto_id INT UNSIGNED NOT NULL,
  cantidad INT UNSIGNED NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  notas VARCHAR(255) DEFAULT NULL,
  CONSTRAINT fk_detalle_pedido FOREIGN KEY (pedido_id)
    REFERENCES pedidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id)
    REFERENCES productos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_detalle_pedido (pedido_id),
  INDEX idx_detalle_producto (producto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabla: reservas (Planificación de visitas y ocupación de mesas)
CREATE TABLE reservas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mesa_id INT UNSIGNED NOT NULL,
  cliente_nombre VARCHAR(150) NOT NULL,
  cliente_telefono VARCHAR(50) NOT NULL,
  cliente_email VARCHAR(150) DEFAULT NULL,
  num_personas INT UNSIGNED NOT NULL DEFAULT 2,
  fecha_hora DATETIME NOT NULL,
  estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') NOT NULL DEFAULT 'pendiente',
  notas TEXT DEFAULT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reservas_mesa FOREIGN KEY (mesa_id)
    REFERENCES mesas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_reservas_fecha_estado (fecha_hora, estado),
  INDEX idx_reservas_mesa (mesa_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabla: lista_espera (Turnos y rotación de salón)
CREATE TABLE lista_espera (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cliente_nombre VARCHAR(150) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  num_personas INT UNSIGNED NOT NULL DEFAULT 2,
  posicion INT NOT NULL DEFAULT 1,
  estado ENUM('esperando', 'notificado', 'sentado', 'cancelado') NOT NULL DEFAULT 'esperando',
  mesa_asignada_id INT UNSIGNED DEFAULT NULL,
  hora_llegada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tiempo_estimado_espera INT UNSIGNED NOT NULL DEFAULT 20,
  notas TEXT DEFAULT NULL,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_lista_espera_mesa FOREIGN KEY (mesa_asignada_id)
    REFERENCES mesas(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_lista_espera_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
