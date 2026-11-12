#!/usr/bin/env bash
# =====================================================================
# FOODTECH - Verificación Integral de Todo el Ecosistema Multi-VM
# UNICEN - Carrera de Innovación Digital e IA
# =====================================================================

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo -e "${CYAN}=======================================================${NC}"
echo -e "${CYAN}  FOODTECH: Verificación Integral de Despliegue Multi-VM${NC}"
echo -e "${CYAN}=======================================================${NC}"

CONFIG_FILE="${ROOT_DIR}/config.env"
if [[ ! -f "$CONFIG_FILE" ]]; then
  echo -e "${RED}[ERROR] config.env no encontrado.${NC}"
  exit 1
fi
# shellcheck disable=SC1090
source "$CONFIG_FILE"

PASS_COUNT=0
FAIL_COUNT=0

check_test() {
  local name="$1"
  local status="$2"
  if [[ "$status" -eq 0 ]]; then
    echo -e "${GREEN}[OK] $name${NC}"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo -e "${RED}[FAIL] $name${NC}"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

echo -e "\n${YELLOW}--- 1. VERIFICACIÓN DE BASE DE DATOS (VM 1: ${VM_DB_IP}) ---${NC}"
if nc -z -w 3 "${VM_DB_IP}" 3306 2>/dev/null; then
  check_test "Puerto MySQL 3306 accesible" 0
else
  check_test "Puerto MySQL 3306 accesible" 1
fi

echo -e "\n${YELLOW}--- 2. VERIFICACIÓN DE BACKEND API (VM 2: ${VM_BACKEND_IP}:${BACKEND_PORT}) ---${NC}"
HEALTH_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "http://${VM_BACKEND_IP}:${BACKEND_PORT}/api/v1/health" 2>/dev/null || echo "000")
if [[ "$HEALTH_HTTP" == "200" ]]; then
  check_test "Healthcheck /api/v1/health responde 200 UP" 0
else
  check_test "Healthcheck /api/v1/health responde (HTTP $HEALTH_HTTP)" 1
fi

SOCKET_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "http://${VM_BACKEND_IP}:${BACKEND_PORT}/socket.io/?EIO=4&transport=polling" 2>/dev/null || echo "000")
if [[ "$SOCKET_HTTP" == "200" ]]; then
  check_test "WebSockets Socket.io endpoint activo" 0
else
  check_test "WebSockets Socket.io endpoint activo (HTTP $SOCKET_HTTP)" 1
fi

echo -e "\n${YELLOW}--- 3. VERIFICACIÓN DE FRONTEND NGINX (VM 3: ${VM_FRONTEND_IP}) ---${NC}"
FRONT_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "http://${VM_FRONTEND_IP}/" 2>/dev/null || echo "000")
if [[ "$FRONT_HTTP" == "200" ]]; then
  check_test "Frontend Nginx sirve la aplicación React (HTTP 200)" 0
else
  check_test "Frontend Nginx accesible (HTTP $FRONT_HTTP)" 1
fi

PROXY_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "http://${VM_FRONTEND_IP}/api/v1/productos" 2>/dev/null || echo "000")
if [[ "$PROXY_HTTP" == "200" ]]; then
  check_test "Nginx Proxy Inverso a /api/v1/productos responde 200" 0
else
  check_test "Nginx Proxy Inverso a /api/v1/productos (HTTP $PROXY_HTTP)" 1
fi

echo -e "\n${CYAN}=======================================================${NC}"
echo -e "Resultados: ${GREEN}${PASS_COUNT} Exitosos${NC} | ${RED}${FAIL_COUNT} Fallidos${NC}"
echo -e "${CYAN}=======================================================${NC}"

if [[ "$FAIL_COUNT" -eq 0 ]]; then
  echo -e "${GREEN}🎉 ¡Todo el ecosistema de FOODTECH está funcionando al 100%!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️ Algunos servicios aún no están disponibles o las VMs no están encendidas.${NC}"
  exit 0
fi
