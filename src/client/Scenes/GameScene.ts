import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import {GUI} from 'dat.gui'

import IScene from './IScene'
import SceneMng from '../Systems/SceneMng'
import TitleScene from './TitleScene'

import Player from '../Scripts/Player'

export default class GameScene extends IScene {
    // Debug
    private stats: Stats
    private gui: GUI
    private player: Player

    constructor(sceneMng: SceneMng) {
        super(sceneMng);

        this.stats = Stats();
        document.body.appendChild(this.stats.domElement);
        this.gui = new GUI();

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(2,2,2);
        dirLight.target.lookAt(0,0,0);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        const ambient = new THREE.AmbientLight(0x666666);
        this.scene.add(ambient);

        const axis = new THREE.AxesHelper(10);
        this.scene.add(axis);

        const planeGeo = new THREE.PlaneGeometry(60, 40);
        const planeMat = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.receiveShadow = true;
        plane.rotateX(-0.5*Math.PI);
        this.scene.add(plane);

        new OrbitControls(this.camera, this.sceneMng.GetRenderer().domElement);

        this.player = new Player(this.scene);
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
        this.gui.updateDisplay();
    }

    ChangeScene(scene: IScene): IScene {
        console.log('GameScene to TitleScene');
        scene = new TitleScene(this.sceneMng);
        return scene;
    }
}
