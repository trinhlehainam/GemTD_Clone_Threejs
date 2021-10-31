import {Object3D} from 'three'

// Base class for tile object (BLOCK, TOWER, ...)
export default abstract class ITileObject {
    protected model?: Object3D
    protected tag?: string

    constructor(model: Object3D);
    constructor(tag: string);
    constructor(model: Object3D, tag: string);

    constructor(a: Object3D | string, b?: string){
        if (a instanceof Object3D){
            this.model = a;
            this.tag = b;
        }
        else
            this.tag = a;
    } 

    setModel(model: Object3D): void {
        this.model = model;
    }

    setTag(tag: string): void {
        this.tag = tag;
    }

    getModel(): Object3D | undefined { return this.model; }

    getTag(): string | undefined { return this.tag; }

    abstract init(): boolean;
    abstract update(deltaTime_s: number): void;
    abstract render(): void;
}
