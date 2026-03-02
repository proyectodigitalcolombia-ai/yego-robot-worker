const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

const getExecutablePath = () => {
    // Ruta estándar en la imagen de Docker de Puppeteer
    const dockerPath = '/usr/bin/google-chrome-stable';
    return fs.existsSync(dockerPath) ? dockerPath : null;
};

app.get('/', (req, res) => {
    const exePath = getExecutablePath();
    res.send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #2ecc71;">🤖 Robot Worker: ONLINE</h1>
            <div style="background: #f4f4f4; border: 1px solid #ddd; padding: 20px; border-radius: 8px; display: inline-block;">
                <p>✅ <b>Chrome detectado en:</b></p>
                <code>${exePath || 'No encontrado'}</code>
            </div>
        </div>
    `);
});

app.post('/api/robot', async (req, res) => {
    const { placa, usuario_gps, clave_gps } = req.body;
    const exePath = getExecutablePath();

    if (!placa || !usuario_gps || !clave_gps) {
        return res.status(400).json({ error: "Faltan datos (placa, usuario_gps, clave_gps)" });
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: exePath,
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        
        // --- AQUÍ ESTABA EL ERROR DE ESCRITURA ---
        console.log(`Navegando a Satrack para placa: ${placa}`);
        await page.goto('https://www.satrack.com.co/', { waitUntil: 'networkidle2' });
        
        // Por ahora solo confirmamos que entró
        const title = await page.title();
        
        res.json({ 
            status: "success", 
            mensaje: "Robot entró a la web de Satrack",
            tituloPagina: title,
            placa 
        });

    } catch (error) {
        console.error("Error en el robot:", error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Robot listo en puerto ${PORT}`);
});
