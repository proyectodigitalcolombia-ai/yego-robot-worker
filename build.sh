#!/usr/bin/env bash
set -o errexit

echo "--- 📦 PASO 1: INSTALANDO DEPENDENCIAS (SIN CHROME) ---"
# Forzamos el skip aquí también por si acaso
PUPPETEER_SKIP_DOWNLOAD=true npm install --no-audit

echo "--- 📂 PASO 2: LIMPIEZA ---"
rm -rf ./chrome_data
mkdir -p ./chrome_data

echo "--- 📥 PASO 3: DESCARGANDO CHROME MANUALMENTE ---"
# Aquí es donde SÍ queremos que se descargue, en nuestra carpeta específica
PUPPETEER_CACHE_DIR=./chrome_data node node_modules/puppeteer/install.mjs

echo "--- ✅ BUILD COMPLETADO ---"
