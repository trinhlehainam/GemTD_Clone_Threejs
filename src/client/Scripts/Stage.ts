import * as THREE from 'three'
import {CSG} from 'three-csg-ts'
import {Pathfinding} from 'three-pathfinding'

import TileMap2D from '../Utils/TileMap2D'

// TODO: Refactoring function name
// TODO: Refactoring convert player tile pos
// TODO: tilemap helper class
// TODO: tilemap pathfinding class
export default class Stage {
    private map: TileMap2D

    private scene: THREE.Scene
    private objects: Array<THREE.Mesh>

    // Path
    private navMesh: THREE.Mesh
    private goals: Array<THREE.Vector3>
    private pathfinding: any;
    private ZONE: string
    private groupIDs: number[]
    private paths: Array<THREE.Vector3[]>
    private pathLines?: THREE.Line

    // Debug
    /* private pointer: THREE.Vector2
    private raycaster: THREE.Raycaster */
    private cursor: THREE.Mesh
    private camera: THREE.Camera

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;

        this.map = new TileMap2D(new THREE.Vector2(38, 38), new THREE.Vector2(5, 5));

        const navGeo = new THREE.PlaneGeometry(
            this.map.tileNum.x * this.map.tileSize.x, this.map.tileNum.y * this.map.tileSize.y,
            this.map.tileNum.x, this.map.tileNum.y
        );
        const navMat = new THREE.MeshPhongMaterial({color: 0xaaaaaa, visible: false});
        this.navMesh = new THREE.Mesh(navGeo, navMat);
        this.navMesh.name = 'ground';
        this.navMesh.receiveShadow = true;
        // NOTE: rotate vertices of Object3D for pathfinding work correctly
        // TODO: fix nav mesh resolution
        this.navMesh.geometry.rotateX(-Math.PI/2);
        this.navMesh.quaternion.identity();
        //
        this.scene.add(this.navMesh);

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
        
        this.goals = new Array<THREE.Vector3>(6);
        this.goals[0] = (this.map.getWorldPosFromTilePos(new THREE.Vector2(4, 18)));
        this.goals[1] = (this.map.getWorldPosFromTilePos(new THREE.Vector2(32, 18)));
        this.goals[2] = (this.map.getWorldPosFromTilePos(new THREE.Vector2(32, 4)));
        this.goals[3] = (this.map.getWorldPosFromTilePos(new THREE.Vector2(18, 4)));
        this.goals[4] = (this.map.getWorldPosFromTilePos(new THREE.Vector2(18, 32)));
        this.goals[5] = (this.map.getWorldPosFromTilePos(new THREE.Vector2(32, 32)));

        this.goals.forEach(
            goal => {
                const debugSphere = new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshBasicMaterial({color: 0xff0000}));
                debugSphere.position.copy(this.map.getWorldPosFromVector3(goal));
                this.scene.add(debugSphere);
            }
        )

        this.objects = [];
        const box = new THREE.Mesh(new THREE.BoxGeometry(this.map.tileSize.x, this.map.tileSize.x * 2, this.map.tileSize.y), new THREE.MeshNormalMaterial());
        box.position.set(20, 0, 20);
        box.position.copy(this.map.getWorldPosFromVector3(box.position));
        this.objects.push(box.clone());
        box.scale.multiplyScalar(1.5);
        box.updateMatrix();
        const navMesh = CSG.subtract(this.navMesh, box);

        this.scene.remove(this.navMesh);
        this.navMesh = navMesh;
        this.scene.add(this.navMesh);
        this.navMesh.name = 'ground';
        
        // Ground basement
        const groundMat = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
        this.scene.add(new THREE.Mesh(navGeo, groundMat)); 
        this.scene.add(this.objects[0]);
        
        // Pathfinding set up
        this.groupIDs = new Array<number>(this.goals.length);
        this.pathfinding = new Pathfinding();
        this.ZONE = 'map';
        const zone = Pathfinding.createZone(this.navMesh.geometry, 0.02);
        console.log(zone);
        this.pathfinding.setZoneData(this.ZONE, zone);
        for (const [idx, val] of this.goals.entries())
            this.groupIDs[idx] = this.pathfinding.getGroup(this.ZONE, val) as number;
        console.log(this.groupIDs);

        this.paths = [];

        this.GeneratePaths();
    }

    private GeneratePaths(): void {
        if (this.pathLines) this.scene.remove(this.pathLines);
        for (const [i, val] of this.goals.entries()){
            const startPos = i === 0 ? this.map.getWorldPosFromTilePos(new THREE.Vector2(0, 0)) : this.goals[i-1];
            const targetPos = this.goals[i]; 
            const paths = this.pathfinding.findPath(
                startPos, targetPos, this.ZONE, this.groupIDs[i]) as Array<THREE.Vector3>;
            if (!paths) return;
            this.paths[i] = paths;
            if (!this.paths.length) return;
            //

            const points = [startPos];
            this.paths[i].forEach((vertex) => points.push(vertex.clone()));
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const lineMat = new THREE.LineBasicMaterial({color: 0xff0000, linewidth:2});
            const line = new THREE.Line(lineGeo, lineMat);
            if(!this.pathLines)
                this.pathLines = line
            else
                this.pathLines.add(line);

            const debugPaths = [startPos].concat(this.paths[i]);
            debugPaths.forEach(vertex => {
                const geometry = new THREE.SphereGeometry(0.3);
                const mat = new THREE.MeshBasicMaterial({color: 0xff0000});
                const node = new THREE.Mesh(geometry, mat);
                node.position.copy(vertex);
                this.pathLines?.add(node);
            });
            this.paths[i].forEach(path => path.setY(0));
        }

        if (this.pathLines)
            this.scene.add(this.pathLines);

        console.log(this.paths)
    }

    SetCursorPos(pos: THREE.Vector3): void {
        this.cursor.position.copy(pos)
        .divideScalar(this.map.tileSize.x).floor().multiplyScalar(this.map.tileSize.x)
        .addScalar(this.map.tileSize.x/2);
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
    GetGround(): THREE.Mesh { return this.navMesh; }
}
