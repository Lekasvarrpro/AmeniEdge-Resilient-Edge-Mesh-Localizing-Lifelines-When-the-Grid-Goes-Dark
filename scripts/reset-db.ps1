# Dev-only reset script: Wipes data and re-runs Flyway from clean slate
Write-Host "--- AmeniEdge Database Reset ---" -ForegroundColor Cyan

$dataDir = Join-Path $PSScriptRoot "..\backend\data"
if (Test-Path $dataDir) {
    Write-Host "Removing embedded edge database files from $dataDir..." -ForegroundColor Yellow
    Get-ChildItem -Path $dataDir -Filter "*.db" -ErrorAction SilentlyContinue | Remove-Item -Force
    Write-Host "Local H2 edge database files cleared." -ForegroundColor Green
} else {
    Write-Host "Data directory not found, creating $dataDir..."
    New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
}

Write-Host "Database wiped clean. Starting fresh Flyway schema migration on next backend run." -ForegroundColor Green
Write-Host "Run 'mvn spring-boot:run' inside /backend to initialize fresh database with zero preloaded incidents." -ForegroundColor Cyan

