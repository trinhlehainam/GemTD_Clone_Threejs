import ITileObject from './ITileObject'
import {Color, BoxGeometry, MeshPhongMaterial} from 'three'

export default class Block extends ITileObject {

    constructor(tag: string, color: number = 0xaaaaaa) {
        const boxGeo = new BoxGeometry()
        super(tag);
    }

    init(): boolean { return true; }
    update(deltaTime_s: number): void {}
    render(): void {}
}
