import Char from './Char.js';
import InsertionResult from './InsertionResult.js';
import Identifier from './Identifier.js';


class CRDT {
    constructor(siteId) {
        this.counter = 0;
        this.struct = [];
        this.siteId = siteId;
        this.base = 32;
        this.boundary = 10;
        this.strategyCache = [];
        this.mult = 2;
    
    }

    localInsert(value, index, isBold, isItalic) {
        this.counter++;
        const newChar = this.generateChar(value, index);
        newChar.setBold(isBold);
        newChar.setItalic(isItalic);
        this.struct.splice(index, 0, newChar);
        return newChar;
    }

    handleRemoteInsert(ch) {
        const index = this.findInsertIndex(ch);
        this.struct.splice(index, 0, ch);
        return new InsertionResult(index, ch.getValue(),ch.isBold,ch.isItalic);
    }

    handleLocalDelete(idx) {
        if (idx < 0 || idx >= this.struct.length) {
            throw new RangeError(`Index ${idx} is out of bounds for list of size ${this.struct.length}`);
        }
        this.counter++;
        let character=this.struct.splice(idx, 1)[0];
        return new Char(character.value, character.counter, character.siteId, character.position, character.isBold, character.isItalic)
    }

    handleRemoteDelete(ch) {
        const index = this.findIndexByPosition(ch);
        this.struct.splice(index, 1);
        return index;
    }

    generateChar(value, index) {
        const posBefore = (index > 0 && this.struct[index - 1]) ? this.struct[index - 1].getPosition() : [];
        const posAfter = (index < this.struct.length && this.struct[index] ) ? this.struct[index].getPosition() : [];
        const newPos = this.generatePosBetween(posBefore, posAfter, [], 0);
        return new Char(value, this.counter, this.siteId, newPos);
    }

    retrieveStrategy(level) {
        while (this.strategyCache.length <= level) {
            this.strategyCache.push(null);
        }

        if (this.strategyCache[level] !== null) {
            return this.strategyCache[level];
        }

        const strategy = (Math.floor(Math.random() * 2) === 0) ? '+' : '-';
        this.strategyCache[level] = strategy;
        return strategy;
    }

    generateIdBetween(min, max, boundaryStrategy) {
        if ((max - min) < this.boundary) {
            min = min + 1;
        } else {
            if (boundaryStrategy === '-') {
                min = max - this.boundary;
            } else {
                min = min + 1;
                max = min + this.boundary;
            }
        }
        return Math.floor(Math.random() * (max - min)) + min;
    }

    generatePosBetween(pos1, pos2, newPos, level) {
        const base = Math.pow(this.mult, level) * this.base;
        const boundaryStrategy = this.retrieveStrategy(level);

        const id1 = pos1.length === 0 ? new Identifier(0, this.siteId) : pos1[0];
        const id2 = pos2.length === 0 ? new Identifier(base, this.siteId) : pos2[0];

        if (id2.getDigit() - id1.getDigit() > 1) {
            const newDigit = this.generateIdBetween(id1.getDigit(), id2.getDigit(), boundaryStrategy);
            newPos.push(new Identifier(newDigit, this.siteId));
            return newPos;
        } else if (id2.getDigit() - id1.getDigit() === 1) {
            newPos.push(id1);
            return this.generatePosBetween(pos1.slice(1), [], newPos, level + 1);
        } else if (id1.getDigit() === id2.getDigit()) {
            if (id1.getSiteId() < id2.getSiteId()) {
                newPos.push(id1);
                return this.generatePosBetween(pos1.slice(1), [], newPos, level + 1);
            } else if (id1.getSiteId() === id2.getSiteId()) {
                newPos.push(id1);
                return this.generatePosBetween(pos1.slice(1), pos2.slice(1), newPos, level + 1);
            } else {
                throw new Error("Fix Position Sorting");
            }
        }

        return newPos;
    }

    findInsertIndex(ch) {
        let left = 0;
        let right = this.struct.length - 1;
        let mid, compareNum;

        if (this.struct.length === 0 || ch.compareTo(this.struct[left]) < 0) {
            return left;
        } else if (ch.compareTo(this.struct[right]) > 0) {
            return this.struct.length;
        }

        while (left + 1 < right) {
            mid =Math.floor( left + (right - left) / 2);
            compareNum = ch.compareTo(this.struct[mid]);

            if (compareNum === 0) {
                return mid;
            } else if (compareNum > 0) {
                left = mid;
            } else {
                right = mid;
            }
        }

        return ch.compareTo(this.struct[left]) === 0 ? left : right;
    }

    findIndexByPosition(ch) {
        let left = 0;
        let right = this.struct.length - 1;

        while (left + 1 < right) {
            let mid = Math.floor( left + (right - left) / 2);
            console.log(`testing ${this.struct}`);
            console.log(mid);
            let compareNum = ch.compareTo(this.struct[mid]);

            if (compareNum === 0) {
                return mid;
            } else if (compareNum > 0) {
                left = mid;
            } else {
                right = mid;
            }
        }

        if (ch.compareTo(this.struct[left]) === 0) {
            return left;
        } else if (ch.compareTo(this.struct[right]) === 0) {
            return right;
        } else {
            throw new Error("Character does not exist in CRDT.");
        }
    }
     // Getters and Setters
     get counter() {
        return this._counter;
    }

    set counter(value) {
        this._counter = value;
    }

    get struct() {
        return this._struct;
    }

    set struct(value) {
        this._struct = value;
    }

    get siteId() {
        return this._siteId;
    }

    set siteId(value) {
        this._siteId = value;
    }

    get base() {
        return this._base;
    }

    set base(value) {
        this._base = value;
    }

    get boundary() {
        return this._boundary;
    }

    set boundary(value) {
        this._boundary = value;
    }

    get strategyCache() {
        return this._strategyCache;
    }

    set strategyCache(value) {
        this._strategyCache = value;
    }

    get mult() {
        return this._mult;
    }

    set mult(value) {
        this._mult = value;
    }

  
}

export default CRDT;
