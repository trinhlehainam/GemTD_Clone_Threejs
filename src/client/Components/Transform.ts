import IComponent from './IComponent'
import {Vector3, Quaternion} from 'three'

export default class Transform extends IComponent {
    public scale:Vector3
    public position:Vector3
    public quternion:Quaternion

    constructor() { 
        super(); 
        this.scale = new Vector3(1.0 ,1.0, 1.0);
        this.quternion = new Quaternion();
        this.position = new Vector3();
    }

    Init(): void {

    }

    Update(dt_s:number): void {

    }

    Render(): void {
        console.log(this.GetOwner()?.GetTag());
    }
}
