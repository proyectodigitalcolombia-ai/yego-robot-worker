#!/usr/bin/env bash
# Salir si hay errores
set -o errexit

# 1. Instalar dependencias
npm install

# 2. Descargar Chrome en una ruta absoluta que persiste en Render
echo "--- INICIANDO DESCARGA DE CHROME ---"
PUPPETEER_CACHE_DIR=/opt/render/project/src/.cache/puppeteer npx puppeteer install
echo "--- CHROME DESCARGADO EXITOSAMENTE ---"
