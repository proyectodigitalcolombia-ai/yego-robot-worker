const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.json());

// 1. Ruta de salud para verificar que el robot vive
app.get('/health', (req, res) => res.send("🤖 Robot Operativo y listo para monitorear."));

// 2. Ruta principal para recibir la orden desde la Plataforma Logística
app.post('/api/robot', async (req, res) => {
    const { placa, config_gps, cont } = req.body;
    
    console.log(`[ROBOT] 📥 Orden recibida: Placa ${placa} | Contenedor ${cont}`);

    // Respondemos de inmediato para que la plataforma no se quede bloqueada
    res.status(200).json({ mensaje: "Monitoreo iniciado correctamente" });

    let browser;
    try {
        console.log(`[SISTEMA] Iniciando navegador para ${placa}...`);
        
        browser = await puppeteer.launch({
            headless: "new",
            // ESTA RUTA ES CRÍTICA PARA RENDER:
            executablePath: '/opt/render/.cache/puppeteer/chrome/linux-121.0.6167.85/chrome-linux64/chrome',
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process',
                '--no-zygote'
            ]
        });

        const page = await browser.newPage();
        
        // Ajustamos el tamaño de la ventana para ahorrar RAM
        await page.setViewport({ width: 1280, height: 800 });

        console.log(`[NAVEGADOR] Entrando al GPS: ${config_gps.url}`);
        
        // Intentamos entrar a la URL del GPS
        await page.goto(config_gps.url, { 
            waitUntil: 'networkidle2', 
            timeout: 60000 
        });

        console.log(`[LOGIN] Procesando contenedor: ${cont}`);
        
        // Aquí el robot ya está dentro de la web. 
        // Puedes agregar comandos como page.type() o page.click() si los necesitas.
        
        console.log(`[EXITO] Monitoreo activo para placa: ${placa}`);

    } catch (err) {
        console.error(`[ERROR] El robot falló: ${err.message}`);
    } finally {
        // Mantenemos el navegador abierto un tiempo o lo cerramos según prefieras
        // Para pruebas iniciales, lo dejamos abierto.
        // if (browser) await browser.close();
    }
});

// 3. Configuración del Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 YEGO ROBOT WORKER V20`);
    console.log(`📍 Puerto: ${PORT}`);
    console.log(`🤖 Estado: LISTO`);
    console.log(`-----------------------------------------`);
});
