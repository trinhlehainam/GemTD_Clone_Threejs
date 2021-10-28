import * as THREE from 'three'
import {CSG} from 'three-csg-ts'
import { Vector2 } from 'three'

// TODO: Refactoring function name
// TODO: Refactoring convert player tile pos
export default class Stage {
    private tileNum: THREE.Vector2
    private tileSize: THREE.Vector2
    private ground: THREE.Mesh
    private scene: THREE.Scene

    // Debug
    /* private pointer: THREE.Vector2
    private raycaster: THREE.Raycaster */
    private cursor: THREE.Mesh
    private camera: THREE.Camera

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;

        this.tileNum = new THREE.Vector2(38, 38);
        this.tileSize = new THREE.Vector2(5, 5);

        const groundGeo = new THREE.PlaneGeometry(
            this.tileNum.x * this.tileSize.x, this.tileNum.y * this.tileSize.y,
            this.tileNum.x, this.tileNum.y
        );
        const groundMat = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.name = 'ground';
        this.ground.receiveShadow = true;
        // NOTE: rotate vertices of Object3D for pathfinding work correctly
        this.ground.geometry.rotateX(-Math.PI/2);
        this.ground.quaternion.identity();
        this.ground.position.set(0, 0, 0);
        //
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
        const cursorMat = new THREE.MeshBasicMaterial({color: 0x00ff00, opacity: 0.5, transparent: true, visible: false});
        this.cursor = new THREE.Mesh(cursorGeo, cursorMat);
        this.scene.add(this.cursor);

        /* const box = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshNormalMaterial());
        const sphere = new THREE.Mesh(new THREE.SphereGeometry(1.2 , 8, 8));
        box.updateMatrix();
        sphere.updateMatrix();

        const subRes = CSG.subtract(box, sphere);
        this.scene.add(subRes); */
    }

    VecToMapPos(pos: THREE.Vector3): THREE.Vector3 {
        let ret = pos.clone();
        const tmpY = ret.y;
        return ret
           .divideScalar(this.tileSize.x).floor().multiplyScalar(this.tileSize.x)
           .addScalar(this.tileSize.x/2).setY(tmpY);
    }

    TileToMapPos(tilePos: THREE.Vector2): THREE.Vector3 {
        let tmpTilePos = tilePos.clone();
        tmpTilePos.addScalar(-this.tileNum.x/2);
        let ret = new THREE.Vector3(tmpTilePos.x*this.tileSize.x, 0, tmpTilePos.y*this.tileSize.y);
        return ret
           .divideScalar(this.tileSize.x).floor().multiplyScalar(this.tileSize.x)
           .addScalar(this.tileSize.x/2).setY(0);
    }

    VecToTilePos(pos: THREE.Vector3): THREE.Vector2 {
        let tmpPos = pos.clone();
        tmpPos
           .divideScalar(this.tileSize.x).round().multiplyScalar(this.tileSize.x);
        return new THREE.Vector2(tmpPos.x/this.tileSize.x, tmpPos.z/this.tileSize.y).addScalar(this.tileNum.x/2);
    }

    GetMapPos(tilePos: THREE.Vector2): THREE.Vector3 {
        let ret = new THREE.Vector3();
        ret.setX(this.tileSize.x * tilePos.x);
        ret.setZ(this.tileSize.y * tilePos.y);
        return ret
           .divideScalar(this.tileSize.x).floor().multiplyScalar(this.tileSize.x)
           .addScalar(this.tileSize.x/2);
    }

    GetTileNum(): THREE.Vector2 { return this.tileNum; }

    SetCursorPos(pos: THREE.Vector3): void {
        this.cursor.position.copy(pos)
        .divideScalar(this.tileSize.x).floor().multiplyScalar(this.tileSize.x)
        .addScalar(this.tileSize.x/2);
    }

    SetCursorVisible(flag: boolean): void {
        (this.cursor.material as THREE.Material).visible = flag;
    }

    Update(delta_s: number): void {

    }

    Render(): void {

    }

    // NOTE: Only for debug
    // TODO: Delete later
    GetGround(): THREE.Mesh { return this.ground; }
}
