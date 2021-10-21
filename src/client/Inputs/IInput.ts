import INPUT_ID from './InputID'

export default abstract class IInput {
    protected inputCodes?: number[];
    protected inputStates: [boolean[], boolean[]]
    protected currentState: number;
    protected readonly kNumStates: number;
    protected readonly kNumInputs: number;

    constructor(inputs?: number[]){
        this.inputCodes = inputs;
        this.currentState = 0; 

        this.kNumInputs = Object.keys(INPUT_ID)
        .filter(key => isNaN(Number(key))).length;

        let initState = Array<boolean>(this.kNumInputs).fill(false);
        this.inputStates = [initState, initState];
        this.kNumStates = this.inputStates.length;
    }

    abstract Update(): void;

    IsPressed(inputID: INPUT_ID): boolean {
        return this.inputStates[this.currentState][inputID]; 
    }

    IsJustPressed(inputID: INPUT_ID): boolean {
        const currentState = this.inputStates[this.currentState][inputID];
        const previousState = this.inputStates[this.PreviousState()][inputID];
        return currentState && !previousState;
    }

    IsReleased(inputID: INPUT_ID): boolean {
        return !this.inputStates[this.currentState][inputID]; 
    }

    IsJustReleased(inputID: INPUT_ID): boolean {
        const currentState = this.inputStates[this.currentState][inputID];
        const previousState = this.inputStates[this.PreviousState()][inputID];
        return !currentState && previousState;
    }

    IsAnyKeyPressed(): boolean {
        for (let i = 0; i < this.kNumInputs; ++i){
            if (this.inputStates[this.currentState][i] === true)
                return true;
        }
        return false;
    }
    
    protected SetInputState(inputID: INPUT_ID, state: boolean): void {
        this.inputStates[this.currentState][inputID] = state;        
    }

    protected PreviousState(): number{
        return (this.currentState - 1 + this.kNumStates) % this.kNumStates;
    }
}
