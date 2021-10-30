import * as THREE from 'three'
import {CSG} from 'three-csg-ts'
import {Pathfinding} from 'three-pathfinding'

// TODO: Refactoring function name
// TODO: Refactoring convert player tile pos
// TODO: tilemap helper class
// TODO: tilemap pathfinding class
export default class Stage {
    private tileNum: THREE.Vector2
    private tileSize: THREE.Vector2

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

        this.tileNum = new THREE.Vector2(38, 38);
        this.tileSize = new THREE.Vector2(5, 5);

        const navGeo = new THREE.PlaneGeometry(
            this.tileNum.x * this.tileSize.x, this.tileNum.y * this.tileSize.y,
            this.tileNum.x, this.tileNum.y
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

        const axis = new THREE.AxesHelper(this.tileSize.x * 1.5);
        this.scene.add(axis);

        const grid = new THREE.GridHelper(this.tileNum.x * this.tileSize.x, this.tileNum.x);
        this.scene.add(grid);

        const cursorGeo = new THREE.BoxGeometry(this.tileSize.x, this.tileSize.x, this.tileSize.x);
        const cursorMat = new THREE.MeshBasicMaterial({color: 0x00ff00, opacity: 0.5, transparent: true, visible: false});
        this.cursor = new THREE.Mesh(cursorGeo, cursorMat);
        this.scene.add(this.cursor);
        
        this.goals = new Array<THREE.Vector3>(6);
        this.goals[0] = (this.TileToMapPos(new THREE.Vector2(4, 18)));
        this.goals[1] = (this.TileToMapPos(new THREE.Vector2(32, 18)));
        this.goals[2] = (this.TileToMapPos(new THREE.Vector2(32, 4)));
        this.goals[3] = (this.TileToMapPos(new THREE.Vector2(18, 4)));
        this.goals[4] = (this.TileToMapPos(new THREE.Vector2(18, 32)));
        this.goals[5] = (this.TileToMapPos(new THREE.Vector2(32, 32)));

        this.goals.forEach(
            goal => {
                const debugSphere = new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshBasicMaterial({color: 0xff0000}));
                debugSphere.position.copy(this.VecToMapPos(goal));
                this.scene.add(debugSphere);
            }
        )

        this.objects = [];
        const box = new THREE.Mesh(new THREE.BoxGeometry(this.tileSize.x, this.tileSize.x * 2, this.tileSize.y), new THREE.MeshNormalMaterial());
        box.position.set(20, 0, 20);
        box.position.copy(this.VecToMapPos(box.position));
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
            const startPos = i === 0 ? this.TileToMapPos(new THREE.Vector2(0, 0)) : this.goals[i-1];
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
    GetGround(): THREE.Mesh { return this.navMesh; }
}
