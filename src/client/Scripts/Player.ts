import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {Scene, Group, Mesh, AnimationMixer, AnimationAction, Vector3, Vector2, Quaternion, Raycaster, Camera} from 'three'
import {GUI} from 'dat.gui'

import Entity from '../GameObjects/Entity'
import Transform from '../Components/Transform'
import KeyboardInput from '../Inputs/KeyboardInput'
import InputCommand from '../Inputs/InputCommand'
import INPUT_ID from '../Inputs/InputID'

import Stage from './Stage'

export default class Player {
    private enitty: Entity
    private model?: Group
    private mixer?: AnimationMixer
    private scene: Scene;
    private actions: {[key: string]: AnimationAction}
    private currentActionKey: string
    private constroller: KeyboardInput
    private inputCommand: InputCommand

    private stage: Stage
    private mapPos: Vector2
    
    // Debug
    private gui: GUI
    private options: any

    // Test Rotation
    private quaternion: Quaternion
    private pointer: Vector2
    private raycaster: Raycaster
    private camera: Camera
    private dest: Vector3

    constructor(scene: Scene, stage: Stage, camera: Camera){
        this.scene = scene;
        this.stage = stage;
        this.mapPos = new Vector2(); 

        this.enitty = new Entity('player');
        const url: string = './assets/factory/eve.glb';
        this.loadGLTF(url);
        this.actions = {};
        this.currentActionKey = "";

        this.constroller = new KeyboardInput([37,39,38,40,65,16]);
        this.inputCommand = new InputCommand(this.constroller);
        this.inputCommand.AddPattern(
            'shot',
            [INPUT_ID.LEFT, INPUT_ID.LEFT, INPUT_ID.LEFT]
        )
        this.inputCommand.AddPattern(
            'firing',
            [INPUT_ID.SPACE, INPUT_ID.SPACE, INPUT_ID.SPACE]
        )

        this.gui = new GUI();
        this.options = {};

        this.pointer = new Vector2(); 
        this.raycaster = new Raycaster();
        this.quaternion = new Quaternion();
        this.camera = camera;
        this.dest = new Vector3();

        document.addEventListener('pointerdown', this.onPointerDown.bind(this));
    }

    destroy(): void {
        this.gui.destroy();
    }
    
    processInput(): void {
        this.constroller.Update();
        this.inputCommand.Update();
    }

    update(dt_s: number): void {
        if (!this.model) return;

        const transform = this.enitty.GetComponent(Transform);
        if (transform === undefined) return;
        /* if (this.constroller.IsJustReleased(INPUT_ID.LEFT)){
            this.mapPos.x += -1;
        }
        if (this.constroller.IsJustReleased(INPUT_ID.RIGHT)){
            this.mapPos.x += 1;
        }
        if (this.constroller.IsJustReleased(INPUT_ID.UP)){
            this.mapPos.y += -1;
        }
        if (this.constroller.IsJustReleased(INPUT_ID.DOWN)){
            this.mapPos.y += 1;
        }
        let cursor: boolean = false;
        if (this.constroller.IsPressed(INPUT_ID.SHIFT)){
            cursor = true;
        }

        let shot: boolean = false;
        let fire: boolean = false
        if (this.inputCommand.IsMatch('shot', 1))
            shot = true;
        if (this.inputCommand.IsMatch('firing', 1))
            fire = true;
        
        if (Object.keys(this.actions).length > 0){
            if(shot)
                this.setAnim('shot', 0.5);
            else if(fire)
                this.setAnim('firing', 0.5);
            else
                this.setAnim('idle', 0.5);
        } */

        const speed: number = 10.0 * dt_s;
        const diff = this.dest.clone().sub(transform.position);
        const dir = diff.clone().normalize();
        // transform.position.z += speed;
        console.log(speed);
        transform.position.add(dir.multiplyScalar(speed));
        
        const degree_to_radian = (deg:number) => (deg * Math.PI)/180.0;
        const qua = new Quaternion();
        let forward = transform.forward;
        console.log(forward);
        qua.setFromUnitVectors(forward, dir);
        console.log(qua);
        transform.rotation.multiply(qua);

        let distance = diff.lengthSq();
        console.log('Distance : ' + distance);
        console.log('Diff : ' + `${diff.x} ${diff.y} ${diff.z}`);
        const bias:number = 0.01;
        if (distance <= bias){
            transform.position.copy(this.dest)
            this.setAnim('idle', 0.5);
        }
        else
            this.setAnim('run', 0.5);

        console.log('Player pos : ' + `${transform.position.x} ${transform.position.y} ${transform.position.z}`);
        console.log('Dest pos : ' + `${this.dest.x} ${this.dest.y} ${this.dest.z}`);
        // console.log(move);
        

        if (Object.keys(this.actions).length > 0){
        }

        /* this.mapPos.clamp(new Vector2(), new Vector2(37, 37));
        transform.position = this.stage.TileToMapPos(this.mapPos);
        this.stage.SetCursorPos(transform.position);
        this.stage.SetCursorVisible(cursor); */

        this.mixer?.update(dt_s);
        this.enitty.Update(dt_s);

        /* console.log(
            'Player pos: ' + `${transform.position.x}, ${transform.position.y}, ${transform.position.z}`);
        console.log('Player map tile pos: ' + `${this.mapPos.x}, ${this.mapPos.y}`); */

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
                const transform = this.enitty.GetComponent(Transform) as Transform;
                transform.scale.addScalar(2);
                transform.SetThreeObject(this.model);
                transform.position.copy(this.stage.VecToMapPos(transform.position));
                this.mapPos = this.stage.VecToTilePos(transform.position);
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

    private onPointerDown(event: PointerEvent): void {
       this.pointer.set(
           +(event.clientX/window.innerWidth)*2-1,
           -(event.clientY/window.innerHeight)*2+1
       );

       this.raycaster.setFromCamera( this.pointer, this.camera );

       const intersects = this.raycaster.intersectObject(this.stage.GetGround(), false);

       if (intersects.length > 0) {
           const intersect = intersects[0];
           const normal = new Vector3();
           normal.copy((intersects[0].face as THREE.Face).normal);
           normal.transformDirection(intersects[0].object.matrixWorld).normalize();
           this.dest = intersect.point.clone().add(normal).setY(0);
           console.log(this.dest);
       }
    }
}
