import MessageType from './MessageType.js';
import Char from './Char.js';

class Message {
    constructor(type, siteID, roomID, arg4, arg5, isItalic) { //arg4 Character or struct -> arg5 is null
                                                            // arg5 start bolding or italic -> arg5 end 
        this.type = type || null;
        this.siteID = siteID || 0;
        this.roomID = roomID || 0;
        this.character = null;
        this.struct = null;
        this.startBold = null;
        this.endBold = null;
        this.startItalic = null;
        this.endItalic = null;

        if(arg4 !==null ){
        if (Array.isArray(arg4)) {
            this.struct = arg4;
        } else if (arg4 instanceof Char) {
            if (arg5 instanceof Char) {
                if (isItalic) {
                    this.startItalic = arg4;
                    this.endItalic = arg5;
                } else {
                    this.startBold = arg4;
                    this.endBold = arg5;
                }
            } else {
                this.character = arg4;
            }
        }
    }
}

    // Getters and Setters
    getType() {
        return this.type;
    }

    setType(type) {
        this.type = type;
    }

    getSiteID() {
        return this.siteID;
    }

    setSiteID(siteID) {
        this.siteID = siteID;
    }

    getRoomID() {
        return this.roomID;
    }

    setRoomID(roomID) {
        this.roomID = roomID;
    }

    getCharacter() {
        return this.character;
    }

    setCharacter(character) {
        this.character = character;
    }

    getStruct() {
        return this.struct;
    }

    setStruct(struct) {
        this.struct = struct;
    }

    getStartBold() {
        return this.startBold;
    }

    setStartBold(startBold) {
        this.startBold = startBold;
    }

    getEndBold() {
        return this.endBold;
    }

    setEndBold(endBold) {
        this.endBold = endBold;
    }

    getStartItalic() {
        return this.startItalic;
    }

    setStartItalic(startItalic) {
        this.startItalic = startItalic;
    }

    getEndItalic() {
        return this.endItalic;
    }

    setEndItalic(endItalic) {
        this.endItalic = endItalic;
    }
}

export default Message;
