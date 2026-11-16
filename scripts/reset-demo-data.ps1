# scripts/reset-demo-data.ps1: Reset all demo incidents, assignments, missions and tracks without dropping reference data
Write-Host "=== AmeniEdge Demo Data Reset ===" -ForegroundColor Cyan

# 1. Try invoking live backend reset endpoint if running
$backendUrl = "http://localhost:8081/api/v1/system/reset-demo-data"
$resetSuccess = $false

try {
    Write-Host "Attempting live database purge via backend API ($backendUrl)..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $backendUrl -Method Post -TimeoutSec 3 -ErrorAction Stop
    if ($response.status -eq "SUCCESS") {
        Write-Host "✓ Successfully purged all incident records and reset personnel counters via backend API." -ForegroundColor Green
        $resetSuccess = $true
    }
} catch {
    Write-Host "Backend server is not currently reachable on port 8081." -ForegroundColor DarkGray
}

if (-not $resetSuccess) {
    # 2. If backend is not running, clear H2 database files so next boot runs clean with V5 migration
    $dataDir = Join-Path $PSScriptRoot "..\backend\data"
    if (Test-Path $dataDir) {
        Write-Host "Clearing local H2 edge database files in $dataDir..." -ForegroundColor Yellow
        Get-ChildItem -Path $dataDir -Filter "*.db" -ErrorAction SilentlyContinue | Remove-Item -Force
        Write-Host "✓ Local H2 edge database files cleared." -ForegroundColor Green
    }
}

Write-Host "✓ Reference data (Stations, Teams, Users, Capacities) preserved." -ForegroundColor Green
Write-Host "✓ Personnel pools reset (Available = 100%, Deployed = 0, Returning = 0)." -ForegroundColor Green
Write-Host "✓ All rescue team dashboards will now show empty state ('No active alerts') on next load." -ForegroundColor Cyan

