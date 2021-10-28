import SceneMng from './Systems/SceneMng'

export default class App {
    private sceneMng: SceneMng

    constructor(){
        this.sceneMng = new SceneMng();
    }

    async init(): Promise<void> {
        this.sceneMng.Init();
    }

    run(): void{
        this.sceneMng.Run();
    }
}
