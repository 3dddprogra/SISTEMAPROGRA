#!/usr/bin/env bash
# =====================================================================
# FOODTECH - Instalación Automatizada VM 1: Base de Datos MySQL 8.x
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
echo -e "${CYAN}  FOODTECH: Instalador Automatizado de Base de Datos  ${NC}"
echo -e "${CYAN}=======================================================${NC}"

# [PASO 1/6] Cargar configuración
echo -e "\n${YELLOW}[PASO 1/6] Cargando configuración desde config.env...${NC}"
CONFIG_FILE="${ROOT_DIR}/config.env"
if [[ ! -f "$CONFIG_FILE" ]]; then
  echo -e "${RED}[ERROR] No se encontró el archivo de configuración: ${CONFIG_FILE}${NC}"
  exit 1
fi
# shellcheck disable=SC1090
source "$CONFIG_FILE"
echo -e "${GREEN}[OK] Configuración cargada correctamente. IP DB: ${VM_DB_IP}, IP Backend: ${VM_BACKEND_IP}${NC}"

# [PASO 2/6] Instalar MySQL Server 8
echo -e "\n${YELLOW}[PASO 2/6] Instalando MySQL Server 8...${NC}"
apt-get update -qq
apt-get install -y -qq mysql-server ufw curl
systemctl enable --now mysql
echo -e "${GREEN}[OK] MySQL Server instalado y ejecutándose.${NC}"

# [PASO 3/6] Configurar bind-address para permitir conexiones desde Backend
echo -e "\n${YELLOW}[PASO 3/6] Configurando acceso de red en MySQL (bind-address)...${NC}"
MYSQL_CNF="/etc/mysql/mysql.conf.d/mysqld.cnf"
if grep -q "bind-address" "$MYSQL_CNF"; then
  sed -i 's/bind-address\s*=.*/bind-address = 0.0.0.0/' "$MYSQL_CNF"
else
  echo "[mysqld]" >> "$MYSQL_CNF"
  echo "bind-address = 0.0.0.0" >> "$MYSQL_CNF"
fi
systemctl restart mysql
echo -e "${GREEN}[OK] bind-address configurado a 0.0.0.0 y servicio reiniciado.${NC}"

# [PASO 4/6] Crear base de datos y usuario con permisos
echo -e "\n${YELLOW}[PASO 4/6] Creando base de datos '${DB_NAME}' y usuario '${DB_USER}'...${NC}"
mysql -uroot <<EOSQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Usuario para la VM Backend
CREATE USER IF NOT EXISTS '${DB_USER}'@'${VM_BACKEND_IP}' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'${VM_BACKEND_IP}' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'${VM_BACKEND_IP}';

-- Usuario para localhost (mantenimiento y verificación)
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';

-- Usuario para la subnet completa host-only (resiliencia de red)
CREATE USER IF NOT EXISTS '${DB_USER}'@'192.168.56.%' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'192.168.56.%' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'192.168.56.%';

FLUSH PRIVILEGES;
EOSQL
echo -e "${GREEN}[OK] Base de datos y usuario creados con permisos concedidos.${NC}"

# [PASO 5/6] Ejecutar Schema y Seeders
echo -e "\n${YELLOW}[PASO 5/6] Aplicando schema.sql y seed.sql...${NC}"
SCHEMA_FILE="${ROOT_DIR}/database/schema.sql"
SEED_FILE="${ROOT_DIR}/database/seed.sql"

if [[ -f "$SCHEMA_FILE" ]]; then
  mysql -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" < "$SCHEMA_FILE"
  echo -e "${GREEN}[OK] Tablas creadas con éxito desde schema.sql.${NC}"
else
  echo -e "${RED}[ERROR] Archivo ${SCHEMA_FILE} no encontrado.${NC}"
  exit 1
fi

if [[ -f "$SEED_FILE" ]]; then
  mysql -u"${DB_USER}" -p"${DB_PASSWORD}" "${DB_NAME}" < "$SEED_FILE"
  echo -e "${GREEN}[OK] Datos iniciales insertados desde seed.sql.${NC}"
else
  echo -e "${RED}[ERROR] Archivo ${SEED_FILE} no encontrado.${NC}"
  exit 1
fi

# [PASO 6/6] Configuración del Firewall UFW
echo -e "\n${YELLOW}[PASO 6/6] Configurando reglas de firewall (UFW)...${NC}"
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow from "${VM_BACKEND_IP}" to any port 3306 proto tcp comment 'MySQL desde Backend'
ufw reload
echo -e "${GREEN}[OK] Firewall UFW configurado y activo.${NC}"

# Verificación automática final
echo -e "\n${CYAN}=======================================================${NC}"
echo -e "${CYAN}  VERIFICACIÓN AUTOMÁTICA DE VM BASE DE DATOS         ${NC}"
echo -e "${CYAN}=======================================================${NC}"

TOTAL_PROD=$(mysql -u"${DB_USER}" -p"${DB_PASSWORD}" -N -e "SELECT COUNT(*) FROM \`${DB_NAME}\`.productos;")
TOTAL_MESAS=$(mysql -u"${DB_USER}" -p"${DB_PASSWORD}" -N -e "SELECT COUNT(*) FROM \`${DB_NAME}\`.mesas;")
TOTAL_USERS=$(mysql -u"${DB_USER}" -p"${DB_PASSWORD}" -N -e "SELECT COUNT(*) FROM \`${DB_NAME}\`.usuarios;")

echo -e "Productos en BD : ${TOTAL_PROD} (esperado >= 15)"
echo -e "Mesas activas   : ${TOTAL_MESAS} (esperado >= 8)"
echo -e "Usuarios staff  : ${TOTAL_USERS} (esperado >= 3)"

if [[ "$TOTAL_PROD" -ge 15 && "$TOTAL_MESAS" -ge 8 && "$TOTAL_USERS" -ge 3 ]]; then
  echo -e "\n${GREEN}[OK] Verificación completada exitosamente. VM 1 (DB) lista para producción.${NC}"
else
  echo -e "\n${RED}[ERROR] La verificación no cumplió con las cantidades mínimas esperadas.${NC}"
  exit 1
fi
