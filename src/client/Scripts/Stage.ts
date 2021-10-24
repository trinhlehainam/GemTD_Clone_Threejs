import * as THREE from 'three'

export default class Stage {

    constructor() {
        const groundGeo = new THREE.PlaneGeometry(100, 100);
        const groundMat = new THREE.MeshPhongMaterial({color: 0xaaaaaa});
        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.receiveShadow = true;
        this.ground.rotateX(-Math.PI/2);
        this.scene.add(this.ground);
    }

    Update(delta_s): void {

    }

    Render(): void {

    }
}
