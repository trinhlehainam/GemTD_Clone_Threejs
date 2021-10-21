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
        
        this.currentState = (this.currentState + 1) % this.kNumStates;

        for (let id = 0; id < this.kNumInputs; ++id){
            this.SetInputState(id, this.updateKeys[this.inputCodes[id]]);
        }
        /* const oldkey = this.updateKeys[32];
        const newKey = this.keyboardKeys[32];
        console.log(oldkey + ' ' + newKey); */
        this.updateKeys = [...this.keyboardKeys];
    }

    IsJustPressed(inputID: INPUT_ID): boolean {
        if (this.inputCodes === undefined) return false;

        const oldkey = this.updateKeys[this.inputCodes[inputID]];
        const newKey = this.keyboardKeys[this.inputCodes[inputID]];
        console.log(oldkey + ' ' + newKey);
        return newKey && !oldkey;
    }
    
    private keyDown(event: KeyboardEvent): void {
        this.keyboardKeys[event.keyCode] = true; 
    }

    private keyUp(event: KeyboardEvent): void {
        this.keyboardKeys[event.keyCode] = false;
    }

}
