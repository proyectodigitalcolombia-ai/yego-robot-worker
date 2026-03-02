const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

app.post('/api/robot', async (req, res) => {
    const { placa, usuario_gps, clave_gps } = req.body;
    const urlSatrack = "https://login.satrack.com/login";
    
    console.log(`[ROBOT] 📥 Orden recibida: Placa ${placa}`);
    
    // Responder de inmediato a la plataforma para evitar timeouts
    res.status(200).json({ mensaje: "Robot procesando en segundo plano", placa });

    let browser;
    try {
        console.log(`[SISTEMA] Lanzando desde: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
        
        browser = await puppeteer.launch({
            headless: "new",
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--single-process'
            ]
        });

        const page = await browser.newPage();
        // Definir un User Agent real para evitar ser detectado como bot básico
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });

        console.log(`[SATRACK] Abriendo página de login...`);
        await page.goto(urlSatrack, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log(`[SATRACK] Escribiendo credenciales para: ${usuario_gps}`);
        await page.waitForSelector('input[name="username"]', { visible: true, timeout: 20000 });
        
        await page.type('input[name="username"]', usuario_gps, { delay: 100 });
        await page.type('input[name="password"]', clave_gps, { delay: 100 });

        console.log(`[SATRACK] Pulsando botón de ingreso...`);
        // Intentar clic en el botón de submit
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
        ]);

        console.log(`[EXITO] Sesión abierta correctamente para ${placa}`);

    } catch (error) {
        console.error(`[ERROR] El robot falló: ${error.message}`);
        // Log extra para ver si el archivo realmente no existe
        if (error.message.includes('ENOENT')) {
            console.error(`[DIAGNOSTICO] El ejecutable en ${process.env.PUPPETEER_EXECUTABLE_PATH} NO fue encontrado.`);
        }
    } finally {
        if (browser) {
            console.log(`[SISTEMA] Cerrando navegador...`);
            await browser.close();
        }
    }
});

app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
            <h1>🤖 YEGO ROBOT WORKER V20</h1>
            <p style="color: green;">ESTADO: LISTO Y ESCUCHANDO</p>
            <hr style="width: 50%;">
            <p><strong>Ruta configurada:</strong><br> <code>${process.env.PUPPETEER_EXECUTABLE_PATH || 'No definida'}</code></p>
        </div>
    `);
});

app.listen(PORT, () => {
    console.log(`🚀 Robot Satrack escuchando en puerto ${PORT}`);
});
