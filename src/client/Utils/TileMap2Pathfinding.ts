import {Vector2} from 'three'
import * as PF from 'pathfinding'
import TileMap2 from './TileMap2'

export default class TileMap2Pathfinding {
    private map: TileMap2
    private baseGrid: PF.Grid
    private grid: PF.Grid
    private finder: PF.AStarFinder
    private arrayPaths: Array<Vector2[]>
    private blocks: Array<boolean>

    public starts: Array<Vector2>
    public goals: Array<Vector2>

    constructor(map: TileMap2) {
        this.map = map;
        this.blocks = Array<boolean>(this.map.tileNum.x * this.map.tileNum.y).fill(false);

        this.starts = [];
        this.goals = [];
        this.arrayPaths = [];

        this.baseGrid = new PF.Grid(this.map.tileNum.x, this.map.tileNum.y);
        this.grid = this.baseGrid.clone();
        this.finder = new PF.BiDijkstraFinder({
            diagonalMovement: PF.DiagonalMovement.OnlyWhenNoObstacles,
        });
    }

    getArrayPaths(): Array<Vector2[]> { return this.arrayPaths; }

    setBlockTile(tileIdx: Vector2, flag: boolean): void{
        flag? this.addBlockTile(tileIdx): this.removeBlockTile(tileIdx);
    }

    updateBlockTile(): void {
        this.grid = this.baseGrid.clone();
        let numIndices: Array<number> = [];
        for (const [idx, val] of this.blocks.entries())
            if (val === true)
                numIndices.push(idx);
        let tileIndices = numIndices.map(idx => this.map.getTileIndexFromNumIndex(idx));
        tileIndices.forEach(idx => this.grid.setWalkableAt(idx.x, idx.y, false));
    }

    addTileAndUpdatePaths(tileIdx: Vector2): boolean {
        if (!this.isInsideMap(tileIdx)) return false;
        if (!this.isChangeableTile(tileIdx)) return false;
        const tmpGrid = this.grid.clone();
        const tmpPaths = [...this.arrayPaths];
        const tmpBlocks = [...this.blocks];

        this.addBlockTile(tileIdx);
        this.updateBlockTile();
        const ret = this.generatePaths();
        
        if (!ret){
            this.grid = tmpGrid;
            this.arrayPaths = tmpPaths;
            this.blocks = tmpBlocks;
        }

        return ret;
    }

    removeTileAndUpdatePaths(tileIdx: Vector2): boolean {
        if (!this.isInsideMap(tileIdx)) return false;
        if (!this.isChangeableTile(tileIdx)) return false;

        this.removeBlockTile(tileIdx);
        this.updateBlockTile();
        this.generatePaths();

        return true;
    }

    precheckTile(tileIdx: Vector2): boolean {
        if (!this.isInsideMap(tileIdx)) return false;
        if (!this.isChangeableTile(tileIdx)) return false;
        const tmpGrid = this.grid.clone();
        const tmpPaths = [...this.arrayPaths];
        const tmpBlocks = [...this.blocks];

        this.addBlockTile(tileIdx);
        this.updateBlockTile();
        const ret = this.generatePaths();

        this.grid = tmpGrid;
        this.arrayPaths = tmpPaths;
        this.blocks = tmpBlocks;

        return ret;
    }

    private addBlockTile(tileIdx: Vector2): void {
        this.blocks[this.map.getNumIndexFromTileIndex(tileIdx)] = true;
    }

    private removeBlockTile(tileIdx: Vector2): void {
        this.blocks[this.map.getNumIndexFromTileIndex(tileIdx)] = false;
    }

    private isChangeableTile(tileIdx: Vector2): boolean {
        if (tileIdx.equals(this.starts[0]))
            return false;
        if (this.goals.map(idx => idx.equals(tileIdx)).includes(true))
            return false;
        return true;
    }
    
    private isInsideMap(tileIdx: Vector2): boolean {
        if (tileIdx.x < 0 || tileIdx.y < 0) return false;
        if (tileIdx.x > this.map.tileNum.x - 1 ||
           tileIdx.y > this.map.tileNum.y - 1)
            return false;
        return true;
    }

    generatePaths(): boolean {
        for (const i of this.goals.keys()){
            const startGrid = this.starts[i];
            const destGrid = this.goals[i];
            const grid = this.grid.clone();
            const paths = this.finder.findPath(
                startGrid.x, startGrid.y, destGrid.x, destGrid.y, grid);
            if (!paths.length) return false;
            this.arrayPaths[i] = [];
            paths.forEach(path => {
                const pos = this.map.getWorldPosFromTileIndex(path[0], path[1]);
                this.arrayPaths[i].push(new Vector2(pos.x, pos.z)); 
            });
            if (!this.arrayPaths.length) return false;
        }
        return true;
    }
}
