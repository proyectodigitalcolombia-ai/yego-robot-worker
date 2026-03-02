const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

app.post('/api/robot', async (req, res) => {
    const { placa, url_plataforma, usuario_gps, clave_gps } = req.body;
    const urlFinal = url_plataforma || "https://login.satrack.com/login";
    
    console.log(`[ROBOT] 📥 Orden recibida: Placa ${placa}`);
    res.status(200).json({ mensaje: "Robot iniciando sesión en Satrack", placa });

    let browser;
    try {
        console.log(`[SISTEMA] Iniciando navegador para ${placa}...`);
        
        browser = await puppeteer.launch({
            headless: "new",
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

        console.log(`[SATRACK] Entrando a login...`);
        await page.goto(urlFinal, { waitUntil: 'networkidle2', timeout: 60000 });

        console.log(`[SATRACK] Escribiendo credenciales...`);
        await page.waitForSelector('input[name="username"]', { visible: true, timeout: 10000 });
        await page.type('input[name="username"]', usuario_gps);
        await page.type('input[name="password"]', clave_gps);

        console.log(`[SATRACK] Haciendo clic en Ingresar...`);
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]);

        console.log(`[ÉXITO] Sesión iniciada para ${placa}.`);

    } catch (error) {
        console.error(`[ERROR] Fallo en el proceso: ${error.message}`);
    } finally {
        setTimeout(async () => {
            if (browser) {
                await browser.close();
                console.log(`[SISTEMA] Navegador cerrado para ${placa}.`);
            }
        }, 30000);
    }
});

app.get('/', (req, res) => res.send('🤖 ROBOT SATRACK V20 ONLINE'));

app.listen(PORT, () => console.log(`🚀 Robot Satrack escuchando en puerto ${PORT}`));
