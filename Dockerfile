# Usamos la imagen que ya tiene TODO preinstalado (Sistema, Chrome y Node)
FROM ghcr.io/puppeteer/puppeteer:latest

# Cambiamos a root para configurar carpetas
USER root

# Evitamos que Puppeteer intente descargar otro Chrome en el 'npm install'
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

# Copiamos solo lo necesario primero para aprovechar la caché
COPY package*.json ./

# Instalamos sin descargar Chrome de nuevo (ahorra tiempo y RAM)
RUN npm install --omit=dev

# Copiamos el resto
COPY . .

# Puerto de Render
EXPOSE 10000

# Iniciamos el robot
CMD ["node", "robot.js"]
