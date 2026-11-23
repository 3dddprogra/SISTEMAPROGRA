-- =====================================================================
-- FOODTECH: Seed Data Inicial
-- Base de Datos: unicen_app
-- =====================================================================

USE unicen_app;

-- 1. Usuarios con roles (Contraseñas hasheadas con bcrypt salt=10)
-- admin@foodtech.bo   -> Admin1234!  ($2a$10$v2B7wdcZrzL8mIrT/jwzMuIiqHEnecCI5LElBB3taY.UjCTrQ7.m2)
-- cajero@foodtech.bo  -> Cajero1234! ($2a$10$arMcDK2h4zanOiPWJywp8uqftVVz1o6Lh7GawnQULri.tde5Flu26)
-- cocina@foodtech.bo  -> Cocina1234! ($2a$10$Xk.0O3lwL8Qb5wrae00XQevj35NBg0L0Qr1z2/tX8qF/NfwWNPAKi)
INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES
('Administrador General', 'admin@foodtech.bo', '$2a$10$v2B7wdcZrzL8mIrT/jwzMuIiqHEnecCI5LElBB3taY.UjCTrQ7.m2', 'admin', TRUE),
('Cajera Principal (Salón)', 'cajero@foodtech.bo', '$2a$10$arMcDK2h4zanOiPWJywp8uqftVVz1o6Lh7GawnQULri.tde5Flu26', 'cajero', TRUE),
('Jefe de Cocina (KDS)', 'cocina@foodtech.bo', '$2a$10$Xk.0O3lwL8Qb5wrae00XQevj35NBg0L0Qr1z2/tX8qF/NfwWNPAKi', 'cocina', TRUE);

-- 2. Categorías del menú de Nori Pollo (5 categorías)
INSERT INTO categorias (id, nombre, descripcion, icono, orden, activo) VALUES
(1, 'Platos broaster', 'Pollo broaster con arroz con zanahoria y papas fritas', 'Drumstick', 1, TRUE),
(2, 'Pipokas de pollo', 'Conos de pipokas de pollo con papas fritas y chorizo', 'Cone', 2, TRUE),
(3, 'Refrescos naturales', 'Refrescos hervidos servidos con hielo', 'GlassWater', 3, TRUE),
(4, 'Gaseosas', 'Gaseosas frías en distintos tamaños', 'CupSoda', 4, TRUE),
(5, 'Jugos', 'Néctares en botella de vidrio retornable', 'Citrus', 5, TRUE);

