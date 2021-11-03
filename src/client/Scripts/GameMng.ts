import * as THREE from 'three'

import TileMap2 from '../Utils/TileMap2'
import TileMap2Pathfinding from '../Utils/TileMap2Pathfinding'
import Enemy from './Enemy'

// TODO: Refactoring function name
// TODO: Refactoring convert player tile pos
// TODO: Create object base class (BLOCK, TOWER)
export default class GameMng {
    // map
    private map: TileMap2
    private objects: Array<THREE.Mesh>
    private pathfinder: TileMap2Pathfinding 

    private scene: THREE.Scene
    private cursor: THREE.Mesh
    private camera: THREE.Camera

    private box: THREE.Mesh

    //
    private enemies: Array<Enemy>
    private isStart: boolean

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;

        this.map = new TileMap2(new THREE.Vector2(38, 38), new THREE.Vector2(5, 5));
        this.objects = new Array(this.map.tileNum.x * this.map.tileNum.y);

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
        this.pathfinder.starts = new Array<THREE.Vector2>(6);
        this.pathfinder.goals[0] = new THREE.Vector2(4, 18);
        this.pathfinder.goals[1] = new THREE.Vector2(32, 18);
        this.pathfinder.goals[2] = new THREE.Vector2(32, 4);
        this.pathfinder.goals[3] = new THREE.Vector2(18, 4);
        this.pathfinder.goals[4] = new THREE.Vector2(18, 32);
        this.pathfinder.goals[5] = new THREE.Vector2(32, 32);

        this.pathfinder.starts[0] = new THREE.Vector2(0, 0);
        for (const i of this.pathfinder.goals.keys()){
            if (i === 0){
                this.pathfinder.starts[i] = new THREE.Vector2(0, 0);
                continue;
            }
            this.pathfinder.starts[i] = this.pathfinder.goals[i-1]
        }

        this.pathfinder.goals.forEach(
            goal => {
                const debugSphere = new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshBasicMaterial({color: 0xff0000}));
                debugSphere.position.copy(this.map.getWorldPosFromTileIndex(goal));
                this.scene.add(debugSphere);
            }
        )

        const box = new THREE.Mesh(new THREE.BoxGeometry(this.map.tileSize.x, this.map.tileSize.x * 2, this.map.tileSize.y), new THREE.MeshNormalMaterial());
        this.box = box.clone();
        
        this.enemies = [];
        this.isStart = false;

        this.pathfinder.generatePaths();
    }

    GetMap(): TileMap2 { return this.map; }

    Start(): void {
        if (this.isStart) return;
        const enemy = new Enemy(this.scene, this);
        enemy.setPos(this.map.getWorldPosFromTileIndex(this.pathfinder.starts[0]));
        const arrayPaths = this.pathfinder.getArrayPaths();
        console.log(arrayPaths);
        const enemyPaths = arrayPaths.map(
            paths => paths.map(
                path => new THREE.Vector3(path.x, 0, path.y)));
        console.log(enemyPaths);
        enemy.setPaths(enemyPaths);
        
        this.enemies.push(enemy);
        this.isStart = true;
    }

    AddObject(): void {
        if (this.isStart) return;
        if (!this.IsTileEmpty()) return;
        const clone = this.box.clone();
        clone.position.copy(this.cursor.position).setY(0);
        clone.scale.multiplyScalar(0.75);
        clone.updateMatrix();
        const cursorTilePos = this.GetCursorMapPos();
        const isValid = this.pathfinder.checkTileAndUpdatePaths(cursorTilePos);
        if (!isValid) return;
        this.objects[this.GetTileIndex(cursorTilePos)] = clone;
        this.scene.add(clone);
    }

    CheckValidTile(): boolean {
        const isValid = this.pathfinder.precheckTile(this.GetCursorMapPos());
        return isValid;
    }

    RemoveObject(): void {
        if (this.isStart) return;
        if (this.IsTileEmpty()) return;
    }

    GetTileIndex(tilePos: THREE.Vector2): number {
        return tilePos.y * this.map.tileNum.x + tilePos.x;
    }

    IsTileEmpty(): boolean {
        const cursorTilePos = this.GetCursorMapPos();
        return !this.objects[this.GetTileIndex(cursorTilePos)];
    }

    private GetCursorMapPos(): THREE.Vector2 {
        const pos = this.cursor.position.clone().setY(0);
        const tilePos = this.map.getTileIndexFromVec3(pos);
        return tilePos;
    }
    
    SetCursorPos(pos: THREE.Vector3): void {
        this.cursor.position.copy(pos)
        .divideScalar(this.map.tileSize.x).floor().multiplyScalar(this.map.tileSize.x)
        .addScalar(this.map.tileSize.x/2);
    }

    CheckTile(): void {
        (this.cursor.material as THREE.MeshBasicMaterial).color = new THREE.Color(0x00ff00);
        let isEmpty = this.IsTileEmpty();
        const clone = this.box.clone();
        clone.position.copy(this.cursor.position).setY(0);
        clone.scale.multiplyScalar(0.75);
        clone.updateMatrix();
        if (!isEmpty){
            this.SetCursorColor();
            return;
        }
        const isValid = this.CheckValidTile();
        if (!isValid)
            this.SetCursorColor();
    }

    SetCursorColor(): void{
        (this.cursor.material as THREE.MeshBasicMaterial).color = new THREE.Color(0xff0000);
    }

    SetCursorVisible(flag: boolean): void {
        (this.cursor.material as THREE.Material).visible = flag;
    }

    Update(delta_s: number): void {
        if (!this.isStart) return;
        for (const enemy of this.enemies)
            enemy.update(delta_s);
        
        const remove: Array<number> = [];
        for (const [idx, enemy] of this.enemies.entries())
            if (enemy.isReachGoal())
                remove.push(idx);
        
        remove.forEach(idx => {
            this.enemies[idx].destroy();
            this.enemies.splice(idx, 1)
        })
        if (!this.enemies.length)
            this.isStart = false;
    }

    Render(): void {

    }
}
