const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

app.post('/api/robot', async (req, res) => {
    const { placa, usuario_gps, clave_gps } = req.body;
    const urlSatrack = "https://login.satrack.com/login";
    
    console.log(`[ROBOT] 📥 Orden recibida: Placa ${placa}`);
    res.status(200).json({ mensaje: "Robot iniciando en Satrack", placa });

    let browser;
    try {
        console.log(`[SISTEMA] Lanzando navegador...`);
        
        browser = await puppeteer.launch({
            headless: "new",
            // Forzamos a Puppeteer a buscar en la carpeta de instalación de Render
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

        console.log(`[SATRACK] Identificando campos para ${usuario_gps}...`);
        await page.waitForSelector('input[name="username"]', { visible: true, timeout: 15000 });
        
        await page.type('input[name="username"]', usuario_gps);
        await page.type('input[name="password"]', clave_gps);

        console.log(`[SATRACK] Pulsando botón de ingreso...`);
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]);

        console.log(`[EXITO] Sesión abierta para la placa ${placa}`);

    } catch (error) {
        console.error(`[ERROR] Falló el proceso: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
            console.log(`[SISTEMA] Proceso terminado para ${placa}.`);
        }
    }
});

app.get('/', (req, res) => res.send('🤖 ROBOT SATRACK V20 LISTO'));

app.listen(PORT, () => console.log(`🚀 Robot en puerto ${PORT}`));
