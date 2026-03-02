#!/usr/bin/env bash
set -o errexit

echo "--- 📦 PASO 1: INSTALANDO DEPENDENCIAS (MODO VERBOSE) ---"
# Forzamos a npm a decirnos cada archivo que baja
npm install --no-audit --loglevel=info

echo "--- 📂 PASO 2: LIMPIEZA ---"
rm -rf ./chrome_data
mkdir -p ./chrome_data

echo "--- 📥 PASO 3: DESCARGANDO CHROME ---"
PUPPETEER_CACHE_DIR=./chrome_data node node_modules/puppeteer/install.mjs

echo "--- ✅ BUILD COMPLETADO ---"
