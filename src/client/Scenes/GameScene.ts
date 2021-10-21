import IScene from './IScene'
import TitleScene from './TitleScene'

export default class GameScene extends IScene {
    constructor() {
        super();
    }

    Init(): boolean {
        return true;
    }

    Update(deltaTime_s: number): void {

    }

    ChangeScene(scene: IScene): IScene {
        console.log('GameScene to TitleScene');
        scene = new TitleScene();
        return scene;
    }
}
