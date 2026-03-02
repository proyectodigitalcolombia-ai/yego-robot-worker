#!/usr/bin/env bash
set -o errexit

echo "--- 📦 PASO 1: INSTALANDO DEPENDENCIAS (SIN CHROME) ---"
PUPPETEER_SKIP_DOWNLOAD=true npm install --no-audit

echo "--- 📂 PASO 2: LIMPIEZA ---"
rm -rf $PWD/chrome_data
mkdir -p $PWD/chrome_data

echo "--- 📥 PASO 3: DESCARGANDO CHROME (RUTA ABSOLUTA) ---"
# Usamos $PWD para asegurar que la ruta sea absoluta
PUPPETEER_CACHE_DIR=$PWD/chrome_data node node_modules/puppeteer/install.mjs

echo "--- ✅ BUILD COMPLETADO ---"
