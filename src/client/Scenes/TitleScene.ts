import IScene from './IScene'
import SceneMng from '../Systems/SceneMng'

import GameScene from './GameScene'

import INPUT_ID from '../Inputs/InputID'
import KeyboardInput from '../Inputs/KeyboardInput'

export default class TitleScene extends IScene {
    private controller: KeyboardInput;

    constructor(sceneMng: SceneMng) {
        super(sceneMng);
        this.sceneMng.GetRenderer().setClearColor(0x000000);
        this.controller = new KeyboardInput([37,39,38,40,32]);

    }

    Destroy(): void {
        this.controller.Destroy();
    }

    ProcessInput(): void {
        this.controller.Update();
    }

    Init(): boolean {
        return true;
    }

    Update(deltaTime_s: number): void {
        if (this.controller.IsJustPressed(INPUT_ID.SPACE))
            this.EnableChangeScene();
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
