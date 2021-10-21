import IComponent from '../Components/IComponent'

export default class Entity{
    private components: {[key: string]: IComponent} = {}
    private isActive: boolean = false
    constructor(
        private tag: string
    ) {}

    SetActive(flag: boolean): void { this.isActive = flag; }
    SetTag(tag: string): void { this.tag = tag; }

    GetTag(): string { return this.tag; }

    IsActive(): boolean { return this.isActive; }

    Update(dt_s: number): void {
        let keys = Object.keys(this.components);
        for (let i = 0; i < keys.length; ++i){
            this.components[keys[i]].Update(dt_s);
        }
    }

    Render(): void {
        let keys = Object.keys(this.components);
        for (let i = 0; i < keys.length; ++i){
            this.components[keys[i]].Render();
        }
    }
    
    HasComponent<T extends IComponent>(type: (new() => T)): boolean {
        return this.components.hasOwnProperty(type.name);
    }

    AddComponent<T extends IComponent>(type: (new() => T)): T | undefined {
        if (this.HasComponent(type)) return undefined;

        this.components[type.name] = new type();
        const component = this.components[type.name];
        
        // Specify type for compiler
        if (component instanceof type){
            component.SetOwner(this);
            component.Init();
            return component;
        }
        return undefined;
    }

    GetComponent<T extends IComponent>(type: (new() => T)): T | undefined {
        if (!this.HasComponent(type)) return undefined;
        const component = this.components[type.name];
        if (component instanceof type)
            return component;
    }
}