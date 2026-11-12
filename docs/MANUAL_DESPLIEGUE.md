# FOODTECH: Manual de Despliegue en 3 Máquinas Virtuales (VirtualBox + Ubuntu Server)

**Universidad de la Comunidad (UNICEN)**  
Carrera: Innovación Digital e IA  
Proyecto: Sistema Integral de Gestión de Restaurantes en Tiempo Real  

---

## 1. Topología de Red y Máquinas Virtuales

La infraestructura se basa en una red privada aislada tipo **Solo-Anfitrión (Host-Only)** en VirtualBox:

| VM | Rol / Servicio | IP Asignada | Software Clave | Firewall UFW |
| :--- | :--- | :--- | :--- | :--- |
| **VM 1** | Base de Datos | `192.168.56.10` | MySQL 8.x Server (`unicen_app`) | 22 (SSH), 3306 (solo desde VM 2) |
| **VM 2** | Backend API | `192.168.56.11` | Node.js 20 LTS, PM2, Socket.io | 22 (SSH), 3000 (solo desde VM 3) |
| **VM 3** | Frontend Web | `192.168.56.12` | Nginx, React + Vite SPA | 22 (SSH), 80 (HTTP), 443 (HTTPS) |

---

## 2. Preparación de las Máquinas Virtuales en Windows 11

### Paso A: Crear la Red Solo-Anfitrión en VirtualBox
1. Abrir **VirtualBox ➔ Archivo ➔ Administrador de red de host**.
2. Crear un adaptador `VirtualBox Host-Only Ethernet Adapter`.
3. Configurar IPv4: `192.168.56.1`, Máscara de red: `255.255.255.0`.
4. En cada una de las 3 VMs Ubuntu Server, asignar dos adaptadores de red:
   - **Adaptador 1:** NAT (para acceso a internet durante instalación de paquetes apt/npm).
   - **Adaptador 2:** Red Solo-Anfitrión (`vboxnet0` / Host-Only) para comunicación interna.

### Paso B: Asignar IPs estáticas en cada VM con Netplan
Editar `/etc/netplan/01-netcfg.yaml` en cada máquina:

**En VM 1 (Base de Datos):**
```yaml
network:
  version: 2
  ethernets:
    enp0s8:
      addresses: [192.168.56.10/24]
```

**En VM 2 (Backend):**
```yaml
network:
  version: 2
  ethernets:
    enp0s8:
      addresses: [192.168.56.11/24]
```

**En VM 3 (Frontend):**
```yaml
network:
  version: 2
  ethernets:
    enp0s8:
      addresses: [192.168.56.12/24]
```
Aplicar con: `sudo netplan apply`

---

## 3. Despliegue Automatizado con un Solo Comando por VM

Copiar la carpeta `foodtech` o descomprimir `foodtech.zip` en el directorio de cada VM (`/home/ubuntu/foodtech` o `/root/foodtech`).

### 🚀 Despliegue en VM 1 (Base de Datos)
```bash
cd foodtech
sudo bash scripts/install-db.sh
```
*El script es 100% no interactivo, instala MySQL 8, configura bind-address, crea la base `unicen_app`, ejecuta `schema.sql` y `seed.sql`, configura UFW y realiza la verificación automática.*

---

### 🚀 Despliegue en VM 2 (Backend)
```bash
cd foodtech
sudo bash scripts/install-backend.sh
```
*El script instala Node.js 20 LTS, compila el código TypeScript en modo estricto, levanta el proceso con PM2 (`foodtech-backend`), lo activa como servicio systemd, asegura el firewall UFW y verifica `GET /api/v1/health`.*

---

### 🚀 Despliegue en VM 3 (Frontend)
```bash
cd foodtech
sudo bash scripts/install-frontend.sh
```
*El script instala Nginx, compila la aplicación React con Vite y Tailwind CSS, despliega los archivos estáticos en `/var/www/foodtech`, configura el Reverse Proxy para `/api` y WebSockets hacia la VM Backend, activa compresión Gzip y abre el puerto 80.*

---

## 4. Verificación End-to-End de Todo el Sistema

Desde la máquina anfitriona Windows o desde cualquiera de las VMs:
```bash
bash scripts/verify-all.sh
```

Abrir en el navegador de la máquina anfitriona:
- **Cliente Móvil QR:** `http://192.168.56.12/m/1` (Mesa 1 a 8)
- **Pantalla KDS Cocina:** `http://192.168.56.12/kds`
- **Panel de Caja y Salón:** `http://192.168.56.12/caja`
- **Ingreso Personal Staff:** `http://192.168.56.12/login`

### 🔑 Credenciales Iniciales de Prueba (Seeders)
- **Administrador:** `admin@foodtech.bo` / `Admin1234!`
- **Cajera Salón:** `cajero@foodtech.bo` / `Cajero1234!`
- **Jefe de Cocina:** `cocina@foodtech.bo` / `Cocina1234!`
