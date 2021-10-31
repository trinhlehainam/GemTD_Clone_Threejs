import * as THREE from 'three'
import {CSG} from 'three-csg-ts'

import TileMap2 from '../Utils/TileMap2'
import TileMap2Pathfinding from '../Utils/TileMap2Pathfinding'

// TODO: Refactoring function name
// TODO: Refactoring convert player tile pos
// TODO: Create object base class (BLOCK, TOWER)
export default class Stage {
    // map
    private map: TileMap2
    private tiles: Array<boolean>
    private objects: Array<THREE.Mesh>
    private pathfinder: TileMap2Pathfinding 
    private goals: Array<THREE.Vector3>

    private scene: THREE.Scene
    private cursor: THREE.Mesh
    private camera: THREE.Camera

    private box: THREE.Mesh

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;

        this.map = new TileMap2(new THREE.Vector2(38, 38), new THREE.Vector2(5, 5));
        this.tiles = Array<boolean>(this.map.tileSize.x * this.map.tileSize.y).fill(false);
        this.objects = new Array(this.tiles.length);

        const groundGeo = new THREE.PlaneGeometry(
            this.map.tileNum.x * this.map.tileSize.x, this.map.tileNum.y * this.map.tileSize.y,
            this.map.tileNum.x, this.map.tileNum.y
        );
        const groundMat = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.name = 'ground';
        ground.receiveShadow = true;
        // NOTE: rotate vertices of Object3D for pathfinding work correctly
        ground.geometry.rotateX(-Math.PI/2);
        ground.quaternion.identity();
        //
        this.scene.add(ground);

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

        const axis = new THREE.AxesHelper(this.map.tileSize.x * 1.5);
        this.scene.add(axis);

        const grid = new THREE.GridHelper(this.map.tileNum.x * this.map.tileSize.x, this.map.tileNum.x);
        this.scene.add(grid);

        const cursorGeo = new THREE.BoxGeometry(this.map.tileSize.x, this.map.tileSize.x, this.map.tileSize.x);
        const cursorMat = new THREE.MeshBasicMaterial({color: 0x00ff00, opacity: 0.5, transparent: true, visible: false});
        this.cursor = new THREE.Mesh(cursorGeo, cursorMat);
        this.scene.add(this.cursor);

        this.pathfinder = new TileMap2Pathfinding(ground, this.map);
        
        this.goals = new Array<THREE.Vector3>(6);
        this.goals[0] = (this.map.getWorldPosFromTilePos(4, 18));
        this.goals[1] = (this.map.getWorldPosFromTilePos(32, 18));
        this.goals[2] = (this.map.getWorldPosFromTilePos(32, 4));
        this.goals[3] = (this.map.getWorldPosFromTilePos(18, 4));
        this.goals[4] = (this.map.getWorldPosFromTilePos(18, 32));
        this.goals[5] = (this.map.getWorldPosFromTilePos(32, 32));

        this.goals.forEach(
            goal => {
                const debugSphere = new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshBasicMaterial({color: 0xff0000}));
                debugSphere.position.copy(this.map.getWorldPosFromVector3(goal));
                this.scene.add(debugSphere);
            }
        )

        const goalTilePos = this.goals.map(goal => this.map.getTilePosFromVector3(goal));
        goalTilePos.forEach(pos => this.tiles[pos.y * this.map.tileNum.x + pos.x] = true); 

        this.pathfinder.goals = [...this.goals];

        const box = new THREE.Mesh(new THREE.BoxGeometry(this.map.tileSize.x, this.map.tileSize.x * 2, this.map.tileSize.y), new THREE.MeshNormalMaterial());
        this.box = box.clone();

        this.pathfinder.init('map');
        this.GeneratePaths();
    }

    AddObject(): void {
        if (!this.IsTileEmpty()) return;
        const clone = this.box.clone();
        clone.position.copy(this.cursor.position).setY(0);
        clone.scale.multiplyScalar(0.75);
        clone.updateMatrix();
        this.objects.push(clone);
        const cursorTilePos = this.GetCursorTilePos();
        if (this.pathfinder.debugLines) this.scene.remove(this.pathfinder.debugLines);
        this.objects.forEach(box => {
            box.scale.divideScalar(0.75);
        })
        const flag = this.pathfinder.updateSubMesh('map', this.objects.filter(obj => obj !== undefined));
        this.objects.forEach(box => {
            box.scale.multiplyScalar(0.75);
        })
        if (this.pathfinder.debugLines)
            this.scene.add(this.pathfinder.debugLines);
        this.SetTile(cursorTilePos, flag);
        console.log(flag);
        if (!flag){
            this.objects.pop();
            return;
        }
        this.scene.add(clone);
    }

    RemoveObject(): void {
        if (this.IsTileEmpty()) return;
    }

    GetTile(tilePos: THREE.Vector2): boolean {
        return this.tiles[tilePos.y * this.map.tileNum.x + tilePos.x];
    }

    IsTileEmpty(): boolean {
        const cursorTilePos = this.GetCursorTilePos();
        return !this.tiles[(cursorTilePos.y * this.map.tileNum.x) + cursorTilePos.x];
    }

    private SetTile(tilePos: THREE.Vector2, flag: boolean): void {
        this.tiles[(tilePos.y * this.map.tileNum.x) + tilePos.x] = flag;
    }

    private GetCursorTilePos(): THREE.Vector2 {
        const pos = this.cursor.position.clone().setY(0);
        const tilePos = this.map.getTilePosFromVector3(pos);
        return tilePos;
    }

    UpdatePath(): void {
        this.objects.forEach(box => {
            box.scale.divideScalar(0.75);
        })
        this.pathfinder.init('map', this.objects.filter(obj => obj !== undefined));
        this.objects.forEach(box => {
            box.scale.multiplyScalar(0.75);
        })
        this.GeneratePaths();
    }

    private GeneratePaths(): void {
        if (this.pathfinder.debugLines) this.scene.remove(this.pathfinder.debugLines);
        this.pathfinder.generatePaths();
        if (this.pathfinder.debugLines)
            this.scene.add(this.pathfinder.debugLines);
    }

    SetCursorPos(pos: THREE.Vector3): void {
        this.cursor.position.copy(pos)
        .divideScalar(this.map.tileSize.x).floor().multiplyScalar(this.map.tileSize.x)
        .addScalar(this.map.tileSize.x/2);
        const isEmpty = this.IsTileEmpty();
        const color: number = isEmpty ? 0x00ff00 : 0xff0000;
        (this.cursor.material as THREE.MeshBasicMaterial).color = new THREE.Color(color);
    }

    SetCursorVisible(flag: boolean): void {
        (this.cursor.material as THREE.Material).visible = flag;
    }

    Update(delta_s: number): void {

    }

    Render(): void {

    }
}
