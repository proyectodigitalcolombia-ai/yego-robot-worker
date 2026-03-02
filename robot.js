const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

const CHROME_PATH = '/usr/bin/google-chrome-stable';

app.get('/', (req, res) => {
    const exists = fs.existsSync(CHROME_PATH);
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: ${exists ? '#2ecc71' : '#e74c3c'};">🤖 Robot Status: ${exists ? 'READY' : 'ERROR'}</h1>
            <p>✅ Chrome localizado en: <code>${CHROME_PATH}</code></p>
        </div>
    `);
});

app.post('/api/robot', async (req, res) => {
    const { placa, usuario_gps, clave_gps } = req.body;

    if (!placa || !usuario_gps || !clave_gps) {
        return res.status(400).json({ error: "Faltan datos: placa, usuario_gps o clave_gps" });
    }

    let browser;
    try {
        console.log(`[${new Date().toLocaleTimeString()}] Iniciando sesión para: ${usuario_gps}`);
        
        browser = await puppeteer.launch({
            executablePath: CHROME_PATH,
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        
        // 1. Ir a la página de Login
        await page.goto('https://apps.satrack.com/LogOn', { waitUntil: 'networkidle2', timeout: 60000 });

        // 2. Escribir Usuario (Satrack suele usar ID "UserName")
        await page.waitForSelector('#UserName', { timeout: 10000 });
        await page.type('#UserName', usuario_gps, { delay: 100 });

        // 3. Escribir Clave (Satrack suele usar ID "Password")
        await page.type('#Password', clave_gps, { delay: 100 });

        // 4. Clic en el botón de ingresar
        // Usamos un selector genérico para el botón de submit
        await Promise.all([
            page.click('button[type="submit"], input[type="submit"], #btnLogOn'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        // 5. Verificar si logramos entrar (buscando el título o un elemento interno)
        const currentUrl = page.url();
        const pageTitle = await page.title();

        console.log(`Sesión iniciada. URL actual: ${currentUrl}`);

        res.json({
            status: "success",
            mensaje: "Login procesado",
            urlFinal: currentUrl,
            titulo: pageTitle,
            placaBuscada: placa
        });

    } catch (error) {
        console.error("❌ Error en el proceso:", error.message);
        res.status(500).json({ 
            status: "error", 
            mensaje: "Error al interactuar con Satrack",
            detalle: error.message 
        });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Robot Satrack corriendo en puerto ${PORT}`);
});
