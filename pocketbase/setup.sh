#!/bin/bash

# PocketBase Setup Script for Linux/Mac
# Downloads PocketBase, creates data directory, applies migrations, and creates admin account

set -e

POCKETBASE_VERSION="0.25.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PB_DIR="$SCRIPT_DIR"

echo "=== DP Store - PocketBase Setup ==="
echo ""

# Detect OS and Architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$ARCH" in
  x86_64)
    ARCH="amd64"
    ;;
  aarch64|arm64)
    ARCH="arm64"
    ;;
  *)
    echo "Error: Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

case "$OS" in
  linux)
    PLATFORM="linux"
    ;;
  darwin)
    PLATFORM="darwin"
    ;;
  *)
    echo "Error: Unsupported OS: $OS"
    echo "Use setup.ps1 for Windows"
    exit 1
    ;;
esac

DOWNLOAD_URL="https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_${PLATFORM}_${ARCH}.zip"
BINARY_PATH="$PB_DIR/pocketbase"

echo "[1/5] Detecting platform: ${PLATFORM}_${ARCH}"
echo "       Download URL: $DOWNLOAD_URL"
echo ""

# Check if PocketBase binary already exists
if [ -f "$BINARY_PATH" ]; then
  echo "[INFO] PocketBase binary already exists at $BINARY_PATH"
  echo "       Skipping download. Delete the binary to re-download."
  echo ""
else
  # Download PocketBase
  echo "[2/5] Downloading PocketBase v${POCKETBASE_VERSION}..."
  TEMP_ZIP="$PB_DIR/pocketbase_temp.zip"
  curl -L -o "$TEMP_ZIP" "$DOWNLOAD_URL"

  # Extract binary
  echo "[3/5] Extracting PocketBase binary..."
  unzip -o "$TEMP_ZIP" pocketbase -d "$PB_DIR"
  rm -f "$TEMP_ZIP"
  chmod +x "$BINARY_PATH"
  echo "       Binary extracted to: $BINARY_PATH"
  echo ""
fi

# Create data directory
echo "[4/5] Creating data directory..."
mkdir -p "$PB_DIR/pb_data"
echo "       Data directory: $PB_DIR/pb_data"
echo ""

# Apply migrations
echo "[5/5] Applying migrations..."
"$BINARY_PATH" migrate --dir="$PB_DIR/pb_data" --migrationsDir="$PB_DIR/pb_migrations"
echo ""

# Create superadmin account
echo "[ADMIN] Creating superadmin account..."
"$BINARY_PATH" superuser create admin@dpstore.vn admin123456 --dir="$PB_DIR/pb_data" 2>/dev/null || echo "       Admin account may already exist (skipping)"
echo ""

echo "=== Setup Complete ==="
echo ""
echo "To start PocketBase, run:"
echo "  npm run pb:start"
echo ""
echo "Or manually:"
echo "  $BINARY_PATH serve --http=127.0.0.1:8090 --dir=$PB_DIR/pb_data --migrationsDir=$PB_DIR/pb_migrations"
echo ""
echo "Admin Dashboard: http://127.0.0.1:8090/_/"
echo "Admin Email:     admin@dpstore.vn"
echo "Admin Password:  admin123456"
echo ""
