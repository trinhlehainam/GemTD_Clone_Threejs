import IInput from './IInput'
import INPUT_ID from './InputID'

export default class KeyboardInput extends IInput {
    private keyboardKeys: Array<boolean>
    private updateKeys: Array<boolean>
    private readonly maxKeyNum: number;

    constructor(inputs: number[]){
        super(inputs);
        this.maxKeyNum = 256;
        this.keyboardKeys = Array<boolean>(this.maxKeyNum).fill(false);
        this.updateKeys = [...this.keyboardKeys];

        window.addEventListener('keydown', this.keyDown.bind(this));
        window.addEventListener('keyup', this.keyUp.bind(this));
    }

    Update(): void {
        if (this.inputCodes === undefined) return;
        this.updateKeys = [...this.keyboardKeys];
        
        this.currentState = (this.currentState + 1) % this.kNumStates;

        for (let id = 0; id < this.kNumInputs; ++id){
            this.SetInputState(id, this.updateKeys[this.inputCodes[id]]);
        }
    }

    private keyDown(event: KeyboardEvent): void {
        this.keyboardKeys[event.keyCode] = true; 
    }

    private keyUp(event: KeyboardEvent): void {
        this.keyboardKeys[event.keyCode] = false;
    }

}
