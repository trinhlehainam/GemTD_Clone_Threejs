import Entity from '../GameObject/Entity'

export default abstract class IComponent {
    private owner?: Entity
    constructor(){ }

    SetOwner(owner: Entity){ this.owner = owner; }
    GetOwner(): Entity | undefined { return this.owner; }

    abstract Init(): void;
    abstract Update(dt_s:number): void;
    abstract Render(): void;
}
