import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'

import IScene from './IScene'
import SceneMng from '../Systems/SceneMng'

import Player from '../Scripts/Player'

export default class GameScene extends IScene {
    private stats: Stats
    private player: Player
    private ground: THREE.Mesh
    
    // Debug
    private pointer: THREE.Vector2
    private raycaster: THREE.Raycaster
    private cursor: THREE.Mesh
    private arrow: THREE.ArrowHelper

    constructor(sceneMng: SceneMng) {
        super(sceneMng);

        this.sceneMng = sceneMng;
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            45, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera.position.set(50,80,130);
        this.camera.lookAt(0,0,0);

        this.stats = Stats();
        document.body.appendChild(this.stats.domElement);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(2,2,2);
        dirLight.target.lookAt(0,0,0);
        // dirLight.castShadow = true;
        this.scene.add(dirLight);

        const ambient = new THREE.AmbientLight(0x666666);
        this.scene.add(ambient);

        const axis = new THREE.AxesHelper(10);
        this.scene.add(axis);

        const groundGeo = new THREE.PlaneGeometry(100, 100);
        const groundMat = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.scene.add(this.ground);
        // this.ground.receiveShadow = true;
        this.ground.rotateX(-0.5*Math.PI);

        const grid = new THREE.GridHelper(100, 10);
        this.scene.add(grid);

        new OrbitControls(this.camera, this.sceneMng.GetRenderer().domElement);

        this.player = new Player(this.scene);
        
        const cursorGeo = new THREE.BoxGeometry(10,10,10);
        const cursorMat = new THREE.MeshBasicMaterial({color: 0x00ff00, opacity: 0.5, transparent: true});
        this.cursor = new THREE.Mesh(cursorGeo, cursorMat);
        this.scene.add(this.cursor);
            
        this.pointer = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        this.arrow = new THREE.ArrowHelper();
        this.arrow.setLength(10);
        this.scene.add(this.arrow);

        document.addEventListener('pointermove', this.onPointerMove.bind(this));
    }

    onPointerMove(event: PointerEvent): void {
       this.pointer.set(
           +(event.clientX/window.innerWidth)*2-1,
           -(event.clientY/window.innerHeight)*2+1
       );
       console.log(event.clientX + ' ' + event.clientY);

       this.raycaster.setFromCamera( this.pointer, this.camera );

       const intersects = this.raycaster.intersectObject(this.ground, false);

       if (intersects.length > 0) {
           const intersect = intersects[0];
           const normal = new THREE.Vector3();
           console.log((intersects[0].face as THREE.Face).normal);
           normal.copy((intersects[0].face as THREE.Face).normal);
           normal.transformDirection(intersects[0].object.matrixWorld);
           console.log(normal);
           this.arrow.setDirection(normal);
           this.arrow.position.copy(intersects[0].point);
           this.cursor.position.copy(intersect.point).add(normal);
           this.cursor.position.divideScalar(10).floor().multiplyScalar(10).addScalar(5);
       }
       console.log(this.cursor.position);
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
        return scene;
    }
}
