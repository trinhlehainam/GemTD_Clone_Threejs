import * as THREE from 'three'

import TileMap2 from '../Utils/TileMap2'
import TileMap2Pathfinding from '../Utils/TileMap2Pathfinding'

// TODO: Refactoring function name
// TODO: Refactoring convert player tile pos
// TODO: Create object base class (BLOCK, TOWER)
export default class Stage {
    // map
    private map: TileMap2
    private objects: Array<THREE.Mesh>
    private blockGrids: Array<boolean>
    private pathfinder: TileMap2Pathfinding 

    private scene: THREE.Scene
    private cursor: THREE.Mesh
    private camera: THREE.Camera

    private box: THREE.Mesh

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;

        this.map = new TileMap2(new THREE.Vector2(38, 38), new THREE.Vector2(5, 5));
        this.objects = new Array(this.map.tileNum.x * this.map.tileNum.y);
        this.blockGrids = Array<boolean>(this.map.tileNum.x * this.map.tileNum.y).fill(false);

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

        this.pathfinder = new TileMap2Pathfinding(this.map);
        
        this.pathfinder.goals = new Array<THREE.Vector2>(6);
        this.pathfinder.goals[0] = new THREE.Vector2(4, 18);
        this.pathfinder.goals[1] = new THREE.Vector2(32, 18);
        this.pathfinder.goals[2] = new THREE.Vector2(32, 4);
        this.pathfinder.goals[3] = new THREE.Vector2(18, 4);
        this.pathfinder.goals[4] = new THREE.Vector2(18, 32);
        this.pathfinder.goals[5] = new THREE.Vector2(32, 32);

        this.pathfinder.goals.forEach(
            goal => {
                const debugSphere = new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshBasicMaterial({color: 0xff0000}));
                debugSphere.position.copy(this.map.getWorldPosFromTilePos(goal));
                this.scene.add(debugSphere);
            }
        )

        const box = new THREE.Mesh(new THREE.BoxGeometry(this.map.tileSize.x, this.map.tileSize.x * 2, this.map.tileSize.y), new THREE.MeshNormalMaterial());
        this.box = box.clone();

        this.GeneratePaths();
    }

    AddObject(): void {
        if (!this.IsTileEmpty()) return;
        const clone = this.box.clone();
        clone.position.copy(this.cursor.position).setY(0);
        clone.scale.multiplyScalar(0.75);
        clone.updateMatrix();
        const isValid = this.AddBlockGrid();
        if (!isValid) return;
        const cursorTilePos = this.GetCursorMapPos();
        this.objects[this.GetTileIndex(cursorTilePos)] = clone;
        this.scene.add(clone);
    }

    AddBlockGrid(): boolean {
        console.log(this.GetCursorMapPos());
        const cursorTileIndex = this.GetTileIndex(this.GetCursorMapPos());
        this.blockGrids[cursorTileIndex] = true;
        if (this.pathfinder.debugLines) this.scene.remove(this.pathfinder.debugLines);
        const gridIndices: Array<number> = [];
        for (const [idx, val] of this.blockGrids.entries())
            if (val === true)
                gridIndices.push(idx);
        console.log(gridIndices);
        console.log(this.blockGrids.filter(grid => grid === true));
        const flag = this.pathfinder.updateBlockGrid(
            gridIndices.map(idx => this.GetVecFromTileIndex(idx)));
        if (this.pathfinder.debugLines)
            this.scene.add(this.pathfinder.debugLines);
        if (!flag){
            this.blockGrids[cursorTileIndex] = false;
        }
        console.log('Add flag :' + flag);
        return flag;
    }

    CheckValidTile(): boolean {
        const cursorTileIndex = this.GetTileIndex(this.GetCursorMapPos());
        this.blockGrids[cursorTileIndex] = true;
        if (this.pathfinder.debugLines) this.scene.remove(this.pathfinder.debugLines);
        const gridIndices: Array<number> = [];
        for (const [idx, val] of this.blockGrids.entries())
            if (val === true)
                gridIndices.push(idx);
        const flag = this.pathfinder.checkValidGrid(
            gridIndices.map(idx => this.GetVecFromTileIndex(idx)));
        if (this.pathfinder.debugLines)
            this.scene.add(this.pathfinder.debugLines);
        this.blockGrids[cursorTileIndex] = false;
        return flag;
    }

    UpdatePaths(): void {
        this.GeneratePaths(); 
    }

    RemoveObject(): void {
        if (this.IsTileEmpty()) return;
    }

    GetTileIndex(tilePos: THREE.Vector2): number {
        return tilePos.y * this.map.tileNum.x + tilePos.x;
    }

    GetVecFromTileIndex(idx: number): THREE.Vector2 {
        return new THREE.Vector2(idx % this.map.tileNum.x, Math.floor(idx / this.map.tileNum.x));
    }

    IsTileEmpty(): boolean {
        const cursorTilePos = this.GetCursorMapPos();
        return !this.objects[this.GetTileIndex(cursorTilePos)];
    }

    private GetCursorMapPos(): THREE.Vector2 {
        const pos = this.cursor.position.clone().setY(0);
        const tilePos = this.map.getTilePosFromVector3(pos);
        return tilePos;
    }
    
    private GeneratePaths(): void {
        if (this.pathfinder.debugLines) this.scene.remove(this.pathfinder.debugLines);
        const gridIndices: Array<number> = [];
        for (const [idx, val] of this.blockGrids.entries())
            if (val === true)
                gridIndices.push(idx);
        console.log(gridIndices); 
        this.pathfinder.updateBlockGrid(
            gridIndices.map(idx => this.GetVecFromTileIndex(idx)));
        if (this.pathfinder.debugLines)
            this.scene.add(this.pathfinder.debugLines);
    }

    SetCursorPos(pos: THREE.Vector3): void {
        this.cursor.position.copy(pos)
        .divideScalar(this.map.tileSize.x).floor().multiplyScalar(this.map.tileSize.x)
        .addScalar(this.map.tileSize.x/2);
        let isEmpty = this.IsTileEmpty();
        const clone = this.box.clone();
        clone.position.copy(this.cursor.position).setY(0);
        clone.scale.multiplyScalar(0.75);
        clone.updateMatrix();
        const isValid = this.AddBlockGrid();
        const color: number = isEmpty && isValid ? 0x00ff00 : 0xff0000;
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
