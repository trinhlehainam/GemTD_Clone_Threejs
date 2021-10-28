import {TextureLoader, Texture, LoadingManager} from 'three'

export default class TextureMng {
    private static instance?: TextureMng
    private loader: TextureLoader
    private textureMap: Map<string, Texture>

    private constructor(loadMng: LoadingManager) {
        this.loader = new TextureLoader(loadMng);
        this.textureMap = new Map();
    }

    static Create(loadMng: LoadingManager): void {
        if (this.instance === undefined)
            this.instance = new TextureMng(loadMng);
    }

    static Destroy(): void {
        if (this.instance)
            this.instance = undefined;
    }

    static Load(url: string, key: string): boolean {
        if (!this.IsCreated()) return false;

        const instance = this.instance!;

        if (instance.textureMap.has(key)){
            console.log(`FALSE: ${key} in TextureMng already has a texture!!!`);
            return false
        }
        
        instance.textureMap.set(key, instance.loader.load(url));
        return true;
    }
    
    static ChangeTexture(url: string, key: string): boolean {
        if (!this.IsCreated()) return false;
        const instance = this.instance!;

        // If key doesn't has texture, add new one
        instance.textureMap.set(key, instance.loader.load(url));
        return true;
    }

    static DeleteTexture(key: string): boolean {
        if (!this.IsCreated()) return false;
        const instance = this.instance!;
        return instance.textureMap.delete(key);
    }

    static GetTexture(key: string): Texture | undefined {
        if (!this.IsCreated()) return undefined;
        const instance = this.instance!;
        return instance.textureMap.get(key);
    }

    private static IsCreated(): boolean {
        if (this.instance === undefined){
            console.log('FALSE: Instance of TextureMng is not created !!!');
            return false;
        }
        return true;
    }
}
