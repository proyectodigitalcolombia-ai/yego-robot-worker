#!/usr/bin/env bash
set -o errexit

npm install

echo "--- 🛠️ INSTALANDO NAVEGADOR ---"
# Instalamos en una carpeta fija dentro del proyecto
PUPPETEER_CACHE_DIR=/opt/render/project/src/chrome_data npx puppeteer install

echo "--- 🔍 BUSCANDO RUTA REAL DEL EJECUTABLE ---"
# Este comando busca el archivo llamado 'chrome' y nos da la ruta completa
find /opt/render/project/src/chrome_data -name chrome -type f
echo "--- ✅ PROCESO DE BUILD FINALIZADO ---"
