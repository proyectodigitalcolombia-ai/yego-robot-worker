const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Función para localizar Chrome en el sistema Docker
const getExecutablePath = () => {
    const paths = [
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/opt/google/chrome/google-chrome'
    ];
    
    for (const path of paths) {
        if (fs.existsSync(path)) return path;
    }
    return null;
};

// Página de bienvenida para verificar estado
app.get('/', (req, res) => {
    const exePath = getExecutablePath();
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #2ecc71;">🤖 Robot Worker: ONLINE</h1>
            <div style="background: #e8f8f5; border: 2px solid #2ecc71; padding: 20px; border-radius: 8px; display: inline-block;">
                <p>✅ <b>Chrome de Sistema detectado en:</b></p>
                <code style="background: #fff; padding: 5px 10px; border-radius: 4px; border: 1px solid #ccc;">
                    ${exePath || '❌ NO DETECTADO - Revisa el Dockerfile'}
                </code>
            </div>
            <p style="margin-top: 20px; color: #666;">Listo para recibir peticiones POST en /api/robot</p>
        </div>
    `);
});

// Endpoint principal para procesar Satrack
app.post('/api/robot', async (req, res) => {
    const { placa, usuario_gps, clave_gps } = req.body;
    const exePath = getExecutablePath();

    if (!placa || !usuario_gps || !clave_gps) {
        return res.status(400).json({ error: "Faltan datos requeridos (placa, usuario_gps, clave_gps)" });
    }

    if (!exePath) {
        return res.status(500).json({ error: "Chrome no fue localizado en el servidor" });
    }

    let browser;
    try {
        console.log(`[${new Date().toISOString()}] Iniciando proceso para placa: ${placa}`);
        
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
        
        // URL de Satrack (Ajústala si es necesario)
        await page.goto('https://apps.satrack.com/LogOn', { waitUntil: 'networkidle2', timeout: 60000 });
        
        // Aquí es donde agregaremos la lógica de escribir usuario y clave después
        const pageTitle = await page.title();
        
        res.json({ 
            status: "success", 
            message: "Conexión exitosa a la web de Satrack",
            info: {
                placa,
                titulo: pageTitle,
                chrome: exePath
            }
        });

    } catch (error) {
        console.error("❌ Error en el robot:", error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🔎 Chrome Path: ${getExecutablePath() || 'No encontrado'}`);
});
