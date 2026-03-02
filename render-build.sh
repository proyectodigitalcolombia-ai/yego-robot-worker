#!/usr/bin/env bash
set -o errexit

npm install

echo "--- 🛠️ CREANDO CARPETA DE NAVEGADOR ---"
mkdir -p ./chrome_data

echo "--- 📥 INSTALANDO CHROME ---"
PUPPETEER_CACHE_DIR=./chrome_data npx puppeteer install

echo "--- 🔍 BUSCANDO RUTA REAL ---"
find ./chrome_data -name chrome -type f
echo "--- ✅ BUILD COMPLETADO ---"
