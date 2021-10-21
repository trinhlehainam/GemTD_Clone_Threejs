import IScene from './IScene'

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
        return scene;
    }
}
