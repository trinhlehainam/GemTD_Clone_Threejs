import INPUT_ID from './InputID'

export default abstract class IInput {
    private inputs?: number[];
    private inputStates: [boolean[], boolean[]]
    private currentState: number;
    private numStates: number;

    constructor(inputs?: number[]){
        this.inputs = inputs;
        this.currentState = 0; 
        let numInputs = Object.keys(INPUT_ID).filter(isNaN).length;
        let initState = Array<boolean>(numInputs).fill(false);
        this.inputStates = [initState, initState];
        this.numStates = this.inputStates.length;
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

    private PreviousState(): number{
        return (this.currentState + 1) % this.numStates;
    }
}
