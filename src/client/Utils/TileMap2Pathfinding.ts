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

    constructor(map: TileMap2) {
        this.map = map;

        this.starts = [];
        this.goals = [];
        this.paths = [];

        this.baseGrid = new PF.Grid(this.map.tileNum.x, this.map.tileNum.y);
        this.grid = this.baseGrid.clone();
        this.finder = new PF.BiDijkstraFinder({
            diagonalMovement: PF.DiagonalMovement.OnlyWhenNoObstacles,
        });
    }

    setBlockGrids(blockGrids: Array<Vector2>){
        this.grid = this.baseGrid.clone();
        blockGrids.forEach(grid => this.grid.setWalkableAt(grid.x, grid.y, false));
    }

    updateBlockGrid(blockGrids: Array<Vector2>): boolean {
        const tmpGrid = this.grid.clone();
        const tmpPaths = [...this.paths];
        this.setBlockGrids(blockGrids);
        const ret = this.generatePaths();

        if (!ret) {
            this.grid = tmpGrid;
            this.paths = tmpPaths;
        }
        return ret;
    }

    checkValidGrid(blockGrids: Array<Vector2>): boolean {
        const tmpGrid = this.grid.clone();
        const tmpPaths = [...this.paths];
        this.setBlockGrids(blockGrids);
        const ret = this.generatePaths();
        
        this.grid = tmpGrid;
        this.paths = tmpPaths;
        return ret;
    }

    generatePaths(): boolean {
        for (const i of this.goals.keys()){
            const startGrid = i === 0? new Vector2(0, 0) : this.goals[i-1];
            const destGrid = this.goals[i];
            const grid = this.grid.clone();
            const paths = this.finder.findPath(
                startGrid.x, startGrid.y, destGrid.x, destGrid.y, grid);
            if (!paths.length) return false;
            this.paths[i] = [];
            paths.forEach(path => {
                const pos = this.map.getWorldPosFromTileIndex(path[0], path[1]);
                this.paths[i].push(new Vector2(pos.x, pos.z)); 
            });
            if (!this.paths.length) return false;

            this.paths[i].forEach(path => path.setY(0));
        }
        return true;
    }
}
