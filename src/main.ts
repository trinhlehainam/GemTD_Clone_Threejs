import Entity from './GameObject/Entity'
import Transform from './Components/Transform'

function main(): void {
    let entity: Entity = new Entity('checker');
    let transform = entity.AddComponent(Transform);
    console.log(transform);
    console.log(entity);
    entity.Render();
}

main();
