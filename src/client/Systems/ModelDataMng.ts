import {Group, LoadingManager, AnimationClip} from 'three'
import {GLTFLoader, GLTF} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'

// TODO: Add load model from FBX and OBJ file
// TODO: refactoring data variable 
export default class ModelDataMng {
    private static instance?: ModelDataMng
    private gltfLoader: GLTFLoader
    private dracoLoader: DRACOLoader
    private objectMap: Map<string, Group>
    private animationMap: Map<string, AnimationClip>
    private gltfPromiseMap: Map<string, Promise<GLTF>>

    constructor(loadMng: LoadingManager) {
        this.gltfLoader = new GLTFLoader(loadMng);
        this.dracoLoader = new DRACOLoader(loadMng);
        this.dracoLoader.setDecoderPath('./js/libs/draco/');
        this.gltfLoader.setDRACOLoader(this.dracoLoader);

        this.objectMap = new Map();
        this.animationMap = new Map();
        this.gltfPromiseMap = new Map();
    }

    static Create(loadMng: LoadingManager): void {
        if (this.instance === undefined)
            this.instance = new ModelDataMng(loadMng);
    }

    static Destroy(): void {
        if (this.instance)
            this.instance = undefined;
    }

    static Load(url: string, key: string): boolean {
        if (!this.IsCreated()) return false;

        const instance = this.instance!;

        if (instance.objectMap.has(key)){
            console.log(`FALSE: ${key} in ModelMng already has a Model!!!`);
            return false
        }
        
        instance.gltfLoader.load(
            url,
            gltf => {
                instance.objectMap.set(key, gltf.scene);
                const animKeys = Object.keys(gltf.animations);
                for (let i = 0; i < animKeys.length - 1; ++i)
                    instance.animationMap.set(animKeys[i], gltf.animations[i]);
            }
        )
        return true;
    }

    static LoadAsync(url: string, key: string): boolean {
        if (!this.IsCreated()) return false;
        const instance = this.instance!;

        if (instance.gltfPromiseMap.has(key)){
            console.log(`FALSE: ${key} in ModelMng already has a Model!!!`);
            return false
        }

        instance.gltfPromiseMap.set(key, instance.gltfLoader.loadAsync(url));
        return true;
    }

    static async GetAsync(...keys: string[]) {
        if (!this.IsCreated()) return undefined;

        const instance = this.instance!;
        let promises: Array<Promise<GLTF>> = new Array();
        keys.forEach(key => promises.push(instance.gltfPromiseMap.get(key) as Promise<GLTF>))
        
        let data = await Promise.all(promises);
        
        return data;
    }

    static GetObject3D(key: string): Group | undefined {
        if (!this.IsCreated()) return undefined;
        const instance = this.instance!;
        return instance.objectMap.get(key);
    }

    static GetAnimationClip(key: string): AnimationClip | undefined {
        if (!this.IsCreated()) return undefined;
        const instance = this.instance!;
        return instance.animationMap.get(key);
    }

    private static IsCreated(): boolean {
        if (this.instance === undefined){
            console.log('FALSE: Instance of ModelMng is not created !!!');
            return false;
        }
        this.instance.objectMap.clear();
        this.instance.animationMap.clear();
        return true;
    }
    
}
