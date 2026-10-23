#!/usr/bin/env bash
# ==============================================================================
# AmeniEdge Station Edge Autonomous Wi-Fi & Captive Portal Provisioning Script
# Target: Debian / Ubuntu / Raspberry Pi OS Linux Device
# ==============================================================================

set -euo pipefail

echo "=========================================================="
echo " Starting AmeniEdge Station Edge Provisioning..."
echo "=========================================================="

if [ "$EUID" -ne 0 ]; then
  echo "Error: This script must be run as root (sudo ./setup_station_ap.sh)"
  exit 1
fi

WLAN_IF="wlan0"
STATION_IP="192.168.4.1/24"

echo "[1/5] Installing core networking services (hostapd, dnsmasq, iptables)..."
apt-get update -y
apt-get install -y hostapd dnsmasq iptables-persistent net-tools

echo "[2/5] Configuring static IP on $WLAN_IF..."
systemctl stop hostapd || true
systemctl stop dnsmasq || true

cat <<EOF > /etc/network/interfaces.d/$WLAN_IF
auto $WLAN_IF
iface $WLAN_IF inet static
    address 192.168.4.1
    netmask 255.255.255.0
EOF

ip addr flush dev $WLAN_IF || true
ip addr add $STATION_IP dev $WLAN_IF
ip link set $WLAN_IF up

echo "[3/5] Installing hostapd and dnsmasq configurations..."
cp ./hostapd.conf /etc/hostapd/hostapd.conf
sed -i 's|#DAEMON_CONF=""|DAEMON_CONF="/etc/hostapd/hostapd.conf"|' /etc/default/hostapd

cp ./dnsmasq.conf /etc/dnsmasq.d/ameniedge.conf

echo "[4/5] Setting up Captive Portal NAT & IP Tables Redirection..."
# Enable IPv4 forwarding
sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" > /etc/sysctl.d/99-ameniedge.conf

# Flush existing rules on Wi-Fi interface
iptables -t nat -F
iptables -F

# Redirect all inbound HTTP (Port 80) on wlan0 to Station local Nginx proxy (Port 80)
iptables -t nat -A PREROUTING -i $WLAN_IF -p tcp --dport 80 -j DNAT --to-destination 192.168.4.1:80

# Save iptables rules across reboots
netfilter-persistent save

echo "[5/5] Launching Edge Services..."
systemctl unmask hostapd
systemctl enable hostapd
systemctl start hostapd

systemctl enable dnsmasq
systemctl restart dnsmasq

echo "=========================================================="
echo " AmeniEdge Station Wi-Fi Access Point is LIVE!"
echo " SSID: AmeniEdge-Station-North-SOS"
echo " IP: 192.168.4.1"
echo " Captive Portal will automatically redirect phones to /sos"
echo "=========================================================="
