const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.json());

// Ruta de prueba para saber si el robot está vivo
app.get('/health', (req, res) => res.send("Robot Operativo 🤖✅"));

app.post('/api/robot', async (req, res) => {
    const { placa, config_gps, cont } = req.body;
    
    console.log(`[ROBOT] 🤖 Orden recibida para Placa: ${placa}`);
    
    // Respondemos de inmediato para que la plataforma no se quede esperando
    res.status(200).json({ mensaje: "Proceso de monitoreo iniciado" });

    let browser;
    try {
        console.log(`[NAVEGADOR] Intentando abrir Chrome para: ${placa}`);
        
        browser = await puppeteer.launch({
            headless: "new", // "new" es el modo recomendado en versiones actuales
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // Vital para que no se cierre en Render Free
                '--single-process'
            ]
        });

        const page = await browser.newPage();
        
        // Ajustamos el tiempo de espera (30 segundos)
        await page.setDefaultNavigationTimeout(30000);

        console.log(`[NAVEGADOR] Entrando a la URL del GPS...`);
        await page.goto(config_gps.url, { waitUntil: 'networkidle2' });

        // Aquí el robot interactúa con el GPS
        console.log(`[LOGIN] Usando usuario: ${config_gps.usuario}`);
        // Ejemplo de logueo (esto depende de cada plataforma GPS):
        // await page.type('#user', config_gps.usuario);
        // await page.type('#pass', config_gps.clave);
        // await page.click('#loginBtn');

        console.log(`[EXITO] Monitoreando contenedor: ${cont} | Placa: ${placa}`);
        
        // Mantener abierto el tiempo necesario o cerrar tras la acción
        // await browser.close(); 

    } catch (err) {
        console.error(`[ERROR] Fallo en el robot para ${placa}:`, err.message);
        if (browser) await browser.close();
    }
});

// Usamos el puerto que Render nos asigne o el 4000 por defecto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Robot activo y escuchando en puerto ${PORT}`);
});
