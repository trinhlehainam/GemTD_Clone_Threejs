import {WebGLRenderer, Color, Clock, PerspectiveCamera} from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import {GUI} from 'three/examples/jsm/libs/dat.gui.module'

import IScene from '../Scene/IScene'
import TitleScene from '../Scene/TitleScene'
import KeyboardInput from '../Input/KeyboardInput'
import INPUT_ID from '../Input/InputID'

export default class SceneMng {
    private renderer: WebGLRenderer
    private scene: IScene
    private clock: Clock
    private controller: KeyboardInput
    private stats: Stats
    private gui: GUI

    constructor() {
        this.renderer = new WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(new Color(0x000000));
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        this.clock = new Clock();
        this.stats = Stats();
        document.body.appendChild(this.stats.domElement);
        this.gui = new GUI();

        this.scene = new TitleScene();

        this.controller = new KeyboardInput([37,39,40,38,32]);

    }

    Init(): boolean {
        this.renderer.setAnimationLoop(this.Loop.bind(this));
        window.addEventListener('resize', this.onResizeWindow.bind(this));
        return true;
    }

    Run(): void {

    }

    Exit(): void {

    }

    Loop(): void {
        const deltaTime_s = this.clock.getDelta();

        if (this.controller.IsJustPressed(INPUT_ID.SPACE)) {
           this.scene = this.scene.ChangeScene(this.scene); 
        }

        this.scene.Update(deltaTime_s); 
        this.stats.update();
        this.gui.updateDisplay();
        this.renderer.render(this.scene.GetScene(), this.scene.GetCamera());
    }

    private onResizeWindow(): void {
        const camera = this.scene.GetCamera();
        if (camera instanceof PerspectiveCamera) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
