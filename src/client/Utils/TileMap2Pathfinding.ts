import {Mesh, Vector3, Vector2,
    // debug
    Line, BufferGeometry, LineBasicMaterial, MeshBasicMaterial, SphereGeometry}
    from 'three'
import * as PF from 'pathfinding'
import TileMap2 from './TileMap2'

export default class TileMap2Pathfinding {
    private map: TileMap2
    private baseGrid: PF.Grid
    private grid: PF.Grid
    private finder: PF.AStarFinder

    public paths: Array<Vector2[]>
    public starts: Array<Vector2>
    public goals: Array<Vector2>


    // Debug
    public debugLines?: Line

    constructor(map: TileMap2) {
        this.map = map;

        this.starts = [];
        this.goals = [];
        this.paths = [];

        this.baseGrid = new PF.Grid(this.map.tileNum.x, this.map.tileNum.y);
        this.grid = this.baseGrid.clone();
        this.finder = new PF.AStarFinder();
    }

    setBlockGrids(blockGrids: Array<Vector2>){
        blockGrids.forEach(grid => this.grid.setWalkableAt(grid.x, grid.y, false));
    }

    updateSubMeshes(blockGrids: Array<Vector2>): boolean {
        const tmpGrid = this.grid.clone();
        const tmpPaths = [...this.paths];
        const tmpDebugPaths = this.debugLines?.clone();
        this.setBlockGrids(blockGrids);
        const ret = this.generatePaths();

        if (!ret) {
            this.grid = tmpGrid;
            this.paths = tmpPaths;
            this.debugLines = tmpDebugPaths;
        }
        return ret;
    }

    checkValidSubMeshes(blockGrids: Array<Vector2>): boolean {
        const tmpGrid = this.grid.clone();
        const tmpPaths = [...this.paths];
        const tmpDebugPaths = this.debugLines?.clone();
        this.setBlockGrids(blockGrids);
        const ret = this.generatePaths();
        
        this.grid = tmpGrid;
        this.paths = tmpPaths;
        this.debugLines = tmpDebugPaths;
        return ret;
    }

    generatePaths(): boolean {
        this.debugLines = undefined;
        for (const i of this.goals.keys()){
            const startGrid = i === 0? new Vector2(0, 0) : this.goals[i-1];
            const destGrid = this.goals[i];
            const grid = this.grid.clone();
            const paths = this.finder.findPath(
                startGrid.x, startGrid.y, destGrid.x, destGrid.y, grid);
            if (!paths) return false;
            delete this.paths[i];
            this.paths[i] = [];
            paths.forEach(path => this.paths[i].push(new Vector2(path[0], path[1])));
            if (!this.paths.length) return false;

            const points = [startGrid];
            this.paths[i].forEach((vertex) => points.push(vertex.clone()));
            const lineGeo = new BufferGeometry().setFromPoints(points);
            const lineMat = new LineBasicMaterial({color: 0xff0000, linewidth:2});
            const line = new Line(lineGeo, lineMat);

            if(!this.debugLines)
                this.debugLines = line
            else
                this.debugLines.add(line);

            const debugPaths = [startGrid].concat(this.paths[i]);
            debugPaths.forEach(vertex => {
                const geometry = new SphereGeometry(0.3);
                const mat = new MeshBasicMaterial({color: 0xff0000});
                const node = new Mesh(geometry, mat);
                node.position.copy(new Vector3(vertex.x, 0, vertex.y));
                this.debugLines?.add(node);
            });
            this.paths[i].forEach(path => path.setY(0));
        }
        console.log(this.debugLines);
        return true;
    }
}
