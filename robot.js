const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
app.use(express.json());

app.post('/api/robot', async (req, res) => {
    const { placa, config_gps, cont } = req.body;
    console.log(`[ROBOT] 🤖 Orden recibida para Placa: ${placa}`);

    res.status(200).json({ mensaje: "Iniciado" });

    try {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        console.log(`[NAVEGADOR] Entrando a: ${config_gps.url}`);
        await page.goto(config_gps.url);

        // Aquí el robot haría el login automático con config_gps.usuario y clave
        console.log(`[EXITO] Monitoreando contenedor: ${cont}`);
        
    } catch (err) {
        console.error("Error en el robot:", err.message);
    }
});

app.listen(process.env.PORT || 4000, () => console.log("Robot activo puerto 4000"));
