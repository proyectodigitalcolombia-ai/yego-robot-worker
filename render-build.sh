#!/usr/bin/env bash
set -o errexit

npm install

echo "--- FORZANDO INSTALACIÓN DE CHROME EN RUTA ABSOLUTA ---"
# Instalamos Chrome directamente en la carpeta de ejecución de Render
npx puppeteer install --path /opt/render/project/src/.cache/puppeteer

echo "--- LISTANDO ARCHIVOS PARA VERIFICAR ---"
ls -R /opt/render/project/src/.cache/puppeteer || echo "No se encontró la carpeta"
