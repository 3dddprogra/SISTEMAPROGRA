# ============================================
# FOODTECH - Generador de Proyecto Completo
# ============================================

$ProjectDir = "foodtech"

Write-Host "🍽️ Creando estructura del proyecto FOODTECH..." -ForegroundColor Green

# Crear carpetas
$folders = @(
    "$ProjectDir/database",
    "$ProjectDir/backend/src/config",
    "$ProjectDir/backend/src/middleware",
    "$ProjectDir/backend/src/routes/v1",
    "$ProjectDir/backend/src/controllers",
    "$ProjectDir/backend/src/services",
    "$ProjectDir/backend/src/repositories",
    "$ProjectDir/backend/src/sockets",
    "$ProjectDir/backend/src/utils",
    "$ProjectDir/backend/src/types",
    "$ProjectDir/frontend/src/hooks",
    "$ProjectDir/frontend/src/services",
    "$ProjectDir/frontend/src/pages/cliente",
    "$ProjectDir/frontend/src/pages/kds",
    "$ProjectDir/frontend/src/pages/caja",
    "$ProjectDir/frontend/src/components/cliente",
    "$ProjectDir/frontend/src/components/kds",
    "$ProjectDir/frontend/src/components/caja",
    "$ProjectDir/frontend/src/components/common",
    "$ProjectDir/frontend/src/types"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

Write-Host "✅ Estructura de carpetas creada" -ForegroundColor Green

# ============================================
# 1. CONFIGURACIÓN COMPARTIDA
# ============================================

$configEnv = @"
# ============================================
# FOODTECH - Configuración Compartida
# ============================================

# IPs de las VMs (red solo-anfitrión VirtualBox)
VM_DB_IP=192.168.56.10
VM_BACKEND_IP=192.168.56.11
VM_FRONTEND_IP=192.168.56.12

# Base de datos
DB_HOST=192.168.56.10
DB_PORT=3306
DB_NAME=unicen_app
DB_USER=foodtech_user
DB_PASSWORD=FoodTech2026!Secure

# JWT
JWT_SECRET=foodtech_jwt_super_secret_key_2026_unicen_cochabamba
JWT_EXPIRES_IN=8h

# Servidor
BACKEND_PORT=3000
FRONTEND_PORT=5173

# Node environment
NODE_ENV=production
"@

Set-Content -Path "$ProjectDir/config.env" -Value $configEnv -Encoding UTF8
Write-Host "✅ config.env creado" -ForegroundColor Green

# ============================================
# 2. BASE DE DATOS - schema.sql
# ============================================

$schemaSql = @"
-- ============================================
-- FOODTECH - Schema de Base de Datos
-- MySQL 8.x - Base: unicen_app
-- ============================================

DROP DATABASE IF EXISTS unicen_app;
CREATE DATABASE unicen_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE unicen_app;

CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'cajero', 'cocina') NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_usuarios_rol (rol),
  INDEX idx_usuarios_email (email)
) ENGINE=InnoDB;

CREATE TABLE categorias (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion VARCHAR(255) DEFAULT NULL,
  icono VARCHAR(50) DEFAULT NULL,
  orden INT DEFAULT 0,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE productos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  precio DECIMAL(10,2) NOT NULL,
  imagen_url VARCHAR(255) DEFAULT NULL,
  disponible BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_productos_categoria (categoria_id),
  INDEX idx_productos_disponible (disponible)
) ENGINE=InnoDB;

CREATE TABLE mesas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero INT NOT NULL UNIQUE,
  capacidad INT NOT NULL DEFAULT 4,
  estado ENUM('libre', 'ocupada', 'reservada', 'en_espera') NOT NULL DEFAULT 'libre',
  qr_token VARCHAR(64) DEFAULT NULL UNIQUE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_mesas_estado (estado),
  INDEX idx_mesas_qr (qr_token)
) ENGINE=InnoDB;

CREATE TABLE pedidos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mesa_id INT UNSIGNED NOT NULL,
  estado ENUM('pendiente', 'en_proceso', 'terminado', 'entregado', 'pagado', 'cancelado') NOT NULL DEFAULT 'pendiente',
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  notas TEXT DEFAULT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_pedidos_mesa (mesa_id),
  INDEX idx_pedidos_estado (estado),
  INDEX idx_pedidos_creado (creado_en)
) ENGINE=InnoDB;

CREATE TABLE detalle_pedidos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT UNSIGNED NOT NULL,
  producto_id INT UNSIGNED NOT NULL,
  cantidad INT UNSIGNED NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  notas TEXT DEFAULT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_detalle_pedido (pedido_id),
  INDEX idx_detalle_producto (producto_id)
) ENGINE=InnoDB;

CREATE TABLE reservas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre_cliente VARCHAR(150) NOT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  personas INT NOT NULL DEFAULT 2,
  mesa_id INT UNSIGNED DEFAULT NULL,
  fecha_reserva DATE NOT NULL,
  hora_reserva TIME NOT NULL,
  estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') NOT NULL DEFAULT 'pendiente',
  notas TEXT DEFAULT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_reservas_fecha (fecha_reserva),
  INDEX idx_reservas_estado (estado),
  INDEX idx_reservas_mesa (mesa_id)
) ENGINE=InnoDB;

CREATE TABLE lista_espera (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre_cliente VARCHAR(150) NOT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  personas INT NOT NULL DEFAULT 2,
  posicion INT NOT NULL,
  estado ENUM('esperando', 'notificado', 'asignado', 'cancelado') NOT NULL DEFAULT 'esperando',
  mesa_asignada_id INT UNSIGNED DEFAULT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mesa_asignada_id) REFERENCES mesas(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_lista_espera_estado (estado),
  INDEX idx_lista_espera_posicion (posicion)
) ENGINE=InnoDB;

