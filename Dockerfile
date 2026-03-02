# Usamos la imagen oficial estable
FROM ghcr.io/puppeteer/puppeteer:21.6.1

# No necesitamos ser root si no vamos a instalar paquetes de sistema
# Pero nos aseguramos de que las variables apunten al lugar correcto
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalación limpia
RUN npm install --omit=dev

# Copiar el código del robot
COPY . .

# Puerto para Render
EXPOSE 10000

# Ejecutar
CMD ["node", "robot.js"]
