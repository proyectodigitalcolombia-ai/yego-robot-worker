# Usamos una imagen que ya tiene Node y Chrome instalados
FROM ghcr.io/puppeteer/puppeteer:21.6.1

# Cambiamos al usuario root para instalar dependencias
USER root

# Creamos el directorio de la app
WORKDIR /app

# Copiamos el package.json
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de Render
EXPOSE 10000

# Comando para arrancar la app
CMD ["node", "robot.js"]
