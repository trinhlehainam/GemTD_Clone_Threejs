import Ring from '../Utils/Ring'

import IInput from './IInput'
import INPUT_ID from './InputID'

type InputInfo = {
    id: INPUT_ID,
    timeStamp: number
}

export default class InputCommand {
    private constroller: IInput
    private patternMap: Map<string, INPUT_ID[]>
    private m_inputs: Ring<InputInfo>

    constructor(controller: IInput){
        this.constroller = controller;
        this.patternMap = new Map();
        this.m_inputs = new Ring<InputInfo>(10);
    }

    AddPattern(patternKey: string, inputIDs: INPUT_ID[]): void {
        if (this.patternMap.has(patternKey)) {
            console.log(`WARN: Input Pattern [${patternKey}] is already had !!!`);
            return;
        }
        this.patternMap.set(patternKey, inputIDs);
    }

    IsMatch(patternKey: string, timeOut_s?: number): boolean {
        const pattern = this.patternMap.get(patternKey);
        if (!pattern) return false;
        const kMatchNum = pattern.length;
        const currentTimeStamp = Date.now();
        let matchCount = 0;
        for (let input of this.m_inputs) {
            if (!input) return false;

            const elapsedTime_s = currentTimeStamp - input.timeStamp;

            if (timeOut_s)
                if (elapsedTime_s > timeOut_s)
                    continue;
            
            // NOTE:If pattern match increase matchCount by 1 else reset to 0
            matchCount = input.id === pattern[matchCount] ? matchCount + 1 : 0;
            if (matchCount > kMatchNum)
                return true;
        }

        return false;
    }

    Update(): void {
        const justPressedKeys = this.constroller.GetJustPressedKeys();

        for (const key of justPressedKeys)
            this.m_inputs.insert({id: key, timeStamp: Date.now()});
    }

}
