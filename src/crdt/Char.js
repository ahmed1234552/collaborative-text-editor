// Assuming Identifier is imported from another file
import Identifier from './Identifier.js';

class Char {
    constructor(value, counter, siteId, positions,isBold,isItalic) {
        this.value = value;
        this.counter = counter;
        this.siteId = siteId;
        this.position = positions.map(position => new Identifier(position.digit, position.siteId));
        this.isBold = isBold|false;
        this.isItalic = isItalic|false;
    }

    compareTo(otherChar) {
        let comp;
        let id1, id2;
        let pos1 = this.position;
        let pos2 = otherChar.position;

        for (let i = 0; i < Math.min(pos1.length, pos2.length); i++) {
            id1 = pos1[i];
            id2 = pos2[i];
            comp = id1.compareTo(id2);

            if (comp !== 0) {
                return comp;
            }
        }

        if (pos1.length < pos2.length) {
            return -1;
        } else if (pos1.length > pos2.length) {
            return 1;
        } else {
            return 0;
        }
    }

    // Getters
    getValue() {
        return this.value;
    }

    getCounter() {
        return this.counter;
    }

    getSiteId() {
        return this.siteId;
    }

    getPosition() {
        return this.position;
    }

    isBold() {
        return this.isBold;
    }

    setBold(bold) {
        this.isBold = bold;
    }

    isItalic() {
        return this.isItalic;
    }

    setItalic(italic) {
        this.isItalic = italic;
    }
    convertToBoolean(value) {
        return value === 1 || value === true; // Returns true if value is 1 or true, otherwise false
    }
}

export default Char;
