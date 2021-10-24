import * as THREE from 'three'

export default class Stage {
    private tileNum: THREE.Vector2
    private tileSize: THREE.Vector2
    private ground: THREE.Mesh
    private scene: THREE.Scene

    // Debug
    private pointer: THREE.Vector2
    private raycaster: THREE.Raycaster
    private cursor: THREE.Mesh
    private arrow: THREE.ArrowHelper
    private camera: THREE.Camera

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;

        this.tileNum = new THREE.Vector2(38, 38);
        this.tileSize = new THREE.Vector2(5, 5);

        const groundGeo = new THREE.PlaneGeometry(
            this.tileNum.x * this.tileSize.x, this.tileNum.y * this.tileSize.y
        );
        const groundMat = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.receiveShadow = true;
        this.ground.rotateX(-Math.PI/2);
        this.scene.add(this.ground);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(20,80,80);
        dirLight.target.lookAt(0,0,0);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.set(4096, 4096);
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        dirLight.shadow.camera.bottom = -100;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 200;
        this.scene.add(dirLight);

        this.scene.add(new THREE.CameraHelper(dirLight.shadow.camera));

        const ambient = new THREE.AmbientLight(0x666666);
        this.scene.add(ambient);

        const axis = new THREE.AxesHelper(this.tileSize.x * 1.5);
        this.scene.add(axis);

        const grid = new THREE.GridHelper(this.tileNum.x * this.tileSize.x, this.tileNum.x);
        this.scene.add(grid);

        const cursorGeo = new THREE.BoxGeometry(this.tileSize.x, this.tileSize.x, this.tileSize.x);
        const cursorMat = new THREE.MeshBasicMaterial({color: 0x00ff00, opacity: 0.5, transparent: true});
        this.cursor = new THREE.Mesh(cursorGeo, cursorMat);
        this.scene.add(this.cursor);
            
        this.pointer = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        this.arrow = new THREE.ArrowHelper();
        this.arrow.setLength(this.tileSize.x * 1.5);
        this.scene.add(this.arrow);

        document.addEventListener('pointermove', this.onPointerMove.bind(this));
    }

    onPointerMove(event: PointerEvent): void {
       this.pointer.set(
           +(event.clientX/window.innerWidth)*2-1,
           -(event.clientY/window.innerHeight)*2+1
       );

       this.raycaster.setFromCamera( this.pointer, this.camera );

       const intersects = this.raycaster.intersectObject(this.ground, false);

       if (intersects.length > 0) {
           const intersect = intersects[0];
           const normal = new THREE.Vector3();
           normal.copy((intersects[0].face as THREE.Face).normal);
           normal.transformDirection(intersects[0].object.matrixWorld).normalize();
           this.arrow.setDirection(normal);
           this.arrow.position.copy(intersects[0].point);
           this.cursor.position.copy(intersect.point).add(normal);
           this.cursor.position
           .divideScalar(this.tileSize.x).floor().multiplyScalar(this.tileSize.x)
           .addScalar(this.tileSize.x/2);
       }
    }

    Update(delta_s: number): void {

    }

    Render(): void {

    }
}
