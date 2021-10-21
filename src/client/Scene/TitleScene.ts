import IScene from './IScene'
import GameScene from './GameScene'

export default class TitleScene extends IScene {
    constructor() {
        super();
    }

    Init(): boolean {
        return true;
    }

    Update(deltaTime_s: number): void {

    }

    ChangeScene(scene: IScene): IScene {
        scene = new GameScene();
        scene.Init();
        return scene;
    }
}
