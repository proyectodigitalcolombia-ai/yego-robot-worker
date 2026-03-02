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
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        console.log(`[SATRACK] Entrando a login...`);
        await page.goto(urlFinal, { waitUntil: 'networkidle2' });

        // 1. Escribir Usuario
        // Satrack usa [name="username"] o [id="username"]
        console.log(`[SATRACK] Escribiendo credenciales...`);
        await page.waitForSelector('input[name="username"]', { visible: true });
        await page.type('input[name="username"]', usuario_gps);

        // 2. Escribir Clave
        await page.type('input[name="password"]', clave_gps);

        // 3. Clic en Iniciar Sesión
        // El botón suele ser de tipo submit o con una clase específica
        console.log(`[SATRACK] Haciendo clic en Ingresar...`);
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]);

        console.log(`[ÉXITO] Sesión iniciada para ${placa}. Buscando ubicación...`);

        // Aquí podrías agregar la lógica para buscar la placa en el buscador de Satrack
        // Por ahora, el robot ya entró al sistema.

    } catch (error) {
        console.error(`[ERROR] Fallo en Satrack: ${error.message}`);
    } finally {
        setTimeout(async () => {
            if (browser) await browser.close();
            console.log(`[SISTEMA] Robot finalizado para ${placa}.`);
        }, 60000); // Lo dejamos 1 minuto activo para que veas los resultados
    }
});

app.get('/', (req, res) => res.send('🤖 ROBOT SATRACK V20 ONLINE'));

app.listen(PORT, () => console.log(`🚀 Robot Satrack escuchando en ${PORT}`));
