const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.json());

// FUNCIÓN DE BÚSQUEDA (La que ya tienes)
const getExecutablePath = () => {
    const localDir = path.join(__dirname, 'chrome_data');
    if (!fs.existsSync(localDir)) return null;

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

// RUTA PARA PRUEBAS (Entra aquí desde tu navegador)
app.get('/', (req, res) => {
    const exePath = getExecutablePath();
    if (exePath) {
        res.send(`<h1>🤖 Robot Worker Activo</h1><p>✅ Chrome detectado en: <b>${exePath}</b></p>`);
    } else {
        res.send(`<h1>🤖 Robot Worker Activo</h1><p>❌ Chrome detectado: <b>NO INSTALADO</b></p>`);
    }
});

// LÓGICA DEL ROBOT
app.post('/api/robot', async (req, res) => {
    const { placa, usuario_gps, clave_gps } = req.body;
    const exePath = getExecutablePath();

    if (!exePath) {
        return res.status(500).json({ error: "Chrome no instalado en el servidor" });
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: exePath, // <--- USA LA RUTA QUE ENCONTRAMOS
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        // ... aquí va tu lógica de Satrack ...
        res.json({ mensaje: "Robot trabajando...", placa });
        
    } catch (e) {
        res.status(500).json({ error: e.message });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => console.log(`🚀 Puerto: ${PORT}`));
