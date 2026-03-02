const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware para entender JSON
app.use(express.json());

/**
 * FUNCIÓN MAESTRA DE BÚSQUEDA DE CHROME
 * Busca en las 3 rutas posibles donde Render guarda archivos en planes de pago
 */
const getExecutablePath = () => {
    const pathsToTry = [
        '/opt/render/project/.render/chrome', // Ruta que vimos en tu log
        path.join(__dirname, 'chrome_data'),   // Ruta local del proyecto
        path.join(__dirname, 'node_modules', '.cache', 'puppeteer') // Ruta de caché de Node
    ];

    console.log("--- 🔍 Iniciando búsqueda de Chrome ---");

    for (const baseDir of pathsToTry) {
        if (fs.existsSync(baseDir)) {
            console.log(`Probando en: ${baseDir}`);
            
            const findBinary = (dir) => {
                try {
                    const items = fs.readdirSync(dir);
                    for (const item of items) {
                        const fullPath = path.join(dir, item);
                        const stat = fs.statSync(fullPath);
                        
                        if (stat.isDirectory()) {
                            const found = findBinary(fullPath);
                            if (found) return found;
                        } else if (item === 'chrome' && !fullPath.includes('.sh') && !fullPath.includes('headless-shell')) {
                            return fullPath;
                        }
                    }
                } catch (e) {
                    return null;
                }
                return null;
            };

            const result = findBinary(baseDir);
            if (result) return result;
        }
    }
    return null;
};

/**
 * RUTA PRINCIPAL (Página de inicio)
 * Sirve para verificar si el robot tiene "ojos" (Chrome)
 */
app.get('/', (req, res) => {
    const exePath = getExecutablePath();
    if (exePath) {
        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1>🤖 Robot Worker Activo</h1>
                <div style="background: #d4edda; color: #155724; padding: 20px; border-radius: 10px; display: inline-block;">
                    ✅ <b>Chrome Detectado:</b><br>
                    <code>${exePath}</code>
                </div>
                <p>Listo para recibir peticiones POST en <code>/api/robot</code></p>
            </div>
        `);
    } else {
        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1>🤖 Robot Worker Activo</h1>
                <div style="background: #f8d7da; color: #721c24; padding: 20px; border-radius: 10px; display: inline-block;">
                    ❌ <b>Chrome:</b> NO INSTALADO
                </div>
                <p>Revisa el log del Build en Render para ver qué pasó en el PASO 3.</p>
            </div>
        `);
    }
});

/**
 * API PARA PROCESAR PLACAS (Satrack)
 */
app.post('/api/robot', async (req, res) => {
    const { placa, usuario_gps, clave_gps } = req.body;
    const exePath = getExecutablePath();

    if (!placa || !usuario_gps || !clave_gps) {
        return res.status(400).json({ error: "Faltan datos (placa, usuario_gps o clave_gps)" });
    }

    if (!exePath) {
        return res.status(500).json({ error: "Chrome no está disponible en el servidor" });
    }

    let browser;
    try {
        console.log(`🚀 Iniciando proceso para placa: ${placa}`);
        
        browser = await puppeteer.launch({
            executablePath: exePath,
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--single-process'
            ]
        });

        const page = await browser.newPage();
        
        // --- AQUÍ VA TU LÓGICA ESPECÍFICA DE SATRACK ---
        // Ejemplo: await page.goto('https://satrack.com/login');
        
        console.log(`✅ Robot terminó exitosamente con la placa: ${placa}`);
        res.json({ 
            status: "success", 
            message: `Placa ${placa} procesada correctamente`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("❌ Error en el robot:", error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

app.listen(PORT, () => {
    console.log(`
    =========================================
    🚀 SERVIDOR INICIADO EN PUERTO: ${PORT}
    🤖 LISTO PARA SATRACK
    =========================================
    `);
});
