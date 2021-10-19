"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IComponent_1 = require("./IComponent");
const three_1 = require("three");
class Transform extends IComponent_1.default {
    constructor() {
        super();
        this.position = new three_1.Vector3();
        this.scale = new three_1.Vector3(1.0, 1.0, 1.0);
    }
    Init() {
    }
    Update(dt_s) {
    }
    Render() {
        var _a;
        console.log((_a = this.GetOwner()) === null || _a === void 0 ? void 0 : _a.GetTag());
    }
}
exports.default = Transform;
//# sourceMappingURL=Transform.js.map