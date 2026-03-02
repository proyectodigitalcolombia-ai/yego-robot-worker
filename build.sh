#!/usr/bin/env bash
# Salir si hay error
set -o errexit

echo "--- 📦 PASO 1: INSTALANDO DEPENDENCIAS NPM ---"
npm install --no-audit

echo "--- 📂 PASO 2: CREANDO CARPETA PARA CHROME ---"
mkdir -p ./chrome_data

echo "--- 📥 PASO 3: DESCARGANDO NAVEGADOR (ESTO TARDA) ---"
# Usamos el comando directo de puppeteer para asegurar la descarga
PUPPETEER_CACHE_DIR=./chrome_data node node_modules/puppeteer/install.mjs

echo "--- 🔍 PASO 4: VERIFICANDO INSTALACIÓN ---"
find ./chrome_data -name chrome -type f

echo "--- ✅ PROCESO FINALIZADO CON ÉXITO ---"
