import IScene from './IScene'
import SceneMng from '../Systems/SceneMng'
import GameScene from './GameScene'

export default class TitleScene extends IScene {
    constructor(sceneMng: SceneMng) {
        super(sceneMng);
    }

    Init(): boolean {
        return true;
    }

    Update(deltaTime_s: number): void {

    }

    Render(): void {

    }

    ChangeScene(scene: IScene): IScene {
        console.log('TitleScene to GameScene');
        scene = new GameScene(this.sceneMng);
        scene.Init();
        return scene;
    }
}