CREATE TABLE facturas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT UNSIGNED NOT NULL UNIQUE,
  numero_factura VARCHAR(50) NOT NULL UNIQUE,
  monto_total DECIMAL(10,2) NOT NULL,
  metodo_pago ENUM('efectivo', 'tarjeta', 'qr', 'transferencia') NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_facturas_pedido (pedido_id),
  INDEX idx_facturas_numero (numero_factura)
) ENGINE=InnoDB;
"@

Set-Content -Path "$ProjectDir/database/schema.sql" -Value $schemaSql -Encoding UTF8
Write-Host "✅ database/schema.sql creado" -ForegroundColor Green

# ============================================
# 3. BASE DE DATOS - seed.sql
# ============================================

$seedSql = @"
USE unicen_app;

INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Administrador General', 'admin@foodtech.bo', '`$2a`$10`$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
('Maria Cajera', 'cajero@foodtech.bo', '`$2a`$10`$YQ5VJQ5VJQ5VJQ5VJQ5VJQ5VJQ5VJQ5VJQ5VJQ5VJQ5VJQ5VJQ5', 'cajero'),
('Carlos Cocinero', 'cocina@foodtech.bo', '`$2a`$10`$KC5KC5KC5KC5KC5KC5KC5KC5KC5KC5KC5KC5KC5KC5KC5KC5KC5', 'cocina');

INSERT INTO categorias (nombre, descripcion, icono, orden) VALUES
('Entradas', 'Para comenzar la experiencia', '🥗', 1),
('Platos Fuertes', 'Platos principales del menu', '🍽️', 2),
('Bebidas', 'Bebidas frias y calientes', '🥤', 3),
('Postres', 'El cierre perfecto', '🍰', 4);

INSERT INTO productos (categoria_id, nombre, descripcion, precio, imagen_url) VALUES
(1, 'Empanadas Saltenas', 'Empanadas tradicionales cochabambinas, 3 unidades', 15.00, '/img/empanadas.jpg'),
(1, 'Anticucho de Res', 'Brochetas de res con papas y salsa de mani', 22.00, '/img/anticucho.jpg'),
(1, 'Ensalada Cesar', 'Lechuga romana, crutones, parmesano y aderezo cesar', 18.00, '/img/ensalada.jpg'),
(1, 'Sopa de Mani', 'Sopa tradicional con papas fritas y queso', 12.00, '/img/sopa.jpg'),
(2, 'Silpancho Cochabambino', 'Carne apanada con arroz, papa y huevo frito', 35.00, '/img/silpancho.jpg'),
(2, 'Pique a lo Macho', 'Carne, salchicha, papas, locoto y huevo', 45.00, '/img/pique.jpg'),
(2, 'Saice Tarijeno', 'Carne molida con arroz, papa y ensalada', 38.00, '/img/saice.jpg'),
(2, 'Trucha Frita', 'Trucha del lago con arroz y patacones', 42.00, '/img/trucha.jpg'),
(2, 'Lomo Montado', 'Lomo de res con huevo frito, arroz y platano', 40.00, '/img/lomo.jpg'),
(3, 'Chicha Morada', 'Bebida tradicional de maiz morado, 500ml', 8.00, '/img/chicha.jpg'),
(3, 'Mocochinchi', 'Bebida de durazno deshidratado, 500ml', 7.00, '/img/mocochinchi.jpg'),
(3, 'Limonada Natural', 'Limonada fresca con hierbabuena, 500ml', 10.00, '/img/limonada.jpg'),
(3, 'Cafe Americano', 'Cafe recien pasado, taza grande', 12.00, '/img/cafe.jpg'),
(4, 'Helado de Canchita', 'Helado artesanal de maiz tostado', 15.00, '/img/helado.jpg'),
(4, 'Tarta de Queso', 'Cheesecake con frutos rojos', 18.00, '/img/tarta.jpg');

INSERT INTO mesas (numero, capacidad, estado, qr_token) VALUES
(1, 2, 'libre', 'qr_mesa_001_a1b2c3d4e5f6'),
(2, 2, 'libre', 'qr_mesa_002_b2c3d4e5f6a1'),
(3, 4, 'libre', 'qr_mesa_003_c3d4e5f6a1b2'),
(4, 4, 'libre', 'qr_mesa_004_d4e5f6a1b2c3'),
(5, 6, 'libre', 'qr_mesa_005_e5f6a1b2c3d4'),
(6, 6, 'libre', 'qr_mesa_006_f6a1b2c3d4e5'),
(7, 8, 'libre', 'qr_mesa_007_a1b2c3d4e5f7'),
(8, 8, 'libre', 'qr_mesa_008_b2c3d4e5f7a1');
"@

Set-Content -Path "$ProjectDir/database/seed.sql" -Value $seedSql -Encoding UTF8
Write-Host "✅ database/seed.sql creado" -ForegroundColor Green

# ============================================
# 4. BACKEND - package.json
# ============================================

$backendPackageJson = @"
{
  "name": "foodtech-backend",
  "version": "1.0.0",
  "description": "FoodTech Backend API - UNICEN",
  "main": "dist/app.js",
  "scripts": {
    "dev": "tsx watch src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "express": "^4.21.0",
    "express-rate-limit": "^7.4.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mysql2": "^3.11.0",
    "socket.io": "^4.7.5",
    "zod": "^3.23.8",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/node": "^20.14.0",
    "supertest": "^7.0.0",
    "@types/supertest": "^6.0.2",
    "tsx": "^4.19.0",
    "typescript": "^5.5.0",
    "vitest": "^2.0.0"
  }
}
"@

Set-Content -Path "$ProjectDir/backend/package.json" -Value $backendPackageJson -Encoding UTF8
Write-Host "✅ backend/package.json creado" -ForegroundColor Green

# ============================================
# 5. BACKEND - tsconfig.json
# ============================================

$tsconfigJson = @"
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
"@

Set-Content -Path "$ProjectDir/backend/tsconfig.json" -Value $tsconfigJson -Encoding UTF8
Write-Host "✅ backend/tsconfig.json creado" -ForegroundColor Green

# ============================================
# 6. FRONTEND - package.json
# ============================================

