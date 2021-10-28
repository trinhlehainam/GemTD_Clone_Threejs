import * as THREE from 'three'
import {GUI} from 'dat.gui'
import {Pathfinding} from 'three-pathfinding'

import ModelDataMng from '../Systems/ModelDataMng'

import Entity from '../GameObjects/Entity'
import Transform from '../Components/Transform'

import Stage from './Stage'

export default class Enemy {
    private enitty: Entity
    private model: THREE.Group
    private mixer: THREE.AnimationMixer
    private scene: THREE.Scene;
    private actions: {[key: string]: THREE.AnimationAction}
    private currentActionKey: string

    private stage: Stage
    private mapPos: THREE.Vector2

    private pathfinding: any
    
    // Debug
    private gui: GUI
    private options: any

    // Test Rotation
    private pointer: THREE.Vector2
    private raycaster: THREE.Raycaster
    private camera: THREE.Camera
    private targetPos: THREE.Vector3

    // Pathfinding
    private ZONE: string;
    private navMeshGroup: number;
    private navMesh: THREE.Mesh;
    private pathLines?: THREE.Line

    constructor(scene: THREE.Scene, stage: Stage, camera: THREE.Camera){
        this.scene = scene;
        this.stage = stage;
        this.mapPos = new THREE.Vector2(); 

        this.enitty = new Entity('player');
        this.actions = {};

        this.gui = new GUI();
        this.options = {};

        this.pointer = new THREE.Vector2(); 
        this.raycaster = new THREE.Raycaster();
        this.camera = camera;
        this.targetPos = new THREE.Vector3();

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

        this.pathfinding = new Pathfinding();
        this.ZONE = 'factory';
        this.navMesh = this.scene.getObjectByName('ground') as THREE.Mesh;
        const zone = Pathfinding.createZone(this.navMesh.geometry, 0.02);
        console.log(zone);
        this.pathfinding.setZoneData(this.ZONE, zone);
        this.navMeshGroup = this.pathfinding.getGroup(this.ZONE, this.model.position) as number;
        console.log(this.navMeshGroup);

        document.addEventListener('pointerdown', this.onPointerDown.bind(this));
    }

    destroy(): void {
        this.gui.destroy();
    }
    
    processInput(): void {
    }

    update(dt_s: number): void {
        if (!this.model) return;

        const transform = this.enitty.GetComponent(Transform);
        if (transform === undefined) return;

        const speed: number = 10.0 * dt_s;
        const diff = this.targetPos.clone().sub(transform.position);
        const dir = diff.clone().normalize();
        // transform.position.z += speed;
        transform.position.add(dir.multiplyScalar(speed));
        
        const qua = new THREE.Quaternion();
        let forward = transform.forward;
        qua.setFromUnitVectors(forward, dir);
        transform.rotation.multiply(qua);

        let distance = diff.lengthSq();
        const bias:number = 0.01;
        if (distance <= bias){
            transform.position.copy(this.targetPos)
            this.setAnim('idle', 0.5);
        }
        else
            this.setAnim('walking', 0.5);

        if (Object.keys(this.actions).length > 0){
        }

        this.mixer?.update(dt_s);
        this.enitty.Update(dt_s);
    }

    render(): void {
        this.gui.updateDisplay();
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

    private onPointerDown(event: PointerEvent): void {
       this.pointer.set(
           +(event.clientX/window.innerWidth)*2-1,
           -(event.clientY/window.innerHeight)*2+1
       );

       this.raycaster.setFromCamera( this.pointer, this.camera );

       const intersects = this.raycaster.intersectObject(this.stage.GetGround(), false);

       if (!intersects.length) return;

       const intersect = intersects[0];
       this.targetPos = intersect.point;

       const path = this.pathfinding.findPath(this.model.position, this.targetPos, this.ZONE, this.navMeshGroup) as Array<THREE.Vector3>;
       if (!path.length) return;

       if (this.pathLines) this.scene.remove(this.pathLines);
       const points = [this.model.position];
       path.forEach((vertex) => points.push(vertex.clone()));
       const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
       const lineMat = new THREE.LineBasicMaterial({color: 0xff0000, linewidth:2});
       this.pathLines = new THREE.Line(lineGeo, lineMat);

       const debugPaths = [this.model.position].concat(path);
       debugPaths.forEach(vertex => {
           const geometry = new THREE.SphereGeometry(0.3);
           const mat = new THREE.MeshBasicMaterial({color: 0xff0000});
           const node = new THREE.Mesh(geometry, mat);
           node.position.copy(vertex);
           this.pathLines?.add(node);
       });

       this.scene.add(this.pathLines);
       console.log(this.navMeshGroup);
       console.log(this.targetPos.setY(0));
       console.log(path);
       /* const normal = new THREE.Vector3();
       normal.copy((intersects[0].face as THREE.Face).normal);
       normal.transformDirection(intersects[0].object.matrixWorld).normalize();
       this.targetPos = intersect.point.clone().add(normal).setY(0); */
    }
}
