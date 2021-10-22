import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {Scene, Group, Mesh, AnimationMixer, AnimationAction} from 'three'
import {GUI} from 'dat.gui'

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
    private actions: {[key: string]: AnimationAction}
    private currentActionKey: string
    
    // Debug
    private gui: GUI
    private options: any
    constructor(scene: Scene){
        this.scene = scene;
        this.enitty = new Entity('player');
        this.enitty.AddComponent(Transform);
        const url: string = './assets/factory/eve.glb';
        this.loadGLTF(url);
        this.constroller = new KeyboardInput([37,39,38,40,65,16]);
        this.actions = {};
        this.currentActionKey = "";

        this.gui = new GUI();
        this.options = {};
    }
    
    processInput(): void {
        this.constroller.Update();
    }

    update(dt_s: number): void {
        const transform = this.enitty.GetComponent(Transform);
        if (transform === undefined) return;
        let walk: boolean = false;
        let run: boolean = false;
        
        let speed = 0.0;
        if (this.constroller.IsPressed(INPUT_ID.UP)) {
            walk = true;
            speed = 1.0;
            if (this.constroller.IsPressed(INPUT_ID.SHIFT))
                run = true; 
        }

        if (this.constroller.IsPressed(INPUT_ID.SPACE))
            this.setAnim('firing', 0.2);
        else if (Object.keys(this.actions).length > 0){
            if (run)
                this.setAnim('run', 1);
            else if (walk)
                this.setAnim('walk', 0.5);
            else
                this.setAnim('idle', 0.5);
        }

        if (this.model) this.model.position.copy(transform.position);
        this.mixer?.update(dt_s);

        this.updateGUI();
    }

    render(): void {
        this.gui.updateDisplay();
    }

    private createGUI(): void {
        const idle = this.actions['idle'];
        const walk = this.actions['walk'];
        const run = this.actions['run'];

        this.options = {
            idleWeight: idle.getEffectiveWeight(),
            walkWeight: walk.getEffectiveWeight(),
            runWeight: run.getEffectiveWeight(),
            animKey: this.currentActionKey,
            animList: Object.keys(this.actions)
        }

        const anim = this.gui.addFolder('Animation');
        anim.add(this.options, 'animKey');
        console.log(this.options.animList);
        anim.open();

        const weight = this.gui.addFolder('Weights');
        weight.add(this.options, 'idleWeight', 0, 1 , 0.1);
        weight.add(this.options, 'walkWeight', 0, 1, 0.1);
        weight.add(this.options, 'runWeight', 0, 1, 0.1);
        weight.open();
    }

    private updateGUI(): void {
        if (Object.keys(this.actions).length == 0) return;

        const idle = this.actions['idle'];
        const walk = this.actions['walk'];
        const run = this.actions['run'];
        this.options.idleWeight = idle.getEffectiveWeight();
        this.options.walkWeight = walk.getEffectiveWeight();
        this.options.runWeight = run.getEffectiveWeight();
        this.options.animKey = this.currentActionKey;
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
                gltf.animations.forEach(anim => {
                    this.actions[anim.name.toLowerCase()] = this.mixer!.clipAction(anim);
                })
                this.currentActionKey = 'idle';
                this.actions[this.currentActionKey].play();
                this.model.traverse(node => {
                    if(node instanceof Mesh){
                        // node.receiveShadow = true;
                        node.castShadow = true;
                    }
                })
                this.scene.add(this.model);
                this.createGUI();
            },
            xhr => {

            },
            err => {
                console.error(err);
            }
        )
    }

    setAnim(animKey: string, duration: number): void {
        if (this.currentActionKey === animKey) return;
        this.crossFadeAnim(animKey, duration);
        this.currentActionKey = animKey;
    }

    crossFadeAnim(animKey: string, duration: number): void {
        const currentAction = this.actions[this.currentActionKey]
        const nextAcion = this.actions[animKey];

        nextAcion.reset();
        nextAcion.setEffectiveTimeScale(1);
        nextAcion.setEffectiveWeight(1);
        currentAction.crossFadeTo(nextAcion, duration, true);
        nextAcion.play();
    }

    waitActionFinished(){
    }
}
