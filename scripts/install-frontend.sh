#!/usr/bin/env bash
# =====================================================================
# FOODTECH - Instalación Automatizada VM 3: Frontend Nginx + React SPA
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
echo -e "${CYAN}  FOODTECH: Instalador Automatizado de Frontend Nginx  ${NC}"
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
echo -e "${GREEN}[OK] Configuración cargada. Backend IP: ${VM_BACKEND_IP}:${BACKEND_PORT}${NC}"

# [PASO 2/6] Instalar Nginx, Node.js y utilidades
echo -e "\n${YELLOW}[PASO 2/6] Instalando Nginx y Node.js para compilación...${NC}"
apt-get update -qq
apt-get install -y -qq nginx curl ufw

if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi
echo -e "${GREEN}[OK] Nginx y Node.js instalados.${NC}"

# [PASO 3/6] Compilar frontend React + Vite + Tailwind
echo -e "\n${YELLOW}[PASO 3/6] Compilando aplicación Frontend...${NC}"
FRONTEND_DIR="${ROOT_DIR}/frontend"
cd "$FRONTEND_DIR"

npm install
npm run build

WEB_ROOT="/var/www/foodtech"
mkdir -p "$WEB_ROOT"
rm -rf "${WEB_ROOT:?}"/*
cp -r dist/* "$WEB_ROOT/"
chown -R www-data:www-data "$WEB_ROOT"
chmod -R 755 "$WEB_ROOT"
echo -e "${GREEN}[OK] Bundle de producción desplegado en ${WEB_ROOT}.${NC}"

# [PASO 4/6] Configurar Nginx con Proxy Inverso para API y WebSockets
echo -e "\n${YELLOW}[PASO 4/6] Configurando VirtualHost en Nginx con Proxy Pass y WebSockets...${NC}"
NGINX_CONF="/etc/nginx/sites-available/foodtech"

cat > "$NGINX_CONF" <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root ${WEB_ROOT};
    index index.html;

    # Compresión Gzip para alto rendimiento en red local
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;
    gzip_min_length 1000;

    # Aplicación SPA React (Enrutamiento cliente: /m/:mesaId, /kds, /caja)
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy inverso para API REST hacia Backend VM
    location /api/ {
        proxy_pass http://${VM_BACKEND_IP}:${BACKEND_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
    }

    # Proxy inverso para WebSockets (Socket.io)
    location /socket.io/ {
        proxy_pass http://${VM_BACKEND_IP}:${BACKEND_PORT}/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # Cache de activos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
EOF

# Habilitar sitio
rm -f /etc/nginx/sites-enabled/default
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/foodtech
nginx -t
systemctl restart nginx
echo -e "${GREEN}[OK] Nginx configurado y reiniciado con éxito.${NC}"

# [PASO 5/6] Configuración de Firewall UFW
echo -e "\n${YELLOW}[PASO 5/6] Configurando firewall UFW en Frontend...${NC}"
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP Nginx'
ufw allow 443/tcp comment 'HTTPS'
ufw reload
echo -e "${GREEN}[OK] Firewall UFW configurado (Puertos 80, 443 y 22 habilitados).${NC}"

# [PASO 6/6] Verificación automática
echo -e "\n${CYAN}=======================================================${NC}"
echo -e "${CYAN}  VERIFICACIÓN AUTOMÁTICA DE VM FRONTEND              ${NC}"
echo -e "${CYAN}=======================================================${NC}"

HTTP_FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/ || echo "000")
echo -e "HTTP Status Frontend (/) : ${HTTP_FRONTEND} (esperado 200)"

if [[ "$HTTP_FRONTEND" == "200" ]]; then
  echo -e "\n${GREEN}[OK] Frontend Nginx responde correctamente. VM 3 lista.${NC}"
else
  echo -e "\n${RED}[ERROR] Nginx no devolvió HTTP 200 al consultar raíz.${NC}"
  exit 1
fi
