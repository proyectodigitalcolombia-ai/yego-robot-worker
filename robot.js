const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Función inteligente para localizar el ejecutable de Chrome en la carpeta local
const getExecutablePath = () => {
    const localDir = path.join(__dirname, 'chrome_data');
    if (!fs.existsSync(localDir)) return null;

    const findChrome = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                const found = findChrome(fullPath);
                if (found) return found;
            } else if (file === 'chrome' && !fullPath.includes('.sh')) {
                // Verificamos que sea el binario ejecutable
                return fullPath;
            }
        }
        return null;
    };
    return findChrome(localDir);
};

app.post('/api/robot', async (req, res) => {
    const { placa, usuario_gps, clave_gps } = req.body;
    console.log(`[ROBOT] 📥 Orden recibida: Placa ${placa}`);
    
    // Responder rápido para evitar que la plataforma logística marque error de timeout
    res.status(200).json({ mensaje: "Robot iniciando proceso en segundo plano...", placa });

    let browser;
    try {
        const exePath = getExecutablePath();
        console.log(`[SISTEMA] Intentando abrir Chrome en: ${exePath || 'NO ENCONTRADO'}`);

        if (!exePath) {
            throw new Error("ERROR CRÍTICO: El ejecutable de Chrome no existe. Revisa el Build Log.");
        }

        browser = await puppeteer.launch({
            headless: "new",
            executablePath: exePath,
            protocolTimeout: 120000, // 2 minutos para procesos lentos en Render
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-zygote',
                '--single-process'
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });

        console.log(`[SATRACK] Cargando página de login...`);
        await page.goto("https://login.satrack.com/login", { 
            waitUntil: 'networkidle2', 
            timeout: 60000 
        });

        console.log(`[SATRACK] Ingresando datos para ${usuario_gps}...`);
        await page.waitForSelector('input[name="username"]', { visible: true, timeout: 20000 });
        
        await page.type('input[name="username"]', usuario_gps, { delay: 50 });
        await page.type('input[name="password"]', clave_gps, { delay: 50 });

        console.log(`[SATRACK] Haciendo clic en el botón...`);
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 45000 }),
        ]);

        console.log(`[EXITO] ✅ Sesión iniciada correctamente para ${placa}`);

    } catch (error) {
        console.error(`[ERROR] ❌ Fallo en el robot: ${error.message}`);
    } finally {
        if (browser) {
            console.log(`[SISTEMA] Cerrando navegador para liberar memoria.`);
            await browser.close();
        }
    }
});

app.get('/', (req, res) => {
    const pathFound = getExecutablePath();
    res.send(`
        <div style="font-family: Arial; text-align: center; padding: 50px; background: #f
