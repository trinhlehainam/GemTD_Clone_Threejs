import * as THREE from 'three'
import {GUI} from 'dat.gui'

import ModelDataMng from '../Systems/ModelDataMng'

import Entity from '../GameObjects/Entity'
import Transform from '../Components/Transform'

import GameMng from './GameMng'

export default class Enemy {
    private enitty: Entity
    private model: THREE.Group
    private mixer: THREE.AnimationMixer
    private scene: THREE.Scene;
    private actions: {[key: string]: THREE.AnimationAction}
    private currentActionKey: string

    private gameMng: GameMng
    private mapPos: THREE.Vector2

    private paths: Array<THREE.Vector3[]>
    private currentPath: [number, number]
    private targetPos: THREE.Vector3
    private isAtGoal: boolean
    
    constructor(scene: THREE.Scene, gameMng: GameMng){
        this.scene = scene;
        this.gameMng = gameMng;
        this.mapPos = new THREE.Vector2(); 

        this.enitty = new Entity('player');
        this.actions = {};

        this.model = ModelDataMng.GetObject3D('swat-guy') as THREE.Group;
        this.model.traverse(node => {
            if (node instanceof THREE.Mesh)
                node.castShadow = true;
        })
        this.mixer = new THREE.AnimationMixer(this.model);
        const animations = ModelDataMng.GetAnimationClips('swat-guy') as THREE.AnimationClip[];
        this.currentActionKey = "idle";
        const animKeys = Object.keys(animations);
        console.log(animations);
        for (let i = 0; i < animKeys.length; ++i){
            this.actions[animations[i].name.toLowerCase()] = this.mixer.clipAction(animations[i]);
        }
        this.actions[this.currentActionKey].play();
        const transform = this.enitty.transform;
        transform.SetThreeObject(this.model);
        transform.scale.multiplyScalar(3);

        this.scene.add(this.model);

        this.paths = [];
        this.currentPath = [0, 0];
        this.targetPos = new THREE.Vector3();
        this.isAtGoal = false;
    }

    destroy(): void {
        this.scene.remove(this.model);
    }
    
    processInput(): void {
    }

    update(dt_s: number): void {
        if (!this.model) return;

        const transform = this.enitty.GetComponent(Transform);
        if (transform === undefined) return;
        const speed: number = 20.0 * dt_s;
        const diff = this.targetPos.clone().sub(transform.position);
        const dir = diff.clone().normalize();
        transform.position.add(dir.multiplyScalar(speed));

        const qua = new THREE.Quaternion();
        let forward = transform.forward;
        qua.setFromUnitVectors(forward, dir);
        transform.rotation.multiply(qua);

        let distance = diff.lengthSq();
        const bias:number = 0.01;
        if (distance <= bias){
            transform.position.copy(this.targetPos)
            this.setNextPath();
        }
        else
            this.setAnim('walking', 0.5);

        if (Object.keys(this.actions).length > 0){
        }

        this.mixer?.update(dt_s);
        this.enitty.Update(dt_s);
    }

    render(): void {
    }

    setPaths(paths: Array<THREE.Vector3[]>): void {
        this.paths = paths;
        this.currentPath = [0, 0];
        this.targetPos = this.paths[this.currentPath[0]][this.currentPath[1]];
    }

    isReachGoal(): boolean { return this.isAtGoal; }

    private setNextPath(): void {
        if(this.currentPath[1] < this.paths[this.currentPath[0]].length - 1)
            ++this.currentPath[1];
        else {
            if(this.currentPath[0] < this.paths.length - 1) {
                ++this.currentPath[0]
                this.currentPath[1] = 0;
            }
            else
                this.isAtGoal = true;
        }
        this.targetPos = this.paths[this.currentPath[0]][this.currentPath[1]];
    }

    setPos(pos: THREE.Vector3): void {
        const transform = this.enitty.GetComponent(Transform);
        if (transform === undefined) return;
        transform.position.copy(pos);
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
        currentAction.crossFadeTo(nextAcion, duration, true);
        nextAcion.play();
    }

    waitActionFinished(){
    }
}
