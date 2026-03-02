const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

app.post('/api/robot', async (req, res) => {
    const { placa, usuario_gps, clave_gps } = req.body;
    const urlSatrack = "https://login.satrack.com/login";
    
    console.log(`[ROBOT] 📥 Orden recibida: Placa ${placa}`);
    
    // Verificación de seguridad de la variable de entorno
    if (!process.env.PUPPETEER_EXECUTABLE_PATH) {
        console.error("[CRÍTICO] La variable PUPPETEER_EXECUTABLE_PATH no está definida en Render.");
    }

    res.status(200).json({ mensaje: "Robot iniciando en Satrack", placa });

    let browser;
    try {
        console.log(`[SISTEMA] Intentando lanzar Chrome desde: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
        
        browser = await puppeteer.launch({
            headless: "new",
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, // Forzamos la ruta manual
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--single-process',
                '--no-zygote'
            ]
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        console.log(`[SATRACK] Abriendo página de login...`);
        await page.goto(urlSatrack, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log(`[SATRACK] Escribiendo credenciales para: ${usuario_gps}`);
        await page.waitForSelector('input[name="username"]', { visible: true, timeout: 15000 });
        
        await page.type('input[name="username"]', usuario_gps);
        await page.type('input[name="password"]', clave_gps);

        console.log(`[SATRACK] Pulsando botón de ingreso...`);
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]);

        console.log(`[EXITO] Sesión abierta correctamente para ${placa}`);

        // Aquí podrías capturar una captura de pantalla para debug:
        // await page.screenshot({ path: 'evidencia.png' });

    } catch (error) {
        console.error(`[ERROR] El robot falló: ${error.message}`);
    } finally {
        if (browser) {
            console.log(`[SISTEMA] Cerrando navegador...`);
            await browser.close();
        }
    }
});

app.get('/', (req, res) => {
    res.send(`
        <h1>🤖 YEGO ROBOT WORKER V20</h1>
        <p>Estado: LISTO</p>
        <p>Ruta de Chrome: ${process.env.PUPPETEER_EXECUTABLE_PATH || 'No configurada'}</p>
    `);
});

app.listen(PORT, () => {
    console.log(`🚀 Robot Satrack escuchando en puerto ${PORT}`);
    console.log(`📍 Path configurado: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
});
