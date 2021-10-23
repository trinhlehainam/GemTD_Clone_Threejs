import RingIterator from './RingIterator'

export default class Ring<T> {
    private data: T[];
    private headIndex: number;
    private tailIndex: number;
    private size: number;
    private isReversedLoop: boolean

    constructor(size: number) {
        this.data = new Array<T>(size);
        this.size = size;
        this.headIndex = size - 1;
        this.tailIndex = (this.headIndex + 1) % size;
        this.isReversedLoop = false;
    }

    insert(value: T): void {
        this.headIndex = (this.headIndex + 1) % this.size;
        this.tailIndex = (this.tailIndex + 1) % this.size;
        this.data[this.headIndex] = value;
    }

    setHeadToTailLoop(): void { this.isReversedLoop = true; }

    get length(): number { return this.data.length; }
    get tail(): T { return this.data[this.tailIndex]; }
    get head(): T { return this.data[this.headIndex]; }

    getData(): T[] { return this.data; }

    [Symbol.iterator]() {
        return new RingIterator<T>(
            this.data, this.size,
            this.isReversedLoop? this.headIndex : this.tailIndex, this.isReversedLoop);
    }
}
