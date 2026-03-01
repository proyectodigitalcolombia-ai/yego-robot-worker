const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.json());

app.post('/api/robot', async (req, res) => {
    const { placa, config_gps, contenedor } = req.body;
    
    console.log(`[ORDEN] 🤖 Iniciando rastreo: Placa ${placa}`);

    // Respuesta rápida al servidor de logística
    res.status(200).json({ status: 'Robot en camino' });

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // El robot va a la URL que recibió de la base de datos
        console.log(`[NAVEGADOR] Abriendo: ${config_gps.url}`);
        await page.goto(config_gps.url, { waitUntil: 'networkidle2' });

        // Lógica de Login (aquí se automatiza el ingreso)
        console.log(`[LOGIN] Usando usuario: ${config_gps.usuario}`);
        
        // Simulación de espera de carga
        await new Promise(r => setTimeout(r, 5000));
        
        console.log(`[EXITO] Robot monitoreando contenedor: ${contenedor}`);
        
    } catch (err) {
        console.error("[ERROR ROBOT]", err.message);
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Robot activo en puerto ${PORT}`));
