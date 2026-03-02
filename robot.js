const getExecutablePath = () => {
    // Buscamos en la carpeta persistente de Render
    const localDir = '/opt/render/project/.render/chrome';
    
    if (!fs.existsSync(localDir)) {
        console.log("❌ Carpeta persistente no encontrada");
        return null;
    }

    const findBinary = (dir) => {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            if (fs.statSync(fullPath).isDirectory()) {
                const found = findBinary(fullPath);
                if (found) return found;
            } else if (item === 'chrome' && !fullPath.includes('.sh') && !fullPath.includes('headless-shell')) {
                return fullPath;
            }
        }
        return null;
    };
    return findBinary(localDir);
};
