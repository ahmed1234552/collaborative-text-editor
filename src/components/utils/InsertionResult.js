class InsertionResult {
    constructor(index, value,isBold,isItalic) {
        this.index = index;
        this.value = value;
        this.isBold=isBold;
        this.isItalic=isItalic;
    }

    getIndex() {
        return this.index;
    }

    getValue() {
        return this.value;
    }
    getisBold() {
        return this.isBold;
    }
    getisItalic() {
        return this.isItalic;
    }
}

export default InsertionResult;
