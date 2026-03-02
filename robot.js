const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// RUTA FIJA: En la imagen ghcr.io/puppeteer/puppeteer:21.6.1 
// Chrome SIEMPRE está en esta ubicación:
const CHROME_PATH = '/usr/bin/google-chrome-stable';

app.get('/', (req, res) => {
    const exists = fs.existsSync(CHROME_PATH);
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: ${exists ? '#2ecc71' : '#e74c3c'};">
                🤖 Robot Status: ${exists ? 'READY' : 'CHROME NOT FOUND'}
            </h1>
            <div style="background: #f8f9fa; border: 1px solid #ddd; padding: 20px; border-radius: 8px; display: inline-block;">
                <p><b>Ruta de Chrome:</b> <code>${CHROME_PATH}</code></p>
                <p><b>Estado:</b> ${exists ? '✅ Localizado' : '❌ No detectado en esta ruta'}</p>
            </div>
        </div>
    `);
});

app.post('/api/robot', async (req, res) => {
    const { placa, usuario_gps, clave_gps } = req.body;

    if (!placa || !usuario_gps || !clave_gps) {
        return res.status(400).json({ error: "Faltan datos" });
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: CHROME_PATH,
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        await page.goto('https://apps.satrack.com/LogOn', { waitUntil: 'networkidle2' });
        
        const title = await page.title();
        res.json({ status: "success", title, placa });

    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Robot en puerto ${PORT}`);
});
