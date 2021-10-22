import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {Scene, Group, Mesh, AnimationMixer} from 'three'

import Entity from '../GameObjects/Entity'
import Transform from '../Components/Transform'
import KeyboardInput from '../Inputs/KeyboardInput'
import INPUT_ID from '../Inputs/InputID'

export default class Player {
    private enitty: Entity
    private model?: Group
    private mixer?: AnimationMixer
    private constroller: KeyboardInput
    private scene: Scene;
    constructor(scene: Scene){
        this.scene = scene;
        this.enitty = new Entity('player');
        this.enitty.AddComponent(Transform);
        const url: string = './assets/factory/eve.glb';
        this.loadGLTF(url);
        this.constroller = new KeyboardInput([37,39,38,40,32]);
    }
    
    processInput(): void {
        this.constroller.Update();
    }

    update(dt_s: number): void {
        const transform = this.enitty.GetComponent(Transform);
        if (transform === undefined) return;
        
        const speed = 1.0;
        if (this.constroller.IsPressed(INPUT_ID.LEFT)) {
            transform.position.x += speed * dt_s;
        }
        if (this.constroller.IsPressed(INPUT_ID.RIGHT)) {
            transform.position.x += -speed * dt_s;
        }
        if (this.constroller.IsPressed(INPUT_ID.UP)) {
            transform.position.z += speed * dt_s;
        }
        if (this.constroller.IsPressed(INPUT_ID.DOWN)) {
            transform.position.z += -speed * dt_s;
        }

        if (this.model) this.model.position.copy(transform.position);
        this.mixer?.update(dt_s);
    }

    private loadGLTF(url: string): void{
        const loader = new GLTFLoader(); 
        const draco = new DRACOLoader();
        draco.setDecoderPath('./js/libs/draco/');
        loader.setDRACOLoader(draco);

        loader.load(
            url,
            gltf => {
                this.model = gltf.scene;
                this.mixer = new AnimationMixer(this.model);
                const clip = this.mixer.clipAction(gltf.animations[1]);
                clip.play();
                this.model.traverse(node => {
                    if(node instanceof Mesh){
                        // node.receiveShadow = true;
                        node.castShadow = true;
                    }
                })
                this.scene.add(this.model);
                console.log(this.scene);
            },
            xhr => {

            },
            err => {
                console.error(err);
            }
        )
    }
}
