import {WebGLRenderer, Color, Clock, PerspectiveCamera} from 'three'

import IScene from '../Scenes/IScene'
import TitleScene from '../Scenes/TitleScene'
import KeyboardInput from '../Inputs/KeyboardInput'
import INPUT_ID from '../Inputs/InputID'

export default class SceneMng {
    private renderer: WebGLRenderer
    private scene: IScene
    private clock: Clock
    private controller: KeyboardInput
    
    constructor() {
        this.renderer = new WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(new Color(0x000000));
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        this.clock = new Clock();

        this.scene = new TitleScene(this);

        this.controller = new KeyboardInput([37,39,40,38,32]);

    }

    Init(): boolean {
        this.renderer.setAnimationLoop(this.Loop.bind(this));
        window.addEventListener('resize', this.onResizeWindow.bind(this));
        return true;
    }

    Loop(): void {
        const deltaTime_s = this.clock.getDelta();
        this.controller.Update();

        if (this.controller.IsJustPressed(INPUT_ID.SPACE)) {
           this.scene = this.scene.ChangeScene(this.scene); 
        }

        this.scene.Update(deltaTime_s); 

        this.scene.Render();
        this.renderer.render(this.scene.GetScene(), this.scene.GetCamera());
    }

    GetRenderer(): WebGLRenderer { return this.renderer; }

    private onResizeWindow(): void {
        const camera = this.scene.GetCamera();
        if (camera instanceof PerspectiveCamera) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
