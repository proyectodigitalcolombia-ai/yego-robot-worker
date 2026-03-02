#!/usr/bin/env bash
# Salir si hay errores
set -o errexit

# Instalar dependencias de Node
npm install

# Descargar Chrome en la carpeta del proyecto para que sea persistente
echo "--- DESCARGANDO CHROME PARA PUPPETEER ---"
PUPPETEER_CACHE_DIR=./.cache/puppeteer npx puppeteer install
echo "--- INSTALACIÓN COMPLETADA ---"