-- 3. Menú oficial de Nori Pollo: 21 productos (precios en Bs).
-- Las fotos están en frontend/public/menu/. Los tiempos de preparación son estimados y deben confirmarse con la cocina.
INSERT INTO productos (id, categoria_id, nombre, descripcion, precio, imagen_url, disponible, tiempo_estimado_min) VALUES
-- Platos broaster
(1, 1, 'Nori Pollito', '1 presa + arroz con zanahoria + papas fritas', 16.00, '/menu/nori-pollito.jpg', TRUE, 12),
(2, 1, 'Nori Pollo', '2 presas + arroz con zanahoria + papas fritas', 22.00, '/menu/nori-pollo.jpg', TRUE, 15),
(3, 1, 'Nori Combo', 'Porción grande + arroz con zanahoria + papas fritas', 28.00, '/menu/nori-combo.jpg', TRUE, 15),
-- Pipokas de pollo
(4, 2, 'Nori Conito', 'Pipokas de pollo, papas fritas y chorizo', 15.00, '/menu/pipokas.jpg', TRUE, 10),
(5, 2, 'Nori Cono', 'Pipokas de pollo, papas fritas y chorizo (grande)', 20.00, '/menu/pipokas.jpg', TRUE, 10),
-- Refrescos naturales
(6, 3, 'Limonada', 'Hervida, con hielo', 5.00, '/menu/refrescos-naturales.jpg', TRUE, 2),
(7, 3, 'Refresco de tostada', 'Cebada tostada, con hielo', 8.00, '/menu/refrescos-naturales.jpg', TRUE, 2),
-- Gaseosas
(8, 4, 'Mini 190 ml Coca-Cola', 'Botella de vidrio personal', 3.00, '/menu/gaseosas-minis.jpg', TRUE, 2),
(9, 4, 'Mini 190 ml Fanta Naranja', 'Botella de vidrio personal', 3.00, '/menu/gaseosas-minis.jpg', TRUE, 2),
(10, 4, 'Mini 190 ml Fanta Mandarina', 'Botella de vidrio personal', 3.00, '/menu/gaseosas-minis.jpg', TRUE, 2),
(11, 4, 'Mini 190 ml Fanta Papaya', 'Botella de vidrio personal', 3.00, '/menu/gaseosas-minis.jpg', TRUE, 2),
(12, 4, 'Popular Coca-Cola', 'Botella mediana', 7.00, '/menu/gaseosas-populares.jpg', TRUE, 2),
(13, 4, 'Popular Fanta', 'Botella mediana', 7.00, '/menu/gaseosas-populares.jpg', TRUE, 2),
(14, 4, 'Coca-Cola 1.5 L', 'Litro y medio', 12.00, '/menu/coca-cola-1-5l.jpg', TRUE, 2),
(15, 4, 'Coca-Cola retornable 2.5 L', 'Familiar', 14.00, '/menu/coca-cola-2-5l.jpg', TRUE, 2),
(16, 4, 'Simba 2 L Piña', 'Familiar', 14.00, '/menu/simba-2l.jpg', TRUE, 2),
(17, 4, 'Simba 2 L Durazno', 'Familiar', 14.00, '/menu/simba-2l.jpg', TRUE, 2),
(18, 4, 'Simba 2 L Manzana', 'Familiar', 14.00, '/menu/simba-2l.jpg', TRUE, 2),
(19, 4, 'Fanta Naranja 2 L', 'Familiar', 16.00, '/menu/fanta-2l.jpg', TRUE, 2),
-- Jugos
(20, 5, 'Jugo Del Valle 1 L', 'Néctar en botella de vidrio retornable', 16.00, '/menu/jugos-1l.jpg', TRUE, 2),
(21, 5, 'Jugo Del Sol 1 L', 'Néctar en botella de vidrio retornable', 16.00, '/menu/jugos-1l.jpg', TRUE, 2);

-- 4. Mesas: 7 mesas del salón (6 de 4 sillas y 1 de 2 = 26 sillas) + mesa virtual 8 «Mostrador – Para llevar» (RN01)
INSERT INTO mesas (id, numero, capacidad, estado, ubicacion, qr_token) VALUES
(1, 1, 4, 'disponible', 'Salón', 'qr_token_mesa_01_a7b8c9'),
(2, 2, 4, 'disponible', 'Salón', 'qr_token_mesa_02_d1e2f3'),
(3, 3, 4, 'disponible', 'Salón', 'qr_token_mesa_03_g4h5i6'),
(4, 4, 4, 'disponible', 'Salón', 'qr_token_mesa_04_j7k8l9'),
(5, 5, 4, 'disponible', 'Salón', 'qr_token_mesa_05_m1n2o3'),
(6, 6, 4, 'disponible', 'Salón', 'qr_token_mesa_06_p4q5r6'),
(7, 7, 2, 'disponible', 'Salón', 'qr_token_mesa_07_s7t8u9'),
(8, 8, 1, 'disponible', 'Mostrador – Para llevar', 'qr_token_mesa_08_v1w2x3');

-- 5. Registro inicial de reservas de prueba
INSERT INTO reservas (mesa_id, cliente_nombre, cliente_telefono, cliente_email, num_personas, fecha_hora, estado, notas) VALUES
(6, 'Ing. Franz Guzmán (UNICEN)', '+591 71234567', 'franz.guzman@unicen.edu', 4, DATE_ADD(NOW(), INTERVAL 2 HOUR), 'confirmada', 'Reunión de docentes de Innovación Digital'),
(3, 'Carla Mendoza', '+591 76543210', 'carla.mendoza@gmail.com', 4, DATE_ADD(NOW(), INTERVAL 4 HOUR), 'pendiente', 'Celebración de cumpleaños familiar');

-- 6. Registro inicial en lista de espera
INSERT INTO lista_espera (cliente_nombre, telefono, num_personas, posicion, estado, tiempo_estimado_espera, notas) VALUES
('Alejandro Paredes', '+591 79876543', 2, 1, 'esperando', 15, 'Prefiere mesa en terraza si se desocupa'),
('Sofía Quiroga', '+591 70123456', 4, 2, 'esperando', 25, 'Con niños pequeños');
