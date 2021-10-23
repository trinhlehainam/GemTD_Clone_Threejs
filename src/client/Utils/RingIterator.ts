export default class RingIterator<T> {
    private readonly ptr: T[]
    private index: number
    private loopIndex: number = -1
    private isReversed: boolean = false
    private size: number

    constructor(pointer: T[], size:number, index: number, isReversed?: boolean){
        this.ptr = pointer;
        this.size = size;
        if(isReversed) this.isReversed = isReversed;
        
        // NOTE:First time enter next() will immediately change index value
        // -> Set up index before enter next() depend on isReversed flag
        this.index = this.isReversed ? index + 1: index - 1;
    }

    next() {
        if (!this.loopCondition())
            return {value: undefined, done: true};

        ++this.loopIndex;

        if (this.isReversed)
            this.index = (this.index + this.size - 1) % this.size;
        else
            this.index = (this.index + 1) % this.size;

        return {value: this.ptr[this.index], done: false};
    }

    private loopCondition(): boolean {
        return this.loopIndex < this.size - 1;
    }
}