$frontendPackageJson = @"
{
  "name": "foodtech-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc && vite build",
    "preview": "vite preview --host 0.0.0.0"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "socket.io-client": "^4.7.5",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.10",
    "typescript": "^5.5.0",
    "vite": "^5.4.0"
  }
}
"@

Set-Content -Path "$ProjectDir/frontend/package.json" -Value $frontendPackageJson -Encoding UTF8
Write-Host "✅ frontend/package.json creado" -ForegroundColor Green

# ============================================
# 7. FRONTEND - vite.config.ts
# ============================================

$viteConfig = @"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.56.11:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://192.168.56.11:3000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
"@

Set-Content -Path "$ProjectDir/frontend/vite.config.ts" -Value $viteConfig -Encoding UTF8
Write-Host "✅ frontend/vite.config.ts creado" -ForegroundColor Green

# ============================================
# 8. FRONTEND - tailwind.config.js
# ============================================

$tailwindConfig = @"
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eff6ff', 100: '#dbeafe', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
        success: { 50: '#f0fdf4', 500: '#22c55e', 600: '#16a34a' },
        warning: { 50: '#fffbeb', 500: '#f59e0b', 600: '#d97706' },
        danger: { 50: '#fef2f2', 500: '#ef4444', 600: '#dc2626' },
      },
    },
  },
  plugins: [],
};
"@

Set-Content -Path "$ProjectDir/frontend/tailwind.config.js" -Value $tailwindConfig -Encoding UTF8
Write-Host "✅ frontend/tailwind.config.js creado" -ForegroundColor Green

# ============================================
# 9. FRONTEND - postcss.config.js
# ============================================

$postcssConfig = @"
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
"@

Set-Content -Path "$ProjectDir/frontend/postcss.config.js" -Value $postcssConfig -Encoding UTF8
Write-Host "✅ frontend/postcss.config.js creado" -ForegroundColor Green

# ============================================
# 10. FRONTEND - tsconfig.json
# ============================================

$frontendTsconfig = @"
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
"@

Set-Content -Path "$ProjectDir/frontend/tsconfig.json" -Value $frontendTsconfig -Encoding UTF8
Write-Host "✅ frontend/tsconfig.json creado" -ForegroundColor Green

# ============================================
# 11. FRONTEND - tsconfig.node.json
# ============================================

$tsconfigNode = @"
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
"@

Set-Content -Path "$ProjectDir/frontend/tsconfig.node.json" -Value $tsconfigNode -Encoding UTF8
Write-Host "✅ frontend/tsconfig.node.json creado" -ForegroundColor Green

# ============================================
# 12. FRONTEND - index.html
# ============================================

$indexHtml = @"
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FoodTech - UNICEN</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍽️</text></svg>" />
</head>
<body class="bg-gray-50">
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
"@

Set-Content -Path "$ProjectDir/frontend/index.html" -Value $indexHtml -Encoding UTF8
Write-Host "✅ frontend/index.html creado" -ForegroundColor Green

# ============================================
# 13. FRONTEND - src/index.css
# ============================================

$indexCss = @"
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
  }
  .btn-success {
    @apply bg-success-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-success-500 transition-colors;
  }
  .btn-danger {
    @apply bg-danger-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-danger-500 transition-colors;
  }
  .btn-warning {
    @apply bg-warning-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-warning-500 transition-colors;
  }
  .btn-secondary {
    @apply bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors;
  }
  .card {
    @apply bg-white rounded-xl shadow-sm border border-gray-200 p-4;
  }
  .input-field {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all;
  }
}
"@

Set-Content -Path "$ProjectDir/frontend/src/index.css" -Value $indexCss -Encoding UTF8
Write-Host "✅ frontend/src/index.css creado" -ForegroundColor Green

# ============================================
# 14. FRONTEND - src/vite-env.d.ts
# ============================================

$viteEnvDts = @"
/// <reference types="vite/client" />
"@

Set-Content -Path "$ProjectDir/frontend/src/vite-env.d.ts" -Value $viteEnvDts -Encoding UTF8
Write-Host "✅ frontend/src/vite-env.d.ts creado" -ForegroundColor Green

# ============================================
# 15. FRONTEND - src/types/index.ts
# ============================================

$typesIndex = @"
export type RolUsuario = 'admin' | 'cajero' | 'cocina';
export type EstadoPedido = 'pendiente' | 'en_proceso' | 'terminado' | 'entregado' | 'pagado' | 'cancelado';
export type EstadoMesa = 'libre' | 'ocupada' | 'reservada' | 'en_espera';
export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
export type MetodoPago = 'efectivo' | 'tarjeta' | 'qr' | 'transferencia';

export interface Usuario { id: number; nombre: string; email: string; rol: RolUsuario; }
export interface Categoria { id: number; nombre: string; descripcion: string | null; icono: string | null; orden: number; }
export interface Producto { id: number; categoria_id: number; nombre: string; descripcion: string | null; precio: number; imagen_url: string | null; disponible: boolean; }
export interface Mesa { id: number; numero: number; capacidad: number; estado: EstadoMesa; qr_token: string | null; }
export interface DetallePedido { id: number; producto_id: number; cantidad: number; precio_unitario: number; subtotal: number; notas: string | null; producto_nombre?: string; }
export interface Pedido { id: number; mesa_id: number; estado: EstadoPedido; total: number; notas: string | null; creado_en: string; detalles?: DetallePedido[]; mesa_numero?: number; }
export interface Reserva { id: number; nombre_cliente: string; telefono: string | null; personas: number; mesa_id: number | null; fecha_reserva: string; hora_reserva: string; estado: EstadoReserva; notas: string | null; }
export interface ListaEspera { id: number; nombre_cliente: string; telefono: string | null; personas: number; posicion: number; estado: string; mesa_asignada_id: number | null; }

export interface ApiResponse<T = unknown> { success: boolean; data?: T; error?: string; message?: string; }
export interface CartItem { producto: Producto; cantidad: number; notas?: string; }
"@

