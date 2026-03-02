const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// PERMISOS: Esto permite que tu plataforma logística le envíe datos al robot
app.use(cors());
app.use(express.json());

const CHROME_PATH = '/usr/bin/google-chrome-stable';

// Página de estado para verificar que el robot sigue vivo
app.get('/', (req, res) => {
    const exists = fs.existsSync(CHROME_PATH);
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: ${exists ? '#2ecc71' : '#e74c3c'};">🤖 Robot Status: ${exists ? 'READY' : 'ERROR'}</h1>
            <p>✅ Chrome localizado en: <code>${CHROME_PATH}</code></p>
            <p style="color: #666;">Esperando peticiones POST desde tu plataforma logística...</p>
        </div>
    `);
});

// Ruta principal para el Login de Satrack
app.post('/api/robot', async (req, res) => {
    const { placa, usuario_gps, clave_gps } = req.body;

    if (!placa || !usuario_gps || !clave_gps) {
        return res.status(400).json({ error: "Faltan datos: placa, usuario_gps o clave_gps" });
    }

    let browser;
    try {
        console.log(`[${new Date().toLocaleTimeString()}] Intentando login para: ${usuario_gps}`);
        
        browser = await puppeteer.launch({
            executablePath: CHROME_PATH,
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        
        // 1. Ir a Satrack
        await page.goto('https://apps.satrack.com/LogOn', { waitUntil: 'networkidle2', timeout: 60000 });

        // 2. Llenar los campos (Selectores estándar de Satrack)
        await page.waitForSelector('#UserName', { timeout: 15000 });
        await page.type('#UserName', usuario_gps, { delay: 50 });
        await page.type('#Password', clave_gps, { delay: 50 });

        // 3. Clic en Entrar y esperar que cargue el mapa/inicio
        await Promise.all([
            page.click('button[type="submit"], #btnLogOn'),
            page.waitForNavigation({ waitUntil: 'networkidle2' })
        ]);

        const finalUrl = page.url();
        const title = await page.title();

        console.log(`✅ Login exitoso. URL actual: ${finalUrl}`);

        res.json({
            status: "success",
            mensaje: "Robot entró a Satrack correctamente",
            info: { url: finalUrl, titulo: title, placa }
        });

    } catch (error) {
        console.error("❌ Error en el proceso:", error.message);
        res.status(500).json({ 
            status: "error", 
            mensaje: "El robot no pudo completar el login",
            detalle: error.message 
        });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Robot Satrack corriendo en puerto ${PORT}`);
});
