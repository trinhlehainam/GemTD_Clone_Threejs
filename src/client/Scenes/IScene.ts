import {Camera, PerspectiveCamera, Scene} from 'three'

export default abstract class IScene {
    protected camera: PerspectiveCamera
    protected scene: Scene

    private isEnable: boolean
    constructor(){
        this.scene = new Scene();

        this.camera = new PerspectiveCamera(
            45, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0,2,2);
        this.camera.lookAt(this.scene.position);

        this.isEnable = true; 
    }

    abstract Init(): boolean;
    abstract Update(deltaTime_s: number): void;
    abstract ChangeScene(scene: IScene): IScene;

    SetEnable(flag: boolean): void { this.isEnable = flag; }
    GetScene(): Scene { return this.scene; }
    GetCamera(): Camera { return this.camera; }
    IsEnable(): boolean { return this.isEnable; }
}
