const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path'); // <--- ¡Esto es vital para que funcione path.join!

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// --- TU FUNCIÓN COMPLETA ---
const getExecutablePath = () => {
    // __dirname nos da la ruta absoluta de la carpeta donde vive robot.js
    const localDir = path.join(__dirname, 'chrome_data');
    
    if (!fs.existsSync(localDir)) {
        console.log("❌ La carpeta chrome_data no existe en: " + localDir);
        return null;
    }

    const findBinary = (dir) => {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                const found = findBinary(fullPath);
                if (found) return found;
            } else if (item === 'chrome' && !fullPath.includes('.sh') && !fullPath.includes('headless-shell')) {
                return fullPath;
            }
        }
        return null;
    };
    return findBinary(localDir);
};

// --- RUTA DE PRUEBA PARA VER EL RESULTADO ---
app.get('/', (req, res) => {
    const exePath = getExecutablePath();
    if (exePath) {
        res.send(`<h1>🤖 Robot Worker Activo</h1><p>✅ Chrome detectado en: <b>${exePath}</b></p>`);
    } else {
        res.send(`<h1>🤖 Robot Worker Activo</h1><p>❌ Chrome detectado: <b>NO INSTALADO</b></p>`);
    }
});

// --- TU LÓGICA DE API AQUÍ ---
app.post('/api/robot', async (req, res) => {
    // Aquí es donde usarás: executablePath: getExecutablePath()
    // ...
});

app.listen(PORT, () => console.log(`🚀 Puerto: ${PORT}`));
