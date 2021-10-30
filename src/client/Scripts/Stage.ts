import * as THREE from 'three'
import {CSG} from 'three-csg-ts'
import {Pathfinding} from 'three-pathfinding'

import TileMap2 from '../Utils/TileMap2'
import TileMap2Pathfinding from '../Utils/TileMap2Pathfinding'

// TODO: Refactoring function name
// TODO: Refactoring convert player tile pos
// TODO: tilemap helper class
// TODO: tilemap pathfinding class
export default class Stage {
    private map: TileMap2

    private scene: THREE.Scene
    private objects: Array<THREE.Mesh>

    private pathfinder: TileMap2Pathfinding 

    // Debug
    /* private pointer: THREE.Vector2
    private raycaster: THREE.Raycaster */
    private cursor: THREE.Mesh
    private camera: THREE.Camera
    private pathLines?: THREE.Line

    constructor(scene: THREE.Scene, camera: THREE.Camera) {
        this.scene = scene;
        this.camera = camera;

        this.map = new TileMap2(new THREE.Vector2(38, 38), new THREE.Vector2(5, 5));

        const groundGeo = new THREE.PlaneGeometry(
            this.map.tileNum.x * this.map.tileSize.x, this.map.tileNum.y * this.map.tileSize.y,
            this.map.tileNum.x, this.map.tileNum.y
        );
        const groundMat = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.name = 'ground';
        ground.receiveShadow = true;
        // NOTE: rotate vertices of Object3D for pathfinding work correctly
        // TODO: fix nav mesh resolution
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

        this.pathfinder = new TileMap2Pathfinding();
        
        const goals = new Array<THREE.Vector3>(6);
        goals[0] = (this.map.getWorldPosFromTilePos(4, 18));
        goals[1] = (this.map.getWorldPosFromTilePos(32, 18));
        goals[2] = (this.map.getWorldPosFromTilePos(32, 4));
        goals[3] = (this.map.getWorldPosFromTilePos(18, 4));
        goals[4] = (this.map.getWorldPosFromTilePos(18, 32));
        goals[5] = (this.map.getWorldPosFromTilePos(32, 32));

        goals.forEach(
            goal => {
                const debugSphere = new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshBasicMaterial({color: 0xff0000}));
                debugSphere.position.copy(this.map.getWorldPosFromVector3(goal));
                this.scene.add(debugSphere);
            }
        )

        this.pathfinder.goals = [...goals];

        this.objects = [];
        const box = new THREE.Mesh(new THREE.BoxGeometry(this.map.tileSize.x, this.map.tileSize.x * 2, this.map.tileSize.y), new THREE.MeshNormalMaterial());
        box.position.set(20, 0, 20);
        box.position.copy(this.map.getWorldPosFromVector3(box.position));
        this.objects.push(box.clone());
        box.scale.multiplyScalar(1.5);
        box.updateMatrix();
        const subMesh = CSG.subtract(ground, box);
        
        const navMat = new THREE.MeshPhongMaterial({color: 0xaaaaaa, visible: false});
        const navMesh = new THREE.Mesh(subMesh.geometry, navMat);
        this.scene.add(navMesh);
        navMesh.name = 'NavMesh';

        this.pathfinder.init(navMesh, 'map');
        
        // Ground basement
        this.scene.add(this.objects[0]);
        
        // Pathfinding set up

        this.GeneratePaths();
        console.log(this.pathfinder);
    }

    private GeneratePaths(): void {
        if (this.pathLines) this.scene.remove(this.pathLines);
        this.pathfinder.generatePaths(this.map);
        for (const paths of this.pathfinder.paths){
            //
            const points: THREE.Vector3[] = [];
            paths.forEach((vertex) => points.push(vertex.clone()));
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const lineMat = new THREE.LineBasicMaterial({color: 0xff0000, linewidth:2});
            const line = new THREE.Line(lineGeo, lineMat);
            if(!this.pathLines)
                this.pathLines = line
            else
                this.pathLines.add(line);

            const debugPaths = [...paths];
            debugPaths.forEach(vertex => {
                const geometry = new THREE.SphereGeometry(0.3);
                const mat = new THREE.MeshBasicMaterial({color: 0xff0000});
                const node = new THREE.Mesh(geometry, mat);
                node.position.copy(vertex);
                this.pathLines?.add(node);
            });
        }

        if (this.pathLines)
            this.scene.add(this.pathLines);
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
}
