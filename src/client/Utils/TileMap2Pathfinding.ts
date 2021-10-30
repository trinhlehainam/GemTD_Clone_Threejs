import {Mesh, Vector3,
    // debug
    Line, BufferGeometry, LineBasicMaterial, MeshBasicMaterial, SphereGeometry}
    from 'three'
import {Pathfinding} from 'three-pathfinding'
import TileMap2 from './TileMap2'

export default class TileMap2Pathfinding {
    public pathfinding: any;
    public navMesh?: Mesh
    public ZONE?: string
    public paths: Array<Vector3[]>
    public goals: Array<Vector3>
    public groupIDs: Array<number>

    // Debug
    public debugLines?: Line

    constructor() {
        this.goals = [];
        this.paths = [];
        this.groupIDs = [];

        this.pathfinding = new Pathfinding();
    }

    init(navMesh: Mesh, zoneName: string){
        this.ZONE = zoneName;
        this.navMesh = navMesh;

        this.groupIDs = new Array<number>(this.goals.length);
        this.pathfinding = new Pathfinding();
        this.ZONE = 'map';
        const zone = Pathfinding.createZone(this.navMesh.geometry, 0.02);
        console.log(zone);
        this.pathfinding.setZoneData(this.ZONE, zone);
        for (const [idx, val] of this.goals.entries())
            this.groupIDs[idx] = this.pathfinding.getGroup(this.ZONE, val) as number;
        console.log(this.groupIDs);
    }

    generatePaths(map: TileMap2): void {
        for (const [i, val] of this.goals.entries()){
            const startPos = i === 0 ? map.getWorldPosFromTilePos(0, 0) : this.goals[i-1];
            const targetPos = this.goals[i]; 
            const paths = this.pathfinding.findPath(
                startPos, targetPos, this.ZONE, this.groupIDs[i]) as Array<Vector3>;
            if (!paths) return;
            this.paths[i] = paths;
            if (!this.paths.length) return;
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
    }
}
