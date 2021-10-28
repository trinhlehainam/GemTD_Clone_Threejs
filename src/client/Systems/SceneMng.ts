import {LoadingManager, WebGLRenderer, Color, Clock, PerspectiveCamera, sRGBEncoding} from 'three'

import TextureMng from './TextureMng'
import ModelDataMng from './ModelDataMng'

import IScene from '../Scenes/IScene'
import TitleScene from '../Scenes/TitleScene'

export default class SceneMng {
    private renderer: WebGLRenderer
    private scene: IScene
    private loadMng: LoadingManager
    private clock: Clock
    private loading: HTMLElement
    
    constructor() {
        this.renderer = new WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(new Color(0x000000));
        this.renderer.outputEncoding = sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        this.loadMng = new LoadingManager();
        TextureMng.Create(this.loadMng);
        ModelDataMng.Create(this.loadMng);

        this.clock = new Clock();

        this.scene = new TitleScene(this);

        this.loading = document.querySelector('#loading') as HTMLElement;
        console.log(this.loading);
        this.loadMng.onLoad = this.onLoad.bind(this);

    }

    onLoad(): void {
        this.loading.style.display = 'none'; 
    }

    onProgress(): void {
        this.loading.style.display = 'flex';
    }

    async Init(): Promise<boolean> {
        ModelDataMng.LoadAsync('./assets/factory/eve.glb', 'eve');
        ModelDataMng.LoadAsync('./assets/factory/eve2.glb', 'eve2');
        ModelDataMng.LoadAsync('./assets/factory/factory1.glb', 'factory');
        ModelDataMng.LoadAsync('./assets/factory/factory2.glb', 'factory2');
        await ModelDataMng.GetAsync('eve', 'factory');

        this.scene.Init();

        this.renderer.setAnimationLoop(this.Loop.bind(this));
        window.addEventListener('resize', this.onResizeWindow.bind(this));
        return true;
    }

    Loop(): void {
        const deltaTime_s = this.clock.getDelta();
        this.scene.ProcessInput();

        if (this.scene.IsChangeSceneEnable()) {
            this.scene = this.scene.ChangeScene(this.scene); 
        }

        this.scene.Update(deltaTime_s); 

        this.scene.Render();
        this.renderer.render(this.scene.GetThreeScene(), this.scene.GetThreeCamera());
    }

    GetRenderer(): WebGLRenderer { return this.renderer; }

    private onResizeWindow(): void {
        const camera = this.scene.GetThreeCamera();
        if (camera instanceof PerspectiveCamera) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
