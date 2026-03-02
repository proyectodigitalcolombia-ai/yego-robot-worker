# Usamos la imagen oficial que ya trae Chrome y Node instalados
FROM ghcr.io/puppeteer/puppeteer:latest

# Cambiamos a root para asegurar permisos de ejecución
USER root

# Variables de entorno para que Puppeteer sepa dónde está Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos librerías (Omitimos descargar otro Chrome para ahorrar RAM)
RUN npm install --omit=dev

# Copiamos todo tu código
COPY . .

# Puerto estándar de Render
EXPOSE 10000

# Comando de inicio
CMD ["node", "robot.js"]
