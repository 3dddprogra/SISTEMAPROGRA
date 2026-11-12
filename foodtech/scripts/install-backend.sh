#!/usr/bin/env bash
# =====================================================================
# FOODTECH - Instalación Automatizada VM 2: Backend Node.js + PM2
# UNICEN - Cochabamba | Red Solo-Anfitrión VirtualBox
# =====================================================================

set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

# Colores para salida de terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo -e "${CYAN}=======================================================${NC}"
echo -e "${CYAN}  FOODTECH: Instalador Automatizado de Backend Node.js ${NC}"
echo -e "${CYAN}=======================================================${NC}"

# [PASO 1/6] Cargar configuración compartida
echo -e "\n${YELLOW}[PASO 1/6] Cargando configuración desde config.env...${NC}"
CONFIG_FILE="${ROOT_DIR}/config.env"
if [[ ! -f "$CONFIG_FILE" ]]; then
  echo -e "${RED}[ERROR] No se encontró el archivo de configuración: ${CONFIG_FILE}${NC}"
  exit 1
fi
# shellcheck disable=SC1090
source "$CONFIG_FILE"
echo -e "${GREEN}[OK] Configuración cargada. Backend Port: ${BACKEND_PORT}, DB Host: ${DB_HOST}${NC}"

# [PASO 2/6] Instalar Node.js 20 LTS y dependencias del sistema
echo -e "\n${YELLOW}[PASO 2/6] Instalando Node.js 20 LTS y herramientas de sistema...${NC}"
apt-get update -qq
apt-get install -y -qq curl build-essential ufw git

if ! command -v node &> /dev/null || [[ "$(node -v | cut -d'.' -f1)" != "v20" ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi

npm install -g pm2
echo -e "${GREEN}[OK] Node.js $(node -v) y PM2 $(pm2 -v) instalados correctamente.${NC}"

# [PASO 3/6] Preparar entorno y dependencias del backend
echo -e "\n${YELLOW}[PASO 3/6] Compilando Backend TypeScript...${NC}"
BACKEND_DIR="${ROOT_DIR}/backend"
cd "$BACKEND_DIR"

# Asegurar archivo .env sincronizado para producción
cat > .env <<EOF
NODE_ENV=production
PORT=${BACKEND_PORT}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
CORS_ORIGIN=*
EOF

npm install --production=false
npm run build
echo -e "${GREEN}[OK] TypeScript compilado exitosamente a ./dist.${NC}"

# [PASO 4/6] Configuración de proceso daemon con PM2
echo -e "\n${YELLOW}[PASO 4/6] Configurando PM2 como servicio daemon persistente...${NC}"
pm2 delete foodtech-backend 2>/dev/null || true
pm2 start dist/server.js --name "foodtech-backend" --time
pm2 save
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root || true
echo -e "${GREEN}[OK] Backend ejecutándose en PM2 bajo supervisión continua.${NC}"

# [PASO 5/6] Configuración del Firewall UFW
echo -e "\n${YELLOW}[PASO 5/6] Configurando firewall UFW...${NC}"
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow from "${VM_FRONTEND_IP}" to any port "${BACKEND_PORT}" proto tcp comment 'API desde Frontend'
ufw reload
echo -e "${GREEN}[OK] Firewall UFW configurado (Puerto ${BACKEND_PORT} restringido a ${VM_FRONTEND_IP}).${NC}"

# [PASO 6/6] Verificación automática
echo -e "\n${CYAN}=======================================================${NC}"
echo -e "${CYAN}  VERIFICACIÓN AUTOMÁTICA DE VM BACKEND               ${NC}"
echo -e "${CYAN}=======================================================${NC}"

sleep 3 # Esperar arranque del proceso en background
HEALTH_URL="http://127.0.0.1:${BACKEND_PORT}/api/v1/health"
HTTP_CODE=$(curl -s -o /tmp/health_res.json -w "%{http_code}" "$HEALTH_URL" || echo "000")

echo -e "Consulta Health: ${HEALTH_URL}"
echo -e "Código HTTP    : ${HTTP_CODE}"

if [[ "$HTTP_CODE" == "200" || "$HTTP_CODE" == "503" ]]; then
  echo -e "\nRespuesta JSON del Healthcheck:"
  cat /tmp/health_res.json
  echo -e "\n${GREEN}[OK] El backend responde correctamente. VM 2 (Backend) lista.${NC}"
else
  echo -e "\n${RED}[ERROR] El backend no respondió como se esperaba (HTTP ${HTTP_CODE}). Verifique logs con 'pm2 logs foodtech-backend'.${NC}"
  exit 1
fi
