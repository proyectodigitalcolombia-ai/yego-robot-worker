const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.json());

// Ruta para verificar si el robot está encendido
app.get('/health', (req, res) => res.send("🤖 Robot Operativo y listo para monitorear."));

app.post('/api/robot', async (req, res) => {
    const { placa, config_gps, cont } = req.body;
    console.log(`[ROBOT] 📥 Orden recibida: Placa ${placa} | Contenedor ${cont}`);

    // Respondemos rápido para que la web no se quede "pensando"
    res.status(200).json({ mensaje: "Monitoreo en proceso" });

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process'
            ]
        });

        const page = await browser.newPage();
        console.log(`[NAVEGADOR] Abriendo GPS: ${config_gps.url}`);
        
        await page.goto(config_gps.url, { waitUntil: 'networkidle2', timeout: 60000 });

        // Ejemplo de logueo (esto lo ajustamos según la web del GPS)
        console.log(`[LOGIN] Intentando acceso para contenedor: ${cont}`);
        
        // Mantener el navegador abierto o tomar captura
        console.log(`[EXITO] Monitoreando placa: ${placa}`);

    } catch (err) {
        console.error(`[ERROR] Fallo en el robot: ${err.message}`);
    } finally {
        // Opcional: Cerrar después de un tiempo para no llenar la RAM de Render
        // if (browser) await browser.close();
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Robot escuchando en puerto ${PORT}`));
