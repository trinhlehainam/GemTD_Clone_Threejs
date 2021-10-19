import IComponent from './IComponent'
import {Vector3} from 'three'

export default class Transform extends IComponent {
    public position:Vector3
    public scale:Vector3
    constructor() { 
        super(); 
        this.position = new Vector3();
        this.scale = new Vector3(1.0 ,1.0, 1.0);
    }

    Init(): void {

    }

    Update(dt_s:number): void {

    }

    Render(): void {
        console.log(this.GetOwner()?.GetTag());
    }
}
