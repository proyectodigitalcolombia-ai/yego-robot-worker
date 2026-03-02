const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

/**
 * FUNCIÓN DE BÚSQUEDA RECURSIVA EN NODE_MODULES
 */
const getExecutablePath = () => {
    // Apuntamos a la carpeta de caché que creamos en build.sh
    const localDir = path.join(__dirname, 'node_modules', '.cache', 'puppeteer');
    
    if (!fs.existsSync(localDir)) {
        console.log("❌ Carpeta de caché no encontrada en: " + localDir);
        return null;
    }

    const findBinary = (dir) => {
        try {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    const found = findBinary(fullPath);
                    if (found) return found;
                } else if (item === 'chrome' && !fullPath.includes('.sh') && !fullPath.includes('headless-shell')) {
                    return fullPath;
                }
            }
        } catch (e) {
            return null;
        }
        return null;
    };
    return findBinary(localDir);
};

/**
 * VISTA PRINCIPAL PARA VERIFICACIÓN
 */
app.get('/', (req, res) => {
    const exePath = getExecutablePath();
    if (exePath) {
        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #2c3e50;">🤖 Robot Worker Activo</h1>
                <div style="background: #d4edda; color: #155724; padding: 20px; border-radius: 10px; display: inline-block; border: 1px solid #c3e6cb;">
                    <p style="margin: 0;">✅ <b>Chrome Detectado y Persistente:</b></p>
                    <code style="display: block; margin-top: 10px; background: white; padding: 5px;">${exePath}</code>
                </div>
                <p style="color: #7f8c8d; margin-top: 20px;">Listo para procesar placas de Satrack.</p>
            </div>
        `);
    } else {
        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #2c3e50;">🤖 Robot Worker Activo</h1>
                <div style="background: #f8d7da; color: #721c24; padding: 20px; border-radius: 10px; display: inline-block; border: 1px solid #f5c6cb;">
                    ❌ <b>Chrome:</b> NO INSTALADO EN NODE_MODULES
                </div>
                <p>Ejecuta un "Clear Cache and Deploy" en Render.</p>
            </div>
        `);
    }
});

/**
 * ENDPOINT PARA EL ROBOT
 */
app.post('/api/robot', async (req, res) => {
    const { placa, usuario_gps, clave_gps } = req.body;
    const exePath = getExecutablePath();

    if (!exePath) return res.status(500).json({ error: "Chrome no disponible" });

    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: exePath,
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });
        
        const page = await browser.newPage();
        // Aquí irá tu código de Satrack...
        
        res.json({ status: "success", placa });
    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => console.log(`🚀 Robot encendido en puerto ${PORT}`));
