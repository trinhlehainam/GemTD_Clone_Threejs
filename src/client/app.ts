import SceneMng from './Systems/SceneMng'

export default class App {
    private sceneMng: SceneMng

    constructor(){
        this.sceneMng = new SceneMng();
    }

    run(): void{
        this.sceneMng.Init();
    }

    /* private loadGLTF(url: string): void{
        const loader = new GLTFLoader(); 
        const draco = new DRACOLoader();
        draco.setDecoderPath('./js/libs/draco/');
        loader.setDRACOLoader(draco);

        loader.load(
            url,
            gltf => {
                this.model = gltf.scene;
                this.mixer = new THREE.AnimationMixer(this.model);
                const clip = this.mixer.clipAction(gltf.animations[1]);
                clip.play();
                this.model.traverse(node => {
                    if(node instanceof THREE.Mesh){
                        node.receiveShadow = true;
                        node.castShadow = true;
                    }
                })
                this.scene.add(this.model);
                this.addGUI();
                this.run();
            },
            xhr => {

            },
            err => {
                console.error(err);
            }
        )
    } */
}
