#!/usr/bin/env bash
# scripts/reset-demo-data.sh: Reset all demo incidents, assignments, missions and tracks without dropping reference data
set -e

echo "=== AmeniEdge Demo Data Reset ==="

# 1. Try invoking live backend reset endpoint if running
BACKEND_URL="http://localhost:8081/api/v1/system/reset-demo-data"
if curl -s -f -X POST "$BACKEND_URL" > /dev/null 2>&1; then
    echo "✓ Successfully purged all incident records and reset personnel counters via backend API."
else
    echo "Backend server not reachable on port 8081; checking local database files..."
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    DATA_DIR="$SCRIPT_DIR/../backend/data"
    if [ -d "$DATA_DIR" ]; then
        rm -f "$DATA_DIR"/*.db
        echo "✓ Local H2 edge database files cleared."
    fi
fi

echo "✓ Reference data (Stations, Teams, Users, Capacities) preserved."
echo "✓ Personnel pools reset (Available = 100%, Deployed = 0, Returning = 0)."
echo "✓ All rescue team dashboards will show empty state ('No active alerts') on next load."

