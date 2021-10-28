import IInput from './IInput'

export default class KeyboardInput extends IInput {
    private keyboardKeys: Array<boolean>
    private readonly maxKeyNum: number;

    constructor(inputs: number[]){
        super(inputs);
        this.maxKeyNum = 256;
        this.keyboardKeys = Array<boolean>(this.maxKeyNum).fill(false);

        window.addEventListener('keydown', this.keyDown.bind(this));
        window.addEventListener('keyup', this.keyUp.bind(this));
    }

    Destroy(): void {
        window.removeEventListener('keydown', this.keyDown.bind(this));
        window.removeEventListener('keyup', this.keyUp.bind(this));
    }

    Update(): void {
        if (this.inputCodes === undefined) return;
        
        this.currentState = (this.currentState + 1) % this.kNumStates;

        for (let id = 0; id < this.kNumInputs; ++id){
            this.SetInputState(id, this.keyboardKeys[this.inputCodes[id]]);
        }
    }

    private keyDown(event: KeyboardEvent): void {
        this.keyboardKeys[event.keyCode] = true; 
    }

    private keyUp(event: KeyboardEvent): void {
        this.keyboardKeys[event.keyCode] = false;
    }

}
