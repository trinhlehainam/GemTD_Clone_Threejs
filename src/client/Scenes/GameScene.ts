import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import {GUI} from 'dat.gui'

import IScene from './IScene'
import SceneMng from '../Systems/SceneMng'
import TitleScene from './TitleScene'

export default class GameScene extends IScene {
    // Debug
    private stats: Stats
    private gui: GUI
    private cube: THREE.Mesh

    constructor(sceneMng: SceneMng) {
        super(sceneMng);

        this.stats = Stats();
        document.body.appendChild(this.stats.domElement);
        this.gui = new GUI();

        const planeGeo = new THREE.PlaneGeometry(60, 40);
        const planeMat = new THREE.MeshBasicMaterial({color: 0xaaaaaa});
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.rotateX(-0.5*Math.PI);
        this.scene.add(plane);

        const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
        const cubeMat = new THREE.MeshBasicMaterial({color: 0xffff00});
        this.cube = new THREE.Mesh(cubeGeo, cubeMat);
        this.cube.position.set(0,1,1);
        this.scene.add(this.cube);

        new OrbitControls(this.camera, this.sceneMng.GetRenderer().domElement);
    }

    Init(): boolean {
        this.sceneMng.GetRenderer().setClearColor(0x00aaaa);
        return true;
    }

    Update(deltaTime_s: number): void {
        this.cube.rotation.y += 1 * deltaTime_s;
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
