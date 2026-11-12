# FOODTECH: Protocolo y Checklist de Verificación End-to-End (E2E)

**Proyecto:** Sistema Integral de Gestión de Restaurantes en Tiempo Real  
**Institución:** UNICEN Cochabamba - Innovación Digital e IA  
**Flujo Principal:** Cliente QR ➔ Creación de Pedido ➔ KDS Cocina ➔ Caja / Salón ➔ Pago y Liberación  

---

## 📋 Checklist de Pruebas Paso a Paso

| Paso | Módulo | Acción del Evaluador | Resultado Esperado | Estado |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Base de Datos** | Conectar a MySQL `unicen_app` con usuario `foodtech_user` | Tablas creadas con claves foráneas e índices. 15 productos y 8 mesas en seed. | `[ ]` |
| **2** | **Backend Health** | Consultar `GET /api/v1/health` en navegador o curl | Retorna `HTTP 200` `{ "status": "UP", "database": { "connected": true } }`. | `[ ]` |
| **3** | **Cliente QR** | Abrir en navegador `/m/3` (Mesa 3) | Visualización de la carta digital con fotos, precios en Bs., tiempos estimados y filtro de categorías. | `[ ]` |
| **4** | **KDS Cocina** | Abrir en otra pestaña/pantalla `/kds` | Tablero Kanban en 3 columnas: *Nuevos Pedidos*, *En Preparación*, *Listos en Barra*. Reloj digital activo. | `[ ]` |
| **5** | **Caja & Salón** | Abrir en tercera pestaña `/caja` | Mapa interactivo del salón. Mesa 3 figura inicialmente como *Disponible* (verde/beige). | `[ ]` |
| **6** | **Envío de Pedido** | En `/m/3`, agregar "Pique Macho" (2x) con nota "sin locoto" y confirmar comanda | Transacción atómica en MySQL. En `/m/3` aparece barra de progreso en vivo con código `#PED-M3-XXXX`. | `[ ]` |
| **7** | **Tiempo Real KDS** | Observar `/kds` sin recargar la página | El pedido aparece inmediatamente en columna *Nuevos Pedidos*. Suena la campanilla Web Audio. Temporizador en verde. | `[ ]` |
| **8** | **Tiempo Real Caja** | Observar `/caja` sin recargar la página | La Mesa 3 cambia instantáneamente a estado *Ocupada* (color Vino) mostrando el total acumulado en Bs. | `[ ]` |
| **9** | **Cocina Inicia** | En `/kds`, pulsar botón `Iniciar Preparación` | La comanda pasa a columna *En Preparación*. En `/m/3`, la barra de seguimiento avanza a *En Cocina*. | `[ ]` |
| **10** | **Cocina Termina** | En `/kds`, pulsar botón `Marcar Terminado` | La comanda pasa a *Listos en Barra*. En `/m/3`, la barra avanza a *Plato Listo*. | `[ ]` |
| **11** | **Despacho a Mesa** | En `/kds`, pulsar `Despachar a Mesa` | La comanda desaparece de KDS. En `/m/3`, avanza a *En su Mesa*. | `[ ]` |
| **12** | **Cobro en Caja** | En `/caja`, pulsar sobre Mesa 3 o tab *Cobro* | Se abre modal de facturación desglosando platos, precio unitario histórico y calculadora de cambio en efectivo. | `[ ]` |
| **13** | **Confirmar Pago** | Seleccionar *Efectivo*, ingresar monto y pulsar `Confirmar Pago` | Pedido pasa a estado terminal `pagado`. La Mesa 3 se libera a *Disponible*. En `/m/3` se indica comanda saldada. | `[ ]` |
| **14** | **Máquina de Estados** | Intentar cambiar pedido pagado a otro estado | El backend rechaza la transición inválida respondiendo `HTTP 409 Conflict`. | `[ ]` |
| **15** | **Reportes** | En `/caja`, pestaña *Facturación & Reportes* | El monto cobrado suma al total facturado del día y desglosa el método de pago utilizado. | `[ ]` |

---

## 🛠️ Comandos de Verificación Rápida por Terminal

```bash
# 1. Comprobar salud del backend y MySQL
curl -i http://127.0.0.1:3000/api/v1/health

# 2. Comprobar catálogo de platos disponibles
curl -s http://127.0.0.1:3000/api/v1/productos/disponibles | grep -o '"nombre":' | wc -l

# 3. Comprobar mesas
curl -s http://127.0.0.1:3000/api/v1/mesas | grep -o '"numero":' | wc -l

# 4. Probar autenticación de personal
curl -s -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cajero@foodtech.bo","password":"Cajero1234!"}'
```
