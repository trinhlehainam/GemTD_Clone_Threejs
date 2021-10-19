"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Entity_1 = require("./GameObject/Entity");
const Transform_1 = require("./Components/Transform");
function main() {
    let entity = new Entity_1.default('checker');
    let transform = entity.AddComponent(Transform_1.default);
    console.log(transform);
    console.log(entity);
    entity.Render();
}
main();
//# sourceMappingURL=main.js.map