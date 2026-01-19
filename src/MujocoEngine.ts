export class MujocoEngine {
    private static instance: MujocoEngine;
    private mujocoModule: any = null;

    private constructor() { }

    public static getInstance(): MujocoEngine {
        if (!MujocoEngine.instance) {
            MujocoEngine.instance = new MujocoEngine();
        }
        return MujocoEngine.instance;
    }

    public async init(): Promise<void> {
        if (this.mujocoModule) return;

        // 1. Cargar el glue code JS
        await this.loadScript('/mujoco_wasm.js');

        // 2. Obtener la función de inicialización global
        const loadMujoco = (window as any).load_mujoco;
        if (!loadMujoco) {
            throw new Error('Could not find load_mujoco global. Check if mujoco_wasm.js is loaded correctly.');
        }

        // 3. Instanciar WASM forzando la URL correcta
        this.mujocoModule = await loadMujoco({
            locateFile: (path: string) => {
                // Siempre devolver la ruta absoluta al archivo en public
                if (path.endsWith('.wasm')) {
                    return '/mujoco_wasm.wasm';
                }
                return path;
            }
        });

        console.log('Mujoco WASM initialized loaded.');
    }

    public getModule(): any {
        if (!this.mujocoModule) {
            throw new Error('MujocoEngine not initialized. Call init() first.');
        }
        return this.mujocoModule;
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