Set-Content -Path "$ProjectDir/frontend/src/types/index.ts" -Value $typesIndex -Encoding UTF8
Write-Host "✅ frontend/src/types/index.ts creado" -ForegroundColor Green

# ============================================
# 16. FRONTEND - src/main.tsx
# ============================================

$mainTsx = @"
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
"@

Set-Content -Path "$ProjectDir/frontend/src/main.tsx" -Value $mainTsx -Encoding UTF8
Write-Host "✅ frontend/src/main.tsx creado" -ForegroundColor Green

# ============================================
# 17. FRONTEND - src/App.tsx
# ============================================

$appTsx = @"
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Cliente from './pages/Cliente';
import KDS from './pages/KDS';
import Caja from './pages/Caja';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/m/:mesaId" element={<Cliente />} />
      <Route
        path="/kds"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cocina']}>
            <KDS />
          </ProtectedRoute>
        }
      />
      <Route
        path="/caja"
        element={
          <ProtectedRoute allowedRoles={['admin', 'cajero']}>
            <Caja />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
"@

Set-Content -Path "$ProjectDir/frontend/src/App.tsx" -Value $appTsx -Encoding UTF8
Write-Host "✅ frontend/src/App.tsx creado" -ForegroundColor Green

# ============================================
# 18. FRONTEND - src/services/api.ts
# ============================================

$apiTs = @"
import type { ApiResponse } from '../types';

const API_BASE = '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Error en la solicitud');
  }

  return data.data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: number; email: string; rol: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMesaToken: (qrToken: string) =>
    request<{ mesaId: number; token: string; mesaNumero: number }>(`/auth/mesa/${qrToken}`),

  getProductos: () => request<any[]>('/productos'),
  getProductosByCategoria: (categoriaId: number) => request<any[]>(`/productos/categoria/${categoriaId}`),
  getCategorias: () => request<any[]>('/categorias'),
  getMesas: () => request<any[]>('/mesas'),
  getMesasLibres: () => request<any[]>('/mesas/libres'),

  crearPedido: (items: { productoId: number; cantidad: number; notas?: string }[], notas?: string) =>
    request<{ pedidoId: number }>('/pedidos', {
      method: 'POST',
      body: JSON.stringify({ items, notas }),
    }),

  getPedidosActivos: () => request<any[]>('/pedidos/activos'),
  getPedidosByEstado: (estado: string) => request<any[]>(`/pedidos/estado/${estado}`),
  cambiarEstadoPedido: (id: number, estado: string) =>
    request<void>(`/pedidos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    }),
  getPedidosByMesa: (mesaId: number) => request<any[]>(`/pedidos/mesa/${mesaId}`),

  getReservas: () => request<any[]>('/reservas'),
  crearReserva: (data: any) =>
    request<{ id: number }>('/reservas', { method: 'POST', body: JSON.stringify(data) }),
  cambiarEstadoReserva: (id: number, estado: string) =>
    request<void>(`/reservas/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado }) }),

  getListaEspera: () => request<any[]>('/lista-espera'),
  agregarListaEspera: (data: { nombre: string; telefono?: string; personas: number }) =>
    request<{ id: number }>('/lista-espera', { method: 'POST', body: JSON.stringify(data) }),
  asignarMesaEspera: (id: number, mesaId: number) =>
    request<void>(`/lista-espera/${id}/asignar`, { method: 'POST', body: JSON.stringify({ mesaId }) }),
  cancelarListaEspera: (id: number) =>
    request<void>(`/lista-espera/${id}/cancelar`, { method: 'POST' }),

  procesarPago: (pedidoId: number, metodoPago: string) =>
    request<any>('/facturacion/pagar', { method: 'POST', body: JSON.stringify({ pedidoId, metodoPago }) }),
  getResumenDiario: (fecha?: string) =>
    request<any>(`/facturacion/resumen${fecha ? `?fecha=${fecha}` : ''}`),
};
"@

Set-Content -Path "$ProjectDir/frontend/src/services/api.ts" -Value $apiTs -Encoding UTF8
Write-Host "✅ frontend/src/services/api.ts creado" -ForegroundColor Green

# ============================================
# 19. FRONTEND - src/services/socket.ts
# ============================================

