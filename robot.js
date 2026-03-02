const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Función para intentar encontrar el ejecutable si la variable falla
const getExecutablePath = () => {
    if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
        return process.env.PUPPETEER_EXECUTABLE_PATH;
    }
    // Ruta común en Render después del script de build que hicimos
    const fallbackPath = '/opt/render/project/src/chrome_data/chrome/linux-121.0.6167.85/chrome-linux64/chrome';
    if (fs.existsSync(fallbackPath)) return fallbackPath;
    
    return null;
};

app.post('/api/robot', async (req, res) => {
    const { placa, usuario_gps, clave_gps } = req.body;
    const urlSatrack = "https://login.satrack.com/login";
    
    console.log(`[ROBOT] 📥 Orden recibida: Placa ${placa}`);
    res.status(200).json({ mensaje: "Robot procesando", placa });

    let browser;
    try {
        const exePath = getExecutablePath();
        console.log(`[SISTEMA] Usando ejecutable en: ${exePath || 'RUTA NO ENCONTRADA'}`);

        browser = await puppeteer.launch({
            headless: "new",
            executablePath: exePath,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-zygote',
                '--single-process'
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });

        console.log(`[SATRACK] Entrando a login...`);
        await page.goto(urlSatrack, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log(`[SATRACK] Escribiendo credenciales...`);
        await page.waitForSelector('input[name="username"]', { visible: true, timeout: 20000 });
        await page.type('input[name="username"]', usuario_gps, { delay: 100 });
        await page.type('input[name="password"]', clave_gps, { delay: 100 });

        console.log(`[SATRACK] Click en Ingresar...`);
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
        ]);

        console.log(`[EXITO] Sesión iniciada para placa: ${placa}`);

    } catch (error) {
        console.error(`[ERROR] Fallo crítico: ${error.message}`);
    } finally {
        if (browser) {
            console.log(`[SISTEMA] Cerrando navegador.`);
            await browser.close();
        }
    }
});

app.get('/', (req, res) => {
    const path = getExecutablePath();
    res.send(`
        <body style="font-family:sans-serif; text-align:center; padding:50px;">
            <h1>🤖 YEGO ROBOT WORKER V20</h1>
            <p>Estado: <span style="color:green">ACTIVO</span></p>
            <p>Ruta Detectada: <code>${path || '❌ NO ENCONTRADA'}</code></p>
            ${!path ? '<p style="color:red">⚠️ Advertencia: El navegador no se instaló correctamente en el Build.</p>' : ''}
        </body>
    `);
});

app.listen(PORT, () => console.log(`🚀 Robot listo en puerto ${PORT}`));
