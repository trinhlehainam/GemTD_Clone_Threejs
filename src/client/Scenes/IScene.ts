import {Camera, Scene} from 'three'

import SceneMng from '../Systems/SceneMng'

export default abstract class IScene {
    protected camera: Camera
    protected scene: Scene
    protected sceneMng: SceneMng

    private isEnable: boolean
    constructor(sceneMng: SceneMng){
        this.sceneMng = sceneMng;

        this.scene = new Scene();

        this.camera = new Camera();

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
