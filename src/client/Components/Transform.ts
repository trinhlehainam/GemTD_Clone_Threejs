import IComponent from './IComponent'
import {Vector3, Quaternion, Object3D} from 'three'

export default class Transform extends IComponent {
    public scale:Vector3
    public position:Vector3
    public rotation:Quaternion
    public forward:Vector3
    public up:Vector3
    public right:Vector3

    private object: Object3D

    constructor() { 
        super(); 
        this.scale = new Vector3(1.0 ,1.0, 1.0);
        this.rotation = new Quaternion();
        this.position = new Vector3();
        this.object = new Object3D();
        this.forward = new Vector3(0.0, 0.0, 1.0);
        // TODO: update up and right vector
        this.up = new Vector3(0.0, 1.0, 0.0);
        this.right = new Vector3(1.0, 0.0, 0.0);
    }

    SetThreeObject(object: Object3D):void { this.object = object; }

    Init(): void {

    }

    Update(deltaTime_s:number): void {
        this.object.scale.copy(this.scale)
        this.object.setRotationFromQuaternion(this.rotation);
        this.object.position.copy(this.position);
        this.object.getWorldDirection(this.forward);
    }

    Render(): void {
        console.log(this.GetOwner()?.GetTag());
    }
}