$socketTs = @"
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => {
      console.log('[Socket] Conectado:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Desconectado');
    });

    socket.on('reconnect', (attempt) => {
      console.log(`[Socket] Reconectado despues de ${attempt} intentos`);
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
"@

Set-Content -Path "$ProjectDir/frontend/src/services/socket.ts" -Value $socketTs -Encoding UTF8
Write-Host "✅ frontend/src/services/socket.ts creado" -ForegroundColor Green

# ============================================
# 20. FRONTEND - src/hooks/useApi.ts
# ============================================

$useApiTs = @"
import { useState, useEffect, useCallback } from 'react';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
"@

Set-Content -Path "$ProjectDir/frontend/src/hooks/useApi.ts" -Value $useApiTs -Encoding UTF8
Write-Host "✅ frontend/src/hooks/useApi.ts creado" -ForegroundColor Green

# ============================================
# 21. FRONTEND - src/hooks/useSocket.ts
# ============================================

$useSocketTs = @"
import { useEffect } from 'react';
import { getSocket } from '../services/socket';
import type { Socket } from 'socket.io-client';

export function useSocket(event: string, callback: (data: unknown) => void, deps: unknown[] = []): void {
  useEffect(() => {
    const socket = getSocket();
    socket.on(event, callback);
    return () => {
      socket.off(event, callback);
    };
  }, [event, callback, ...deps]);
}

export function joinRoom(room: string): void {
  const socket = getSocket();
  socket.emit(`join:${room}`, room.includes(':') ? room.split(':')[1] : undefined);
}

export function leaveRoom(room: string): void {
  const socket = getSocket();
  socket.emit(`leave:${room}`, room.includes(':') ? room.split(':')[1] : undefined);
}
"@

Set-Content -Path "$ProjectDir/frontend/src/hooks/useSocket.ts" -Value $useSocketTs -Encoding UTF8
Write-Host "✅ frontend/src/hooks/useSocket.ts creado" -ForegroundColor Green

# ============================================
# 22. FRONTEND - src/pages/Login.tsx
# ============================================

$loginTsx = @"
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login(email, password);
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('auth_user', JSON.stringify(result.user));

      if (result.user.rol === 'cocina') {
        navigate('/kds');
      } else {
        navigate('/caja');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticacion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800">
      <div className="card w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="text-6xl mb-2">🍽️</div>
          <h1 className="text-2xl font-bold text-gray-900">FoodTech</h1>
          <p className="text-gray-500 text-sm">Sistema de Gestion de Restaurantes</p>
          <p className="text-gray-400 text-xs mt-1">UNICEN - Cochabamba</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-danger-50 text-danger-600 p-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="usuario@foodtech.bo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Ingresando...' : 'Iniciar Sesion'}
          </button>
        </form>

        <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p className="font-medium mb-1">Credenciales de prueba:</p>
          <p>Admin: admin@foodtech.bo / admin123</p>
          <p>Cajero: cajero@foodtech.bo / cajero123</p>
          <p>Cocina: cocina@foodtech.bo / cocina123</p>
        </div>
      </div>
    </div>
  );
}
"@

Set-Content -Path "$ProjectDir/frontend/src/pages/Login.tsx" -Value $loginTsx -Encoding UTF8
Write-Host "✅ frontend/src/pages/Login.tsx creado" -ForegroundColor Green

# ============================================
# 23. FRONTEND - src/pages/Cliente.tsx
# ============================================

$clienteTsx = @"
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import type { Producto, Categoria, CartItem, Pedido } from '../types';
import { joinRoom } from '../hooks/useSocket';

export default function Cliente() {
  const { mesaId } = useParams<{ mesaId: string }>();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<number | null>(null);
  const [carrito, setCarrito] = useState<CartItem[]>([]);
  const [pedidoActual, setPedidoActual] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mostrarCarrito, setMostrarCarrito] = useState(false);

  useEffect(() => {
    if (mesaId) {
      joinRoom(`mesa:${mesaId}`);
      cargarDatos();
      cargarPedidoActual();

      const socket = getSocket();
      socket.on('pedido:estado', (data: any) => {
        if (data.pedidoId === pedidoActual?.id) {
          setPedidoActual((prev) => prev ? { ...prev, estado: data.estado } : null);
        }
      });

      return () => {
        socket.off('pedido:estado');
      };
    }
  }, [mesaId]);

  const cargarDatos = async () => {
    try {
      const [cats, prods] = await Promise.all([
        api.getCategorias(),
        api.getProductos(),
      ]);
      setCategorias(cats);
      setProductos(prods);
      if (cats.length > 0) setCategoriaActiva(cats[0].id);
    } catch {
      setError('Error al cargar el menu');
    } finally {
      setLoading(false);
    }
  };

  const cargarPedidoActual = async () => {
    try {
      const pedidos = await api.getPedidosByMesa(parseInt(mesaId!));
      const activo = pedidos.find((p: Pedido) => !['pagado', 'cancelado'].includes(p.estado));
      if (activo) setPedidoActual(activo);
    } catch { /* sin pedido activo */ }
  };

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.producto.id === producto.id);
      if (existente) {
        return prev.map((item) =>
          item.producto.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (productoId: number, delta: number) => {
    setCarrito((prev) =>
      prev
        .map((item) =>
          item.producto.id === productoId ? { ...item, cantidad: item.cantidad + delta } : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const totalCarrito = carrito.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0);

  const confirmarPedido = async () => {
    if (carrito.length === 0) return;
    try {
      const items = carrito.map((item) => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        notas: item.notas,
      }));
      await api.crearPedido(items);
      setCarrito([]);
      setMostrarCarrito(false);
      await cargarPedidoActual();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear pedido');
    }
  };

  const productosFiltrados = categoriaActiva
    ? productos.filter((p) => p.categoria_id === categoriaActiva)
    : productos;

  const estadoLabels: Record<string, { label: string; color: string }> = {
    pendiente: { label: '⏳ Pendiente', color: 'bg-warning-500' },
    en_proceso: { label: '👨‍🍳 En proceso', color: 'bg-blue-500' },
    terminado: { label: '✅ Terminado', color: 'bg-success-500' },
    entregado: { label: '🍽️ Entregado', color: 'bg-primary-500' },
    pagado: { label: '💰 Pagado', color: 'bg-gray-500' },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">🍽️</div>
          <p className="text-gray-500">Cargando menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">🍽️ FoodTech</h1>
            <p className="text-xs text-gray-500">Mesa #{mesaId}</p>
          </div>
          {carrito.length > 0 && (
            <button
              onClick={() => setMostrarCarrito(true)}
              className="relative btn-primary text-sm"
            >
              🛒 Carrito
              <span className="absolute -top-2 -right-2 bg-danger-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {carrito.reduce((s, i) => s + i.cantidad, 0)}
              </span>
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="max-w-lg mx-auto px-4 mt-2">
          <div className="bg-danger-50 text-danger-600 p-3 rounded-lg text-sm">{error}</div>
        </div>
      )}

      {pedidoActual && !mostrarCarrito && (
        <div className="max-w-lg mx-auto px-4 mt-4">
          <div className="card border-l-4 border-primary-500">
            <h3 className="font-semibold text-sm mb-2">Pedido #{pedidoActual.id}</h3>
            <div className={`inline-block px-3 py-1 rounded-full text-white text-xs font-medium ${estadoLabels[pedidoActual.estado]?.color || 'bg-gray-500'}`}>
              {estadoLabels[pedidoActual.estado]?.label || pedidoActual.estado}
            </div>
            <p className="text-xs text-gray-500 mt-2">Total: Bs. {pedidoActual.total.toFixed(2)}</p>
          </div>
        </div>
      )}

      {!mostrarCarrito && (
        <div className="max-w-lg mx-auto px-4 mt-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoriaActiva(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  categoriaActiva === cat.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {cat.icono} {cat.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {!mostrarCarrito && (
        <div className="max-w-lg mx-auto px-4 mt-4 grid grid-cols-1 gap-3">
          {productosFiltrados.map((producto) => {
            const enCarrito = carrito.find((i) => i.producto.id === producto.id);
            return (
              <div key={producto.id} className="card flex items-center gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{producto.nombre}</h3>
                  {producto.descripcion && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{producto.descripcion}</p>
                  )}
                  <p className="text-primary-600 font-bold mt-1">Bs. {producto.precio.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {enCarrito && (
                    <>
                      <button
                        onClick={() => cambiarCantidad(producto.id, -1)}
                        className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium w-5 text-center">{enCarrito.cantidad}</span>
                    </>
                  )}
                  <button
                    onClick={() => agregarAlCarrito(producto)}
                    className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mostrarCarrito && (
        <div className="fixed inset-0 bg-black/50 z-20 flex items-end">
          <div className="bg-white w-full max-w-lg mx-auto rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Tu Pedido</h2>
              <button onClick={() => setMostrarCarrito(false)} className="text-gray-500 text-2xl">✕</button>
            </div>

            <div className="p-4 space-y-3">
              {carrito.length === 0 ? (
                <p className="text-center text-gray-500 py-8">El carrito esta vacio</p>
              ) : (
                carrito.map((item) => (
                  <div key={item.producto.id} className="flex items-center justify-between py-2 border-b">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.producto.nombre}</p>
                      <p className="text-xs text-gray-500">Bs. {item.producto.precio.toFixed(2)} c/u</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => cambiarCantidad(item.producto.id, -1)}
                        className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-sm"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium w-5 text-center">{item.cantidad}</span>
                      <button
                        onClick={() => cambiarCantidad(item.producto.id, 1)}
                        className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-sm ml-3">Bs. {(item.producto.precio * item.cantidad).toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>

            {carrito.length > 0 && (
              <div className="sticky bottom-0 bg-white border-t p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-primary-600">Bs. {totalCarrito.toFixed(2)}</span>
                </div>
                <button onClick={confirmarPedido} className="btn-success w-full text-lg py-3">
                  Confirmar Pedido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
"@

Set-Content -Path "$ProjectDir/frontend/src/pages/Cliente.tsx" -Value $clienteTsx -Encoding UTF8
Write-Host "✅ frontend/src/pages/Cliente.tsx creado" -ForegroundColor Green

# ============================================
# 24. FRONTEND - src/pages/KDS.tsx
# ============================================

$kdsTsx = @"
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import type { Pedido, EstadoPedido } from '../types';
import { joinRoom } from '../hooks/useSocket';

const COLUMNAS: { estado: EstadoPedido; label: string; color: string; nextEstado: EstadoPedido | null }[] = [
  { estado: 'pendiente', label: '🆕 Pendientes', color: 'border-warning-500', nextEstado: 'en_proceso' },
  { estado: 'en_proceso', label: '👨‍🍳 En Proceso', color: 'border-blue-500', nextEstado: 'terminado' },
  { estado: 'terminado', label: '✅ Terminados', color: 'border-success-500', nextEstado: 'entregado' },
];

export default function KDS() {
  const [pedidos, setPedidos] = useState<Record<EstadoPedido, Pedido[]>>({
    pendiente: [], en_proceso: [], terminado: [], entregado: [], pagado: [], cancelado: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    joinRoom('cocina');
    cargarPedidos();

    const socket = getSocket();

    socket.on('pedido:nuevo', (pedido: Pedido) => {
      setPedidos((prev) => ({
        ...prev,
        [pedido.estado]: [...prev[pedido.estado], pedido],
      }));
    });

    socket.on('pedido:estado', (data: { pedidoId: number; estado: EstadoPedido }) => {
      setPedidos((prev) => {
        const nuevo = { ...prev };
        for (const key of Object.keys(nuevo) as EstadoPedido[]) {
          nuevo[key] = nuevo[key].filter((p) => p.id !== data.pedidoId);
        }
        if (nuevo[data.estado]) {
          nuevo[data.estado] = [...nuevo[data.estado], { id: data.pedidoId, estado: data.estado } as Pedido];
        }
        return nuevo;
      });
    });

    return () => {
      socket.off('pedido:nuevo');
      socket.off('pedido:estado');
    };
  }, []);

  const cargarPedidos = async () => {
    try {
      const activos = await api.getPedidosActivos();
      const agrupados: Record<EstadoPedido, Pedido[]> = {
        pendiente: [], en_proceso: [], terminado: [], entregado: [], pagado: [], cancelado: [],
      };
      activos.forEach((p: Pedido) => {
        if (agrupados[p.estado]) agrupados[p.estado].push(p);
      });
      setPedidos(agrupados);
    } catch { /* error */ } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (pedidoId: number, nuevoEstado: EstadoPedido) => {
    try {
      await api.cambiarEstadoPedido(pedidoId, nuevoEstado);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  };

  const getTiempoTranscurrido = (creadoEn: string): { minutos: number; color: string } => {
    const minutos = Math.floor((Date.now() - new Date(creadoEn).getTime()) / 60000);
    let color = 'text-green-600';
    if (minutos > 15) color = 'text-red-600 animate-pulse';
    else if (minutos > 10) color = 'text-yellow-600';
    return { minutos, color };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">👨‍🍳</div>
          <p>Cargando KDS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👨‍🍳</span>
          <div>
            <h1 className="text-xl font-bold">Kitchen Display System</h1>
            <p className="text-xs text-gray-400">FoodTech - Cocina</p>
          </div>
        </div>
        <button onClick={cargarPedidos} className="btn-secondary text-sm">🔄 Actualizar</button>
      </header>

      <div className="grid grid-cols-3 gap-4 p-4 h-[calc(100vh-64px)]">
        {COLUMNAS.map((col) => (
          <div key={col.estado} className={`bg-gray-800 rounded-xl border-t-4 ${col.color} flex flex-col`}>
            <div className="p-3 border-b border-gray-700 flex items-center justify-between">
              <h2 className="font-bold text-sm">{col.label}</h2>
              <span className="bg-gray-700 text-xs px-2 py-1 rounded-full">
                {pedidos[col.estado]?.length || 0}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {(pedidos[col.estado] || []).map((pedido) => {
                const tiempo = getTiempoTranscurrido(pedido.creado_en);
                return (
                  <div key={pedido.id} className="bg-gray-700 rounded-lg p-3 border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm">Pedido #{pedido.id}</span>
                      <span className={`text-xs font-medium ${tiempo.color}`}>
                        ⏱️ {tiempo.minutos} min
                      </span>
                    </div>

                    {pedido.detalles?.map((detalle) => (
                      <div key={detalle.id} className="flex justify-between text-sm py-1 border-b border-gray-600 last:border-0">
                        <span>
                          <span className="font-bold text-primary-400">{detalle.cantidad}x</span>{' '}
                          {detalle.producto_nombre || `Prod. #${detalle.producto_id}`}
                        </span>
                      </div>
                    ))}

                    {pedido.notas && (
                      <div className="mt-2 p-2 bg-yellow-900/30 rounded text-xs text-yellow-300">
                        📝 {pedido.notas}
                      </div>
                    )}

                    {col.nextEstado && (
                      <button
                        onClick={() => cambiarEstado(pedido.id, col.nextEstado!)}
                        className="btn-primary w-full mt-3 text-sm py-2"
                      >
                        Mover a {COLUMNAS.find((c) => c.estado === col.nextEstado)?.label || col.nextEstado}
                      </button>
                    )}
                  </div>
                );
              })}

              {(!pedidos[col.estado] || pedidos[col.estado].length === 0) && (
                <div className="text-center text-gray-500 py-8 text-sm">
                  Sin pedidos
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
"@

Set-Content -Path "$ProjectDir/frontend/src/pages/KDS.tsx" -Value $kdsTsx -Encoding UTF8
Write-Host "✅ frontend/src/pages/KDS.tsx creado" -ForegroundColor Green

# ============================================
# 25. FRONTEND - src/pages/Caja.tsx
# ============================================

$cajaTsx = @"
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import type { Mesa, Pedido, Reserva, ListaEspera, MetodoPago } from '../types';
import { joinRoom } from '../hooks/useSocket';

type VistaCaja = 'mesas' | 'reservas' | 'espera' | 'facturacion';

export default function Caja() {
  const [vista, setVista] = useState<VistaCaja>('mesas');
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [listaEspera, setListaEspera] = useState<ListaEspera[]>([]);
  const [loading, setLoading] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');

  useEffect(() => {
    joinRoom('caja');
    cargarTodo();

    const socket = getSocket();
    socket.on('pedido:nuevo', () => cargarTodo());
    socket.on('pedido:estado', () => cargarTodo());
    socket.on('mesa:estado', () => cargarTodo());
    socket.on('reserva:actualizada', () => cargarTodo());
    socket.on('lista_espera:actualizada', (data: ListaEspera[]) => setListaEspera(data));

    return () => {
      socket.off('pedido:nuevo');
      socket.off('pedido:estado');
      socket.off('mesa:estado');
      socket.off('reserva:actualizada');
      socket.off('lista_espera:actualizada');
    };
  }, []);

  const cargarTodo = async () => {
    try {
      const [m, p, r, le] = await Promise.all([
        api.getMesas(),
        api.getPedidosActivos(),
        api.getReservas(),
        api.getListaEspera(),
      ]);
      setMesas(m);
      setPedidos(p);
      setReservas(r);
      setListaEspera(le);
    } catch { /* error */ } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string): string => {
    const colors: Record<string, string> = {
      libre: 'bg-green-100 border-green-500 text-green-800',
      ocupada: 'bg-red-100 border-red-500 text-red-800',
      reservada: 'bg-blue-100 border-blue-500 text-blue-800',
      en_espera: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    };
    return colors[estado] || 'bg-gray-100 border-gray-300';
  };

  const procesarPago = async () => {
    if (!pedidoSeleccionado) return;
    try {
      await api.procesarPago(pedidoSeleccionado.id, metodoPago);
      setPedidoSeleccionado(null);
      await cargarTodo();
      alert('Pago procesado exitosamente');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al procesar pago');
    }
  };

  const asignarMesaEspera = async (esperaId: number, mesaId: number) => {
    try {
      await api.asignarMesaEspera(esperaId, mesaId);
      await cargarTodo();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-2">💰</div>
          <p className="text-gray-500">Cargando panel de caja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💰</span>
          <div>
            <h1 className="text-xl font-bold">Panel de Caja</h1>
            <p className="text-xs text-gray-500">FoodTech - Administracion</p>
          </div>
        </div>
        <button onClick={cargarTodo} className="btn-secondary text-sm">🔄 Actualizar</button>
      </header>

      <div className="bg-white border-b px-6">
        <div className="flex gap-1">
          {([
            { id: 'mesas', label: '🗺️ Mesas', count: mesas.length },
            { id: 'reservas', label: '📅 Reservas', count: reservas.length },
            { id: 'espera', label: '⏳ Lista Espera', count: listaEspera.length },
            { id: 'facturacion', label: '💳 Facturacion', count: pedidos.filter((p) => p.estado === 'entregado').length },
          ] as { id: VistaCaja; label: string; count: number }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setVista(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                vista === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {vista === 'mesas' && (
          <div className="grid grid-cols-4 gap-4">
            {mesas.map((mesa) => {
              const pedidosMesa = pedidos.filter((p) => p.mesa_id === mesa.id);
              return (
                <div
                  key={mesa.id}
                  className={`card border-l-4 ${getEstadoColor(mesa.estado)} cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => {
                    if (pedidosMesa.length > 0) {
                      setPedidoSeleccionado(pedidosMesa[pedidosMesa.length - 1]);
                      setVista('facturacion');
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">#{mesa.numero}</span>
                    <span className="text-xs bg-white px-2 py-1 rounded-full">
                      👥 {mesa.capacidad}
                    </span>
                  </div>
                  <p className="text-sm font-medium capitalize">{mesa.estado.replace('_', ' ')}</p>
                  {pedidosMesa.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {pedidosMesa.length} pedido(s) activo(s)
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {vista === 'reservas' && (
          <div className="card">
            <h2 className="text-lg font-bold mb-4">Reservas</h2>
            {reservas.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Sin reservas</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3">Cliente</th>
                      <th className="text-left p-3">Personas</th>
                      <th className="text-left p-3">Fecha</th>
                      <th className="text-left p-3">Hora</th>
                      <th className="text-left p-3">Mesa</th>
                      <th className="text-left p-3">Estado</th>
                      <th className="text-left p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservas.map((reserva) => (
                      <tr key={reserva.id} className="border-b">
                        <td className="p-3 font-medium">{reserva.nombre_cliente}</td>
                        <td className="p-3">{reserva.personas}</td>
                        <td className="p-3">{reserva.fecha_reserva}</td>
                        <td className="p-3">{reserva.hora_reserva}</td>
                        <td className="p-3">{reserva.mesa_id ? `#${reserva.mesa_id}` : '-'}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 capitalize">
                            {reserva.estado}
                          </span>
                        </td>
                        <td className="p-3">
                          {reserva.estado === 'pendiente' && (
                            <button
                              onClick={async () => {
                                await api.cambiarEstadoReserva(reserva.id, 'confirmada');
                                await cargarTodo();
                              }}
                              className="btn-success text-xs"
                            >
                              Confirmar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {vista === 'espera' && (
          <div className="card">
            <h2 className="text-lg font-bold mb-4">Lista de Espera</h2>
            {listaEspera.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Sin personas en espera</p>
            ) : (
              <div className="space-y-3">
                {listaEspera.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {item.posicion}
                      </span>
                      <div>
                        <p className="font-medium">{item.nombre_cliente}</p>
                        <p className="text-xs text-gray-500">{item.personas} personas {item.telefono && `• ${item.telefono}`}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <select
                        className="input-field text-sm w-32"
                        onChange={(e) => {
                          if (e.target.value) asignarMesaEspera(item.id, parseInt(e.target.value));
                        }}
                        defaultValue=""
                      >
                        <option value="">Asignar mesa...</option>
                        {mesas.filter((m) => m.estado === 'libre').map((m) => (
                          <option key={m.id} value={m.id}>Mesa #{m.numero}</option>
                        ))}
                      </select>
                      <button
                        onClick={async () => {
                          await api.cancelarListaEspera(item.id);
                          await cargarTodo();
                        }}
                        className="btn-danger text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {vista === 'facturacion' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-lg font-bold mb-4">Pedidos para Cobrar</h2>
              {pedidos.filter((p) => p.estado === 'entregado').length === 0 ? (
                <p className="text-gray-500 text-center py-8">Sin pedidos para cobrar</p>
              ) : (
                <div className="space-y-2">
                  {pedidos.filter((p) => p.estado === 'entregado').map((pedido) => (
                    <div
                      key={pedido.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        pedidoSeleccionado?.id === pedido.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setPedidoSeleccionado(pedido)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Pedido #{pedido.id}</span>
                        <span className="font-bold text-primary-600">Bs. {pedido.total.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-gray-500">Mesa #{mesas.find((m) => m.id === pedido.mesa_id)?.numero || pedido.mesa_id}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="text-lg font-bold mb-4">Procesar Pago</h2>
              {pedidoSeleccionado ? (
                <div>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-500">Pedido #{pedidoSeleccionado.id}</p>
                    <p className="text-2xl font-bold text-primary-600">Bs. {pedidoSeleccionado.total.toFixed(2)}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Metodo de pago:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(['efectivo', 'tarjeta', 'qr', 'transferencia'] as MetodoPago[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => setMetodoPago(m)}
                          className={`p-3 rounded-lg border text-sm font-medium capitalize transition-colors ${
                            metodoPago === m
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {m === 'qr' ? '📱 QR' : m === 'tarjeta' ? '💳 Tarjeta' : m === 'efectivo' ? '💵 Efectivo' : '🏦 Transferencia'}
                        </button>
                      ))}
                    </div>

                    <button onClick={procesarPago} className="btn-success w-full py-3 text-lg mt-4">
                      💰 Confirmar Pago
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Selecciona un pedido</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"@

Set-Content -Path "$ProjectDir/frontend/src/pages/Caja.tsx" -Value $cajaTsx -Encoding UTF8
Write-Host "✅ frontend/src/pages/Caja.tsx creado" -ForegroundColor Green

# ============================================
# 26. CREAR ZIP
# ============================================

Write-Host ""
Write-Host "📦 Creando foodtech.zip..." -ForegroundColor Yellow

# Eliminar ZIP anterior si existe
if (Test-Path "foodtech.zip") {
    Remove-Item "foodtech.zip" -Force
    Write-Host "🗑️ ZIP anterior eliminado" -ForegroundColor Gray
}

# Crear ZIP
Compress-Archive -Path "$ProjectDir\*" -DestinationPath "foodtech.zip" -Force

Write-Host "✅ foodtech.zip creado exitosamente" -ForegroundColor Green

# Mostrar tamaño
$zipFile = Get-Item "foodtech.zip"
$sizeMB = [math]::Round($zipFile.Length / 1MB, 2)
Write-Host "📊 Tamaño: $sizeMB MB" -ForegroundColor Cyan

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  FoodTech proyecto creado exitosamente" -ForegroundColor Green
Write-Host "  ZIP: $PWD\foodtech.zip" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green