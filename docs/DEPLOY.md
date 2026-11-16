# AmeniEdge Deployment Guide

This guide covers deployment instructions for two distinct operating targets:
1. **Local Station Field Deployment** (The true offline disaster configuration).
2. **Free Cloud Demo Deployment** (Online showcase configuration for hackathons and demos).

---

## 1. Local Station Field Deployment (Offline Disaster Mode)

This setup runs on a physical Linux device (Raspberry Pi 4/5, Intel NUC, or rugged laptop) positioned at an emergency relief center, shelter, or fire station.

### Hardware Requirements
- **Host**: Raspberry Pi 4 (4GB+), Intel x86 NUC, or Linux laptop.
- **Wireless Card**: Wi-Fi interface supporting AP mode (e.g., internal Pi Wi-Fi or Atheros AR9271 USB dongle).
- **Storage**: 32GB+ High-endurance microSD or SSD.
- **Power**: 12V battery with solar charge controller or uninterruptible power supply (UPS).

### Step 1: Install System Dependencies
```bash
sudo apt update && sudo apt install -y docker.io docker-compose hostapd dnsmasq iptables git
sudo systemctl enable docker
sudo systemctl start docker
```

### Step 2: Configure Wi-Fi Access Point (hostapd)
Edit `/etc/hostapd/hostapd.conf`:
```ini
interface=wlan0
driver=nl80211
ssid=AmeniEdge-Emergency
hw_mode=g
channel=6
wmm_enabled=0
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
```

### Step 3: Configure Captive Portal & DHCP (dnsmasq)
Edit `/etc/dnsmasq.conf`:
```ini
interface=wlan0
dhcp-range=192.168.44.10,192.168.44.200,255.255.255.0,12h
# Redirect all DNS queries to local station node (Captive Portal)
address=/#/192.168.44.1
```

Set static IP on `wlan0`:
```bash
sudo ip addr add 192.168.44.1/24 dev wlan0
sudo systemctl restart hostapd
sudo systemctl restart dnsmasq
```

### Step 4: Run Station Containers
Clone the repository and run the station docker-compose:
```bash
git clone https://github.com/your-org/ameniedge.git
cd ameniedge
docker compose -f infra/docker-compose.station.yml up -d
```
The PWA is automatically served on port 80. Any phone connecting to `AmeniEdge-Emergency` receives a captive portal prompt opening the AmeniEdge emergency reporting interface.

---

## 2. Free Cloud Demo Deployment (Online Demo Mode)

For hackathon reviews, client demonstrations, or portfolio showcasing where no physical hardware is present, AmeniEdge can run on free-tier cloud hosting.

### Recommended Free Stack:
- **Frontend**: Cloudflare Pages / Vercel / Netlify (Free static hosting).
- **Backend**: Render / Railway / Fly.io (Free container instance).
- **Database**: Supabase / Neon / Aiven (Free PostgreSQL instance with PostGIS extension).

### Step 1: Set Up Cloud PostgreSQL with PostGIS
1. Create a free PostgreSQL database on Supabase or Neon.
2. In the SQL editor, run:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```
3. Note your connection string: `postgresql://user:password@host:port/dbname`.

### Step 2: Deploy Backend Container (Render / Railway)
1. In your cloud container host (e.g., Render), create a **New Web Service** pointing to this repo.
2. Set Root Directory to `backend` (or use root Dockerfile with `backend/Dockerfile`).
3. Set the following Environment Variables:
   - `SPRING_PROFILES_ACTIVE`: `prod`
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<host>:<port>/<dbname>?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME`: `<username>`
   - `SPRING_DATASOURCE_PASSWORD`: `<password>`
   - `SERVER_PORT`: `8080`
   - `AMENIEDGE_SECURITY_JWT_SECRET`: `YourSuperSecureProductionSecretKeyWithAtLeast256BitsLength!`
   - `AMENIEDGE_CORS_ALLOWED_ORIGINS`: `https://your-frontend.pages.dev,http://localhost:5173`
4. Set Health Check path to: `/actuator/health`.

> [!NOTE]
> Free-tier backends (such as Render) spin down during periods of inactivity. The first API request may take 30–50 seconds to complete while the container wakes up.

### Step 3: Deploy Frontend PWA (Cloudflare Pages / Vercel)
1. Link your repository.
2. Set Root Directory to `frontend`.
3. Set Build Command: `npm run build`.
4. Set Output Directory: `dist`.
5. Set Environment Variables:
   - `VITE_API_URL`: `https://your-backend.onrender.com`
   - `VITE_DEMO_MODE`: `true`

When `VITE_DEMO_MODE=true` is set, a non-intrusive demo notification appears at the top informing viewers:
*"Demo Mode Active: Operating via cloud relay. Production deployments run off-grid on localized station Wi-Fi access points."*

