#!/usr/bin/env bash
set -o errexit

echo "--- 📦 PASO 1: INSTALANDO DEPENDENCIAS ---"
PUPPETEER_SKIP_DOWNLOAD=true npm install --no-audit

echo "--- 📂 PASO 2: PREPARANDO CARPETA PERSISTENTE ---"
# Usamos una carpeta oculta que Render permite mantener
export CHROME_DIR="/opt/render/project/.render/chrome"
rm -rf "$CHROME_DIR"
mkdir -p "$CHROME_DIR"

echo "--- 📥 PASO 3: DESCARGANDO CHROME ---"
PUPPETEER_CACHE_DIR="$CHROME_DIR" node node_modules/puppeteer/install.mjs

echo "--- ✅ BUILD COMPLETADO ---"
