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
    }

    destroy(): void {
    }
    
    processInput(): void {
    }

    update(dt_s: number): void {
        if (!this.model) return;

        const transform = this.enitty.GetComponent(Transform);
        if (transform === undefined) return;

        if (Object.keys(this.actions).length > 0){
        }

        this.mixer?.update(dt_s);
        this.enitty.Update(dt_s);
    }

    render(): void {
    }

    setPaths(paths: Array<THREE.Vector2[]>): void {
        for (const [idx, path] of paths.entries()){
            path.forEach(pos => this.paths[idx].push(this.gameMng.GetMap().getWorldPosFromTileIndex(pos)));
        }
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
