import Entity from '../GameObjects/Entity'

export default abstract class IComponent {
    private owner?: Entity
    constructor(){ }

    SetOwner(owner: Entity){ this.owner = owner; }
    GetOwner(): Entity | undefined { return this.owner; }

    abstract Init(): void;
    abstract Update(deltaTime_s:number): void;
    abstract Render(): void;
}
