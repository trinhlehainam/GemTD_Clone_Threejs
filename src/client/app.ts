import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import {GUI} from 'three/examples/jsm/libs/dat.gui.module'

import Entity from './GameObject/Entity'
import Transform from './Components/Transform'
import KeyboardInput from './Input/KeyboardInput'
import INPUT_ID from './Input/InputID'

export default class App {
    private renderer: THREE.WebGLRenderer
    private camera: THREE.PerspectiveCamera
    private scene: THREE.Scene
    private light: THREE.DirectionalLight
    private cube: THREE.Mesh
    private player: Entity
    private model?: THREE.Group
    private stats: Stats
    private gui: GUI
    private controller: KeyboardInput
    private mixer?: THREE.AnimationMixer
    private clock: THREE.Clock

    constructor(){
        this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(new THREE.Color(0x000000));
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            45, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0,2,2);
        this.camera.lookAt(this.scene.position);

        const ambient = new THREE.AmbientLight(0x666666);
        this.scene.add(ambient);

        this.light = new THREE.DirectionalLight(new THREE.Color(0xffffff), 1);
        this.light.position.set(1,2,2);
        this.light.castShadow = true;
        this.light.target.position.set(0,0,0);
        this.light.shadow.mapSize.set(2048, 2048);
        this.scene.add(this.light);

        const lightHelper = new THREE.CameraHelper(this.light.shadow.camera);
        this.scene.add(lightHelper);

        const groundGeo = new THREE.PlaneGeometry(60, 40);
        const groundMat = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.receiveShadow = true;
        ground.rotation.x = -0.5 * Math.PI;
        this.scene.add(ground);
        
        const url:string = './assets/factory/eve.glb'
        this.loadGLTF(url);

        const cubeGeo = new THREE.BoxGeometry(1,1,1);
        const cubeMat = new THREE.MeshPhongMaterial({color: 0x00ff00});
        this.cube = new THREE.Mesh(cubeGeo, cubeMat);
        this.cube.position.set(0,1,-2);
        this.cube.castShadow = true;
        this.scene.add(this.cube);

        new OrbitControls(this.camera, this.renderer.domElement);

        this.stats = Stats();
        this.gui = new GUI();
        document.body.appendChild(this.stats.domElement);

        this.controller = new KeyboardInput([37,39,40,18]);

        this.player = new Entity('player');
        this.player.AddComponent(Transform);

        this.clock = new THREE.Clock();
    }

    run(): void{
        this.renderer.setAnimationLoop(this.loop.bind(this));
        window.addEventListener('resize', this.onResizeWindow.bind(this));
    }

    loop(): void{
        const dt_s = this.clock.getDelta();

        // Process Input
        this.controller.Update();

        // Update
        if (this.controller.IsPressed(INPUT_ID.LEFT))
            this.cube.rotation.x += 0.01;
        if (this.controller.IsPressed(INPUT_ID.UP))
            this.cube.rotation.y += 0.01;
        this.mixer?.update(dt_s);
        
        // Render
        this.stats.update();
        this.gui.updateDisplay();
        this.renderer.render(this.scene, this.camera);
    }

    addGUI(): void {
        const cube = this.gui.addFolder('CUBE'); 
        cube.add(this.cube.rotation, 'x', 0, 2 * Math.PI);
        cube.add(this.cube.rotation, 'y', 0, 2 * Math.PI);
        cube.add(this.cube.rotation, 'z', 0, 2 * Math.PI);
        cube.open();
        const player = this.gui.addFolder('PLAYER');
        const tranform = this.player.GetComponent(Transform);
        if (tranform){
            player.add(tranform.position, 'x', 0, 10, 0.1).onChange(()=>{
                if (this.model)
                    this.model.position.x = tranform.position.x;
            });
            player.add(tranform.position, 'y', 0, 10, 0.1).onChange(()=>{
                if (this.model)
                    this.model.position.y = tranform.position.y;
            });
            player.add(tranform.position, 'z', 0, 10, 0.1).onChange(()=>{
                if (this.model)
                    this.model.position.z = tranform.position.z;
            });
        }
        player.open();
    }

    private loadGLTF(url: string): void{
        const loader = new GLTFLoader(); 
        const draco = new DRACOLoader();
        draco.setDecoderPath('./js/libs/draco/');
        loader.setDRACOLoader(draco);

        loader.load(
            url,
            gltf => {
                this.model = gltf.scene;
                this.mixer = new THREE.AnimationMixer(this.model);
                const clip = this.mixer.clipAction(gltf.animations[1]);
                clip.play();
                this.model.traverse(node => {
                    if(node instanceof THREE.Mesh){
                        node.receiveShadow = true;
                        node.castShadow = true;
                    }
                })
                this.scene.add(this.model);
                this.addGUI();
                this.run();
            },
            xhr => {

            },
            err => {
                console.error(err);
            }
        )
    }

    private onResizeWindow(): void{
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}