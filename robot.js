const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');       // <--- NECESARIO para fs.existsSync
const path = require('path');   // <--- NECESARIO para path.join

const app = express();
const PORT = process.env.PORT || 10000;
app.use(express.json());

// --- TU FUNCIÓN COMPLETA ---
const getExecutablePath = () => {
    // Buscamos en la carpeta persistente de Render que configuramos en build.sh
    const localDir = '/opt/render/project/.render/chrome';
    
    if (!fs.existsSync(localDir)) {
        console.log("❌ Carpeta persistente no encontrada en: " + localDir);
        return null;
    }

    const findBinary = (dir) => {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            try {
                if (fs.statSync(fullPath).isDirectory()) {
                    const found = findBinary(fullPath);
                    if (found) return found;
                } else if (item === 'chrome' && !fullPath.includes('.sh') && !fullPath.includes('headless-shell')) {
                    return fullPath;
                }
            } catch (err) {
                // Ignorar errores de permisos en carpetas del sistema
                continue;
            }
        }
        return null;
    };
    return findBinary(localDir);
};

// --- RUTA DE VERIFICACIÓN ---
app.get('/', (req, res) => {
    const exePath = getExecutablePath();
    if (exePath) {
        res.send(`<h1>🤖 Robot Worker Activo</h1><p>✅ Chrome detectado en: <b>${exePath}</b></p>`);
    } else {
        res.send(`<h1>🤖 Robot Worker Activo</h1><p>❌ Chrome detectado: <b>NO INSTALADO</b></p>`);
    }
});

// --- RUTA DE TRABAJO (API) ---
app.post('/api/robot', async (req, res) => {
    const { placa, usuario_gps, clave_gps } = req.body;
    const exePath = getExecutablePath();

    if (!exePath) {
        return res.status(500).json({ error: "Chrome no está listo todavía" });
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: exePath,
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });
        
        const page = await browser.newPage();
        // Aquí sigue tu lógica de Satrack...
        console.log(`[OK] Procesando placa: ${placa}`);
        
        res.json({ mensaje: "Robot trabajando", placa });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => console.log(`🚀 Robot en puerto ${PORT}`));
