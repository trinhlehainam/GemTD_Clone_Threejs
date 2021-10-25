import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'

import IScene from './IScene'
import SceneMng from '../Systems/SceneMng'
import TitleScene from './TitleScene'

import Stage  from '../Scripts/Stage'
import Player from '../Scripts/Player'

export default class GameScene extends IScene {
    private player: Player
    private stage: Stage
    
    // Debug
    private stats: Stats

    constructor(sceneMng: SceneMng) {
        super(sceneMng);

        this.sceneMng = sceneMng;
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            45, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.set(5,8,13);
        this.camera.lookAt(0,0,0);
        new OrbitControls(this.camera, this.sceneMng.GetRenderer().domElement);

        this.stats = Stats();
        document.body.appendChild(this.stats.domElement);

        this.stage = new Stage(this.scene, this.camera);
        this.player = new Player(this.scene, this.stage, this.camera);
    }

    Destroy(): void {
        document.body.removeChild(this.stats.domElement);
        this.player.destroy();
    }

    ProcessInput(): void {

    }

    Init(): boolean {
        this.sceneMng.GetRenderer().setClearColor(0x00aaaa);
        return true;
    }

    Update(deltaTime_s: number): void {
        this.player.processInput();

        this.player.update(deltaTime_s);
    }

    Render(): void {
        this.stats.update();
        this.player.render();
    }

    ChangeScene(scene: IScene): IScene {
        scene.Destroy();
        scene = new TitleScene(this.sceneMng);
        return scene;
    }
}
