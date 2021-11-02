import {Vector2, Vector3} from 'three'

export default class TileMap2 {
    tileNum: Vector2
    tileSize: Vector2
    mapPos: Vector2

    constructor(tileNum: Vector2, tileSize: Vector2) {
        this.tileNum = tileNum;
        this.tileSize = tileSize;
        this.mapPos = new Vector2();
    }
    
    getWorldPosFromVec3(pos: Vector3, tilePortion: number = 0.5): Vector3 {
        let ret = pos.clone();
        const tmpY = ret.y;
        return ret
           .divideScalar(this.tileSize.x).floor().multiplyScalar(this.tileSize.x)
           .addScalar(this.tileSize.x * tilePortion).setY(tmpY);
    }

    getWorldPosFromTileIndex(tilePos: Vector2): Vector3;
    getWorldPosFromTileIndex(x: number, y: number): Vector3;

    getWorldPosFromTileIndex(a: Vector2 | number, b?: number): Vector3{
        let tmpTilePos = a instanceof Vector2 ? a.clone() : new Vector2(a, b);
        tmpTilePos.sub(this.tileNum.clone().divideScalar(2)).add(this.mapPos);
        let ret = new Vector3(tmpTilePos.x*this.tileSize.x, 0, tmpTilePos.y*this.tileSize.y);
        return ret
           .divideScalar(this.tileSize.x).floor().multiplyScalar(this.tileSize.x)
           .addScalar(this.tileSize.x/2).setY(0);
    }

    getTileIndexFromVec3(pos: Vector3): Vector2 {
        const scalarVec = new Vector3(this.tileSize.x, 1, this.tileSize.y);
        const tmpPos = pos.clone();
        tmpPos.divide(scalarVec).floor().multiply(scalarVec);
        const ret = new Vector2(
            tmpPos.x / this.tileSize.x, tmpPos.z / this.tileSize.y);
        return ret.add(this.tileNum.clone().divideScalar(2)).add(this.mapPos);
    }
    
    getNumIndexFromTileIndex(tileIdx: Vector2): number {
        return tileIdx.y * this.tileNum.x + tileIdx.x;   
    }

    getTileIndexFromNumIndex(idx: number): Vector2 {
        return new Vector2(idx % this.tileNum.x, Math.floor(idx / this.tileNum.x));
    }
}
