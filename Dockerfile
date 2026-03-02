# Usamos una versión estable y comprobada
FROM ghcr.io/puppeteer/puppeteer:21.6.1

# Cambiamos a root para instalar herramientas de sistema
USER root

# Instalamos 'which' para localizar el binario de Chrome automáticamente
RUN apt-get update && apt-get install -y which && rm -rf /var/lib/apt/lists/*

# Variables de entorno críticas
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

# Instalación de dependencias
COPY package*.json ./
RUN npm install --omit=dev

# Copiamos el código
COPY . .

EXPOSE 10000

CMD ["node", "robot.js"]
