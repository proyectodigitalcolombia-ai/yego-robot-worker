const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Función "Detective" para encontrar Chrome
const getExecutablePath = () => {
    const paths = [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser'
    ];
    
    // 1. Buscar en rutas conocidas
    for (const path of paths) {
        if (fs.existsSync(path)) return path;
    }

    // 2. Si falla, preguntar al sistema (gracias a 'which')
    try {
        const foundPath = execSync('which google-chrome-stable || blue which google-chrome || which chromium')
            .toString().trim();
        if (foundPath) return foundPath;
    } catch (e) {
        console.log("No se pudo encontrar la ruta con 'which'");
    }

    return null;
};

app.get('/', (req, res) => {
    const exePath = getExecutablePath();
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #2ecc71;">🤖 Robot Worker: ONLINE</h1>
            <div style="background: #e8f8f5; border: 2px solid #2ecc71; padding: 20px; border-radius: 8px; display: inline-block;">
                <p>✅ <b>Chrome de Sistema detectado en:</b></p>
                <code style="background: #fff; padding: 5px 10px; border-radius: 4px; border: 1px solid #ccc;">
                    ${exePath || '❌ NO DETECTADO - Revisa el log de Render'}
                </code>
            </div>
            <p style="margin-top: 20px; color: #666;">Esperando peticiones POST para Satrack...</p>
        </div>
    `);
});

app.post('/api/robot', async (req, res) => {
    const { placa, usuario_gps, clave_gps } = req.body;
    const exePath = getExecutablePath();

    if (!placa || !usuario_gps || !clave_gps) {
        return res.status(400).json({ error: "Faltan datos (placa, usuario, clave)" });
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: exePath,
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        await page.goto('https://apps.satrack.com/LogOn', { waitUntil: 'networkidle2' });
        
        const title = await page.title();
        res.json({ status: "success", title, chromeUsed: exePath });

    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
    console.log(`🔎 Path detectado: ${getExecutablePath()}`);
});
