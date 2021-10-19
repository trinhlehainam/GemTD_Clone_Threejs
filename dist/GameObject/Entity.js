"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Entity {
    constructor(tag) {
        this.tag = tag;
        this.components = {};
        this.isActive = false;
    }
    SetActive(flag) { this.isActive = flag; }
    SetTag(tag) { this.tag = tag; }
    GetTag() { return this.tag; }
    IsActive() { return this.isActive; }
    Update(dt_s) {
        let keys = Object.keys(this.components);
        for (let i = 0; i < keys.length; ++i) {
            this.components[keys[i]].Update(dt_s);
        }
    }
    Render() {
        let keys = Object.keys(this.components);
        for (let i = 0; i < keys.length; ++i) {
            this.components[keys[i]].Render();
        }
    }
    HasComponent(type) {
        return this.components.hasOwnProperty(type.name);
    }
    AddComponent(type) {
        if (this.HasComponent(type))
            return undefined;
        this.components[type.name] = new type();
        const component = this.components[type.name];
        // Specify type for compiler
        if (component instanceof type) {
            component.SetOwner(this);
            component.Init();
            return component;
        }
        return undefined;
    }
}
exports.default = Entity;
//# sourceMappingURL=Entity.js.map