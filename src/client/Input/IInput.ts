import INPUT_ID from './InputID'

export default abstract class IInput {
    protected inputCodes?: number[];
    protected inputStates: [boolean[], boolean[]]
    protected currentState: number;
    protected readonly kNumStates: number;

    constructor(inputs?: number[]){
        this.inputCodes = inputs;
        this.currentState = 0; 

        let numInputs = Object.keys(INPUT_ID)
        .filter(key => isNaN(Number(key))).length;

        let initState = Array<boolean>(numInputs).fill(false);
        this.inputStates = [initState, initState];
        this.kNumStates = this.inputStates.length;
    }

    abstract Update(): void;

    IsPressed(inputID: INPUT_ID): boolean {
        return this.inputStates[this.currentState][inputID]; 
    }

    IsJustPressed(inputID: INPUT_ID): boolean {
        return this.inputStates[this.currentState][inputID] === true &&
            this.inputStates[this.PreviousState()][inputID] === false;
    }

    IsReleased(inputID: INPUT_ID): boolean {
        return !this.inputStates[this.currentState][inputID]; 
    }

    IsJustReleased(inputID: INPUT_ID): boolean {
        return this.inputStates[this.currentState][inputID] === false &&
            this.inputStates[this.PreviousState()][inputID] === true;
    }
    
    protected SetInputState(inputID: INPUT_ID, state: boolean): void {
        this.inputStates[this.currentState][inputID] = state;        
    }

    private PreviousState(): number{
        return (this.currentState - 1 + this.kNumStates) % this.kNumStates;
    }
}
