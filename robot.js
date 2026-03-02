const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Función para encontrar el ejecutable de Chrome en la carpeta local
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
    
    res.status(200).json({ mensaje: "Robot iniciando...", placa });

    let browser;
    try {
        const exePath = getExecutablePath();
        if (!exePath) throw new Error("Chrome no encontrado en ./chrome_data");

        browser = await puppeteer.launch({
            headless: "new",
            executablePath: exePath,
            protocolTimeout: 120000,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process',
                '--no-zygote'
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
        
        console.log(`[SATRACK] Intentando Login...`);
        await page.goto("https://login.satrack.com/login", { waitUntil: 'networkidle2' });

        await page.waitForSelector('input[name="username"]', { visible: true });
        await page.type('input[name="username"]', usuario_gps);
        await page.type('input[name="password"]', clave_gps);
        
        await Promise.all([
            page.click('button[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]);

        console.log(`[EXITO] ✅ Sesión iniciada para ${placa}`);

    } catch (error) {
        console.error(`[ERROR] ❌ ${error.message}`);
    } finally {
        if (browser) await browser.close();
    }
});

app.get('/', (req, res) => {
    const pathFound = getExecutablePath();
    res.send(`<h1>🤖 Robot Worker Activo</h1><p>Chrome detectado: ${pathFound || '❌ NO INSTALADO'}</p>`);
});

app.listen(PORT, () => console.log(`🚀 Puerto: ${PORT}`));
