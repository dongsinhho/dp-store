# PocketBase Setup Script for Windows
# Downloads PocketBase, creates data directory, applies migrations, and creates admin account

$ErrorActionPreference = "Stop"

$POCKETBASE_VERSION = "0.25.0"
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PB_DIR = $SCRIPT_DIR

Write-Host "=== DP Store - PocketBase Setup ===" -ForegroundColor Cyan
Write-Host ""

# Detect Architecture
$ARCH = if ([System.Environment]::Is64BitOperatingSystem) { "amd64" } else { "386" }

# Check for ARM64
if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") {
    $ARCH = "arm64"
}

$DOWNLOAD_URL = "https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_windows_${ARCH}.zip"
$BINARY_PATH = Join-Path $PB_DIR "pocketbase.exe"

Write-Host "[1/5] Detecting platform: windows_${ARCH}" -ForegroundColor Yellow
Write-Host "       Download URL: $DOWNLOAD_URL"
Write-Host ""

# Check if PocketBase binary already exists
if (Test-Path $BINARY_PATH) {
    Write-Host "[INFO] PocketBase binary already exists at $BINARY_PATH" -ForegroundColor Green
    Write-Host "       Skipping download. Delete the binary to re-download."
    Write-Host ""
} else {
    # Download PocketBase
    Write-Host "[2/5] Downloading PocketBase v${POCKETBASE_VERSION}..." -ForegroundColor Yellow
    $TEMP_ZIP = Join-Path $PB_DIR "pocketbase_temp.zip"
    
    try {
        Invoke-WebRequest -Uri $DOWNLOAD_URL -OutFile $TEMP_ZIP -UseBasicParsing
    } catch {
        Write-Host "Error: Failed to download PocketBase" -ForegroundColor Red
        Write-Host "       URL: $DOWNLOAD_URL"
        Write-Host "       Error: $_"
        exit 1
    }

    # Extract binary
    Write-Host "[3/5] Extracting PocketBase binary..." -ForegroundColor Yellow
    Expand-Archive -Path $TEMP_ZIP -DestinationPath $PB_DIR -Force
    Remove-Item $TEMP_ZIP -Force
    Write-Host "       Binary extracted to: $BINARY_PATH"
    Write-Host ""
}

# Create data directory
Write-Host "[4/5] Creating data directory..." -ForegroundColor Yellow
$DATA_DIR = Join-Path $PB_DIR "pb_data"
if (-not (Test-Path $DATA_DIR)) {
    New-Item -ItemType Directory -Path $DATA_DIR -Force | Out-Null
}
Write-Host "       Data directory: $DATA_DIR"
Write-Host ""

# Apply migrations
Write-Host "[5/5] Applying migrations..." -ForegroundColor Yellow
$MIGRATIONS_DIR = Join-Path $PB_DIR "pb_migrations"
& $BINARY_PATH migrate --dir="$DATA_DIR" --migrationsDir="$MIGRATIONS_DIR"
Write-Host ""

# Create superadmin account
Write-Host "[ADMIN] Creating superadmin account..." -ForegroundColor Yellow
try {
    & $BINARY_PATH superuser create admin@dpstore.vn admin123456 --dir="$DATA_DIR" 2>$null
} catch {
    Write-Host "       Admin account may already exist (skipping)" -ForegroundColor Gray
}
Write-Host ""

Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "To start PocketBase, run:" -ForegroundColor Cyan
Write-Host "  npm run pb:start"
Write-Host ""
Write-Host "Or manually:" -ForegroundColor Cyan
Write-Host "  .\pocketbase.exe serve --http=127.0.0.1:8090 --dir=.\pb_data --migrationsDir=.\pb_migrations"
Write-Host ""
Write-Host "Admin Dashboard: http://127.0.0.1:8090/_/" -ForegroundColor Cyan
Write-Host "Admin Email:     admin@dpstore.vn"
Write-Host "Admin Password:  admin123456"
Write-Host ""
