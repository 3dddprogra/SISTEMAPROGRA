# FOODTECH
Sistema de restaurante: pedidos por QR, cocina (KDS) y caja, en tiempo real.

## Estructura
- `backend/` API Express + Socket.io + MySQL
- `frontend/` React + Vite + Tailwind
- `database/` schema.sql y seed.sql
- `docs/` arquitectura, despliegue, checklist E2E

## Arranque local
1. `cp .env.example config.env` y completa claves
2. `mysql < database/schema.sql && mysql < database/seed.sql`
3. `cd backend && npm i && npm run dev`
4. `cd frontend && npm i && npm run dev`
