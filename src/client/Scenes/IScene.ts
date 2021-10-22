import {Camera, PerspectiveCamera, Scene} from 'three'

import SceneMng from '../Systems/SceneMng'

export default abstract class IScene {
    protected camera: PerspectiveCamera
    protected scene: Scene
    protected sceneMng: SceneMng

    private isEnable: boolean
    constructor(sceneMng: SceneMng){
        this.sceneMng = sceneMng;
        this.scene = new Scene();

        this.camera = new PerspectiveCamera(
            45, window.innerWidth / window.innerHeight, 0.1, 100);
        this.camera.position.set(0,2,2);
        this.camera.lookAt(this.scene.position);

        this.isEnable = true; 
    }

    abstract Init(): boolean;
    abstract ProcessInput(): void;
    abstract Update(deltaTime_s: number): void;
    abstract Render(): void;
    abstract ChangeScene(scene: IScene): IScene;

    SetEnable(flag: boolean): void { this.isEnable = flag; }
    GetThreeScene(): Scene { return this.scene; }
    GetThreeCamera(): Camera { return this.camera; }
    IsEnable(): boolean { return this.isEnable; }
}
