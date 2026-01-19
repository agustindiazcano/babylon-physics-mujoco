export class MujocoEngine {
    private static instance: MujocoEngine;
    private mujocoModule: any = null;
    private static readonly CDN_BASE_URL = 'https://cdn.jsdelivr.net/gh/agustindiazcano/babylon-physics-mujoco@main/public/';

    private constructor() { }

    public static getInstance(): MujocoEngine {
        if (!MujocoEngine.instance) {
            MujocoEngine.instance = new MujocoEngine();
        }
        return MujocoEngine.instance;
    }

    public async init(): Promise<void> {
        if (this.mujocoModule) return;

        // 1. Determinar la Base URL (Local vs CDN)
        const baseUrl = await this.determineBaseUrl();

        // 2. Cargar el glue code JS usando la Base URL decidida
        await this.loadScript(`${baseUrl}mujoco_wasm.js`);

        // 3. Obtener la función de inicialización global
        const loadMujoco = (window as any).load_mujoco;
        if (!loadMujoco) {
            throw new Error('Could not find load_mujoco global. Check if mujoco_wasm.js is loaded correctly.');
        }

        // 4. Instanciar WASM pasando la ubicación correcta del archivo .wasm
        this.mujocoModule = await loadMujoco({
            locateFile: (path: string) => {
                if (path.endsWith('.wasm')) {
                    return `${baseUrl}mujoco_wasm.wasm`;
                }
                return path;
            }
        });

        console.log(`Mujoco WASM initialized loaded from: ${baseUrl}`);
    }

    public getModule(): any {
        if (!this.mujocoModule) {
            throw new Error('MujocoEngine not initialized. Call init() first.');
        }
        return this.mujocoModule;
    }

    private async determineBaseUrl(): Promise<string> {
        try {
            // Intentar un fetch ligero (HEAD) para verificar si existe el archivo local
            const response = await fetch('/mujoco_wasm.wasm', { method: 'HEAD' });
            if (response.ok) {
                return '/'; // Usar ruta local
            }
        } catch (e) {
            // Ignorar errores de red y proceder al fallback
        }

        console.warn('Mujoco local files not found. Falling back to GitHub CDN...');
        return MujocoEngine.CDN_BASE_URL;
    }

    private loadScript(src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // Evitar cargar el script si ya existe
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = (e) => reject(new Error(`Failed to load script ${src}: ${e}`));
            document.head.appendChild(script);
        });
    }
}
