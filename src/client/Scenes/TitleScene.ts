import IScene from './IScene'
import SceneMng from '../Systems/SceneMng'
import GameScene from './GameScene'

export default class TitleScene extends IScene {
    constructor(sceneMng: SceneMng) {
        super(sceneMng);
        this.sceneMng.GetRenderer().setClearColor(0x000000);
    }

    Destroy(): void {

    }

    ProcessInput(): void {

    }

    Init(): boolean {
        return true;
    }

    Update(deltaTime_s: number): void {

    }

    Render(): void {

    }

    ChangeScene(scene: IScene): IScene {
        scene.Destroy();
        console.log('TitleScene to GameScene');
        scene = new GameScene(this.sceneMng);
        scene.Init();
        return scene;
    }
}
