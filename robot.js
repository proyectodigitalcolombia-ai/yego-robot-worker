const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

/**
 * FUNCIÓN PARA DETECTAR CHROME EN ENTORNO DOCKER
 * En la imagen oficial de Puppeteer, Chrome siempre está en estas rutas.
 */
const getExecutablePath = () => {
    const paths = [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser'
    ];

    for (const exePath of paths) {
        if (fs.existsSync(exePath)) return exePath;
    }
    return null;
};

// Ruta de bienvenida y verificación
app.get('/', (req, res) => {
    const exePath = getExecutablePath();
    if (exePath) {
        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #2ecc71;">🤖 Robot Worker: ONLINE</h1>
                <div style="background: #e8f8f5; border: 1px solid #2ecc71; padding: 20px; border-radius: 8px; display: inline-block;">
                    <p>✅ <b>Chrome de Sistema detectado:</b></p>
                    <code>${exePath}</code>
                </div>
                <p style="margin-top: 20px; color: #7f8c8d;">Listo para procesar placas en <code>/api/robot</code></p>
            </div>
        `);
    } else {
        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #e74c3c;">🤖 Robot Worker: ERROR</h1>
                <p>❌ No se encontró Google Chrome en el sistema Docker.</p>
            </div>
        `);
    }
});

/**
 * API PARA SATRACK (Lógica de Navegación)
 */
app.post('/api/robot', async (req, res) => {
    const { placa, usuario_gps, clave_gps } = req.body;
    const exePath = getExecutablePath();

    if (!placa || !usuario_gps || !clave_gps) {
        return res.status(400).json({ error: "Faltan datos requeridos (placa, usuario, clave)" });
    }

    let browser;
    try {
        console.log(`🚀 Iniciando búsqueda para: ${placa}`);
        
        browser = await puppeteer.launch({
            executablePath: exePath,
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        
        // 1. Ir a Satrack (Ejemplo de flujo)
        await page.goto('https://www.satrack.com.co/', { waitUntil: 'network
