import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'

import {ModelDataMng} from '../Systems/LoadMng'

import IScene from './IScene'
import SceneMng from '../Systems/SceneMng'
import TitleScene from './TitleScene'

import GameMng  from '../Scripts/GameMng'
import Player from '../Scripts/Player'
import Enemy from '../Scripts/Enemy'

export default class GameScene extends IScene {
    private player?: Player
    private gameMng?: GameMng
    
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

    }

    Destroy(): void {
        document.body.removeChild(this.stats.domElement);
        this.player?.destroy();
    }

    ProcessInput(): void {

    }

    Init(): Promise<boolean> {
        this.sceneMng.GetRenderer().setClearColor(0x00aaaa);
        return new Promise(
            async (resolve, reject) => {
                // Wait until Player's resources are loaded before create Player
                await ModelDataMng.GetAsync('eve', 'swat-guy');
                this.gameMng = new GameMng(this.scene, this.camera);
                this.player = new Player(this.scene, this.gameMng, this.camera);
                //
                resolve(true);
                reject('INIT ERROR: Fail to initialize GameScene !!!');
            }
        );
    }

    Update(deltaTime_s: number): void {
        this.player?.processInput();

        this.player?.update(deltaTime_s);
        this.gameMng?.Update(deltaTime_s);
    }

    Render(): void {
        this.gameMng?.Render();
        this.player?.render();
        this.stats.update();
    }

    ChangeScene(scene: IScene): Promise<IScene> {
        return new Promise(
            async (resolve, reject) => {
                scene.Destroy();
                scene = new TitleScene(this.sceneMng);
                await scene.Init();
                resolve(scene);
                reject('ERROR : Fail to change scene !!!');
            }
        );
    }
}
