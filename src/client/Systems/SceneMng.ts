import {WebGLRenderer, Color, Clock, PerspectiveCamera, sRGBEncoding} from 'three'

import {LoadMng, ModelDataMng} from '../Systems/LoadMng'

import IScene from '../Scenes/IScene'
import TitleScene from '../Scenes/TitleScene'

export default class SceneMng {
    private renderer: WebGLRenderer
    private scene: IScene
    private clock: Clock
    
    constructor() {
        this.renderer = new WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(new Color(0x000000));
        this.renderer.outputEncoding = sRGBEncoding;
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        LoadMng.Create();

        this.clock = new Clock();

        this.scene = new TitleScene(this);
        this.Render();
    }

    async Init(): Promise<boolean> {
        ModelDataMng.LoadAsync('./assets/factory/eve.glb', 'eve');
        ModelDataMng.LoadAsync('./assets/factory/eve2.glb', 'eve2');
        ModelDataMng.LoadAsync('./assets/factory/swat-guy.glb', 'swat-guy');
        ModelDataMng.LoadAsync('./assets/factory/swat-guy2.glb', 'swat-guy2');

        await this.scene.Init();
        LoadMng.EnableLoadingScene(false);

        window.addEventListener('resize', this.onResizeWindow.bind(this));
        return true;
    }

    Run(): void {
        this.renderer.setAnimationLoop(this.Loop.bind(this));
    }

    Stop(): void {
        this.renderer.setAnimationLoop(null);
    }

    GetRenderer(): WebGLRenderer { return this.renderer; }

    private Loop(): void {
        const deltaTime_s = this.clock.getDelta();

        if (this.scene.IsChangeSceneEnable()) {
            this.scene.ChangeScene(this.scene).then(
                // Wait until change scene set up complele
                // Then start loop again
                scene =>  {
                    this.scene = scene;
                    this.Run();
                    LoadMng.EnableLoadingScene(false);
                }
            );
            
            // Stop loop and wait until change scene set up is done
            this.Stop();
            LoadMng.EnableLoadingScene(true);
            return;
        }

        this.scene.ProcessInput();
        this.scene.Update(deltaTime_s); 
        this.scene.Render();

        this.Render();
    }
    
    private Render(): void {
        this.renderer.render(this.scene.GetThreeScene(), this.scene.GetThreeCamera());
    }

    private onResizeWindow(): void {
        const camera = this.scene.GetThreeCamera();
        if (camera instanceof PerspectiveCamera) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
