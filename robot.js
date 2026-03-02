const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

app.post('/api/robot', async (req, res) => {
    const { placa, url_plataforma, usuario_gps, clave_gps } = req.body;
    
    console.log(`[ROBOT] 📥 Orden recibida: Placa ${placa}`);

    // Enviamos respuesta inmediata a la plataforma para que no se quede esperando
    res.status(200).json({ mensaje: "Robot en camino", placa });

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
                '--single-process'
            ]
        });

        const page = await browser.newPage();
        
        // Configuramos un tiempo de espera largo para redes lentas
        await page.setDefaultNavigationTimeout(60000);

        console.log(`[NAVEGADOR] Entrando a: ${url_plataforma || 'URL no definida'}`);
        
        if (url_plataforma) {
            await page.goto(url_plataforma, { waitUntil: 'networkidle2' });
            
            // Aquí el robot ya está en la web. 
            // Podríamos agregar la lógica para escribir usuario y clave si nos das los IDs
            console.log(`[EXITO] Robot posicionado en la web para placa: ${placa}`);
        } else {
            console.log(`[AVISO] No se recibió URL, el robot se detendrá.`);
        }

    } catch (error) {
        console.error(`[ERROR] El robot falló: ${error.message}`);
    } finally {
        // Mantenemos el navegador abierto un momento y luego cerramos
        // En un worker real, podrías dejarlo abierto haciendo el monitoreo
        setTimeout(async () => {
            if (browser) await browser.close();
            console.log(`[SISTEMA] Navegador cerrado para ${placa}.`);
        }, 30000); // 30 segundos de gracia
    }
});

app.get('/', (req, res) => {
    res.send('🚀 YEGO ROBOT WORKER V20 - ACTIVO Y LISTO');
});

app.listen(PORT, () => {
    console.log(`🚀 Robot Worker escuchando en puerto ${PORT}`);
});
