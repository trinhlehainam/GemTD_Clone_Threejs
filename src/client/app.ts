import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'

export default class App {
    private renderer: THREE.WebGLRenderer
    private camera: THREE.PerspectiveCamera
    private scene: THREE.Scene
    private light: THREE.DirectionalLight
    private model: THREE.Mesh
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

        this.light = new THREE.DirectionalLight(new THREE.Color(0xffffff), 1);
        this.light.position.set(1,2,2);
        this.light.castShadow = true;
        this.light.target.position.set(0,0,0);
        this.scene.add(this.light);

        const lightHelper = new THREE.CameraHelper(this.light.shadow.camera);
        this.scene.add(lightHelper);

        const groundGeo = new THREE.PlaneGeometry(60, 40);
        const groundMat = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.receiveShadow = true;
        ground.rotation.x = -0.5 * Math.PI;
        this.scene.add(ground);

        const cubeGeo = new THREE.BoxGeometry(1,1,1);
        const cubeMat = new THREE.MeshPhongMaterial({color: 0x00ff00});
        this.model = new THREE.Mesh(cubeGeo, cubeMat);
        this.model.position.set(0,1,0);
        this.model.castShadow = true;
        this.scene.add(this.model);

        new OrbitControls(this.camera, this.renderer.domElement);
    }

    run(): void{
        this.renderer.setAnimationLoop(this.loop.bind(this));
        window.addEventListener('resize', this.onResizeWindow.bind(this));
    }

    loop(): void{
        this.model.rotation.x += 0.01;
        this.model.rotation.y += 0.01;
        this.renderer.render(this.scene, this.camera);
    }

    private onResizeWindow(): void{
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
