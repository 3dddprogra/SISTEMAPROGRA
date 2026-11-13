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

-- 2. Categorías del Restaurante
INSERT INTO categorias (id, nombre, descripcion, icono, orden, activo) VALUES
(1, 'Entradas', 'Para comenzar y compartir la experiencia culinaria', 'UtensilsCrossed', 1, TRUE),
(2, 'Platos Fuertes', 'Especialidades gourmet y tradicionales de la casa', 'Utensils', 2, TRUE),
(3, 'Bebidas', 'Refrescos artesanales, cervezas y jugos naturales', 'GlassWater', 3, TRUE),
(4, 'Postres', 'El cierre dulce artesanal para tu mesa', 'Cake', 4, TRUE);

-- 3. Catálogo de 15 Productos Gastronómicos
INSERT INTO productos (id, categoria_id, nombre, descripcion, precio, imagen_url, disponible, tiempo_estimado_min) VALUES
-- Entradas
(1, 1, 'Empanadas Cochabambinas (3 uds)', 'Rellenas de carne picada sazonada, papa, arvejas y caldo aromático en masa crocante horneada.', 18.00, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80', TRUE, 10),
(2, 1, 'Anticuchos al Fuego Vivo', 'Finas láminas de corazón de res marinadas en ají panca y vinagre, con papas doradas y llajwa.', 25.00, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80', TRUE, 12),
(3, 1, 'Sopa de Maní Tradicional', 'Concentrado cremoso de maní con costilla tierna, verduras andinas y lluvias de papas hilo.', 22.00, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80', TRUE, 8),
(4, 1, 'Tabla de Quesos y Fiambres', 'Selección de quesos criollos, jamón serrano, aceitunas marinadas y pan artesanal al romero.', 35.00, 'https://images.unsplash.com/photo-1631709497146-a239ef373cf1?w=400&q=80', TRUE, 10),

-- Platos Fuertes
(5, 2, 'Pique Macho Gourmet', 'Lomo de res salteado a fuego alto con salchicha viena, pimientos, cebolla, huevo duro y locoto fresco.', 55.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', TRUE, 20),
(6, 2, 'Silpancho Cochabambino', 'Fina milanesa de lomo apanada sobre colchón de arroz graneado, papas doradas, huevo frito y k''allu.', 42.00, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&q=80', TRUE, 15),
(7, 2, 'Trucha Frita del Altiplano', 'Filete de trucha asalmonada a la plancha con limón, guarnición de arroz criollo y ensalada de palta.', 48.00, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80', TRUE, 18),
(8, 2, 'Lomo a la Pimienta Negra', 'Medallón de lomo fino 300g en reducción de vino tinto y pimienta verde, con puré rústico de papa.', 58.00, 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80', TRUE, 22),
(9, 2, 'Costillas BBQ al Horno de Leña', 'Costillas de cerdo glaseadas en salsa barbacoa de chicha morada, con papas rústicas al pimentón.', 52.00, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80', TRUE, 20),

-- Bebidas
(10, 3, 'Chicha Morada Artesanal (500ml)', 'Infusión natural de maíz morado con piña, manzana, canela y gotas de limón fresco.', 12.00, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80', TRUE, 5),
(11, 3, 'Mocochinchi Tradicional Frío (500ml)', 'Refresco andino de durazno deshidratado caramelizado con especias y hielo frappé.', 10.00, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80', TRUE, 5),
(12, 3, 'Limonada de Hierbabuena y Jengibre', 'Jugo fresco de limones sutiles batido con hojas de hierbabuena y toque sutil de jengibre.', 14.00, 'https://images.unsplash.com/photo-1523371067-1ac2b2108573?w=400&q=80', TRUE, 5),
(13, 3, 'Cerveza Huari Tradicional (620ml)', 'Cerveza rubia boliviana tipo Pilsener elaborada con agua pura de vertientes andinas.', 22.00, 'https://images.unsplash.com/photo-1608270116812-40a1b80d0d8f?w=400&q=80', TRUE, 3),

-- Postres
(14, 4, 'Cheesecake de Maracuyá', 'Base crujiente de galleta con suave crema de queso y cobertura brillante de maracuyá ácido.', 24.00, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80', TRUE, 6),
(15, 4, 'Volcán de Chocolate Criollo', 'Bizcocho tibio de cacao boliviano al 70% con corazón fundido y helado artesanal de canela.', 26.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80', TRUE, 12);

-- 4. 8 Mesas del Salón
INSERT INTO mesas (id, numero, capacidad, estado, ubicacion, qr_token) VALUES
(1, 1, 2, 'disponible', 'Terraza Exterior', 'qr_token_mesa_01_a7b8c9'),
(2, 2, 2, 'disponible', 'Terraza Exterior', 'qr_token_mesa_02_d1e2f3'),
(3, 3, 4, 'disponible', 'Salón Principal', 'qr_token_mesa_03_g4h5i6'),
(4, 4, 4, 'disponible', 'Salón Principal', 'qr_token_mesa_04_j7k8l9'),
(5, 5, 4, 'disponible', 'Salón Principal', 'qr_token_mesa_05_m1n2o3'),
(6, 6, 6, 'disponible', 'Zona Familiar', 'qr_token_mesa_06_p4q5r6'),
(7, 7, 6, 'disponible', 'Zona Familiar', 'qr_token_mesa_07_s7t8u9'),
(8, 8, 8, 'disponible', 'Salón VIP', 'qr_token_mesa_08_v1w2x3');

-- 5. Registro inicial de reservas de prueba
INSERT INTO reservas (mesa_id, cliente_nombre, cliente_telefono, cliente_email, num_personas, fecha_hora, estado, notas) VALUES
(8, 'Ing. Franz Guzmán (UNICEN)', '+591 71234567', 'franz.guzman@unicen.edu', 6, DATE_ADD(NOW(), INTERVAL 2 HOUR), 'confirmada', 'Reunión de docentes de Innovación Digital'),
(3, 'Carla Mendoza', '+591 76543210', 'carla.mendoza@gmail.com', 4, DATE_ADD(NOW(), INTERVAL 4 HOUR), 'pendiente', 'Celebración de cumpleaños familiar');

-- 6. Registro inicial en lista de espera
INSERT INTO lista_espera (cliente_nombre, telefono, num_personas, posicion, estado, tiempo_estimado_espera, notas) VALUES
('Alejandro Paredes', '+591 79876543', 2, 1, 'esperando', 15, 'Prefiere mesa en terraza si se desocupa'),
('Sofía Quiroga', '+591 70123456', 4, 2, 'esperando', 25, 'Con niños pequeños');
