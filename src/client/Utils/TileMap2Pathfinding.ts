import {Mesh, Vector3,
    // debug
    Line, BufferGeometry, LineBasicMaterial, MeshBasicMaterial, SphereGeometry}
    from 'three'
import {CSG} from 'three-csg-ts'
import {Pathfinding} from 'three-pathfinding'
import TileMap2 from './TileMap2'

export default class TileMap2Pathfinding {
    public pathfinding: any
    public ZONE?: string
    public paths: Array<Vector3[]>
    public goals: Array<Vector3>
    public groupIDs: Array<number>

    private baseMesh: BufferGeometry
    private navMesh: BufferGeometry
    private map: TileMap2

    // Debug
    public debugLines?: Line

    constructor(baseNavMesh: Mesh, map: TileMap2) {
        this.baseMesh = baseNavMesh.geometry.clone();
        this.map = map;
        this.navMesh = this.baseMesh;

        this.goals = [];
        this.paths = [];
        this.groupIDs = [];

        this.pathfinding = new Pathfinding();
    }

    init(zoneName: string, subObjects: Array<Mesh> = []){
        this.ZONE = zoneName;
        let subMesh = new Mesh(this.baseMesh);
        subObjects.forEach(box => {
            const clone = box.clone();
            // clone.scale.multiplyScalar(1.0);
            clone.updateMatrix();
            subMesh = CSG.subtract(subMesh, clone);
        });
        this.navMesh = subMesh.geometry;

        this.groupIDs = new Array<number>(this.goals.length);
        const zone = Pathfinding.createZone(this.navMesh);
        console.log(zone);
        this.pathfinding.setZoneData(this.ZONE, zone);
        for (const [idx, val] of this.goals.entries())
            this.groupIDs[idx] = this.pathfinding.getGroup(this.ZONE, val) as number;
        console.log(this.groupIDs);
    }

    updateSubMeshes(zoneName: string, subObjects: Array<Mesh>): boolean {
        const tmpNavMesh = this.navMesh.clone();  
        const tmpPaths = [...this.paths];
        const tmpDebugPaths = this.debugLines?.clone();
        this.init(zoneName, subObjects);
        const ret = this.generatePaths();
        if (!ret) {
            this.navMesh = tmpNavMesh;
            this.paths = tmpPaths;
            this.debugLines = tmpDebugPaths;
            const zone = Pathfinding.createZone(this.navMesh);
            console.log(zone);
            this.pathfinding.setZoneData(this.ZONE, zone);
            for (const [idx, val] of this.goals.entries())
                this.groupIDs[idx] = this.pathfinding.getGroup(this.ZONE, val) as number;
        }
        return ret;
    }

    checkValidSubMeshes(zoneName: string, subObjects: Array<Mesh>): boolean {
        const tmpNavMesh = this.navMesh.clone();  
        const tmpPaths = [...this.paths];
        const tmpDebugPaths = this.debugLines?.clone();
        this.init(zoneName, subObjects);
        const ret = this.generatePaths();

        //
        this.navMesh = tmpNavMesh;
        this.paths = tmpPaths;
        this.debugLines = tmpDebugPaths;
        const zone = Pathfinding.createZone(this.navMesh);
        console.log(zone);
        this.pathfinding.setZoneData(this.ZONE, zone);
        for (const [idx, val] of this.goals.entries())
            this.groupIDs[idx] = this.pathfinding.getGroup(this.ZONE, val) as number;
        return ret;
    }

    generatePaths(): boolean {
        this.debugLines = undefined;
        for (const [i, val] of this.goals.entries()){
            const startPos = i === 0 ? this.map.getWorldPosFromTilePos(0, 0) : this.goals[i-1];
            const targetPos = this.goals[i]; 
            const paths = this.pathfinding.findPath(
                startPos, targetPos, this.ZONE, this.groupIDs[i]) as Array<Vector3>;
            if (!paths) return false;
            this.paths[i] = paths;
            if (!this.paths.length) return false;
            //

            const points = [startPos];
            this.paths[i].forEach((vertex) => points.push(vertex.clone()));
            const lineGeo = new BufferGeometry().setFromPoints(points);
            const lineMat = new LineBasicMaterial({color: 0xff0000, linewidth:2});
            const line = new Line(lineGeo, lineMat);

            if(!this.debugLines)
                this.debugLines = line
            else
                this.debugLines.add(line);

            const debugPaths = [startPos].concat(this.paths[i]);
            debugPaths.forEach(vertex => {
                const geometry = new SphereGeometry(0.3);
                const mat = new MeshBasicMaterial({color: 0xff0000});
                const node = new Mesh(geometry, mat);
                node.position.copy(vertex);
                this.debugLines?.add(node);
            });
            this.paths[i].forEach(path => path.setY(0));
        }
        console.log(this.debugLines);
        return true;
    }
}
