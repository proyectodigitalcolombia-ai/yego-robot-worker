#!/usr/bin/env bash
# Salir inmediatamente si hay un error
set -o errexit

echo "--- 📦 PASO 1: INSTALANDO DEPENDENCIAS (SIN DESCARGAR CHROME AÚN) ---"
# Usamos la variable para que npm install no intente bajar su propio Chrome
PUPPETEER_SKIP_DOWNLOAD=true npm install --no-audit

echo "--- 📂 PASO 2: DEFINIENDO RUTA PERSISTENTE EN NODE_MODULES ---"
# Esta es la ruta que Render SIEMPRE mantiene: node_modules/.cache
export CACHE_DIR="$PWD/node_modules/.cache/puppeteer"
rm -rf "$CACHE_DIR"
mkdir -p "$CACHE_DIR"

echo "--- 📥 PASO 3: DESCARGANDO CHROME MANUALMENTE ---"
# Forzamos la descarga dentro de la carpeta protegida
PUPPETEER_CACHE_DIR="$CACHE_DIR" node node_modules/puppeteer/install.mjs

echo "--- ✅ BUILD COMPLETADO EXITOSAMENTE ---"
