#!/usr/bin/env bash
set -o errexit

npm install

# Instalamos Chrome directamente en una carpeta llamada 'chrome' en la raíz
echo "--- INSTALANDO NAVEGADOR ---"
PUPPETEER_CACHE_DIR=./chrome_data npx puppeteer install
echo "--- INSTALACIÓN FINALIZADA ---"
