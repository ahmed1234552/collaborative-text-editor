import MessageType from './MessageType.js';
import Char from './Char.js';

class Message_Json {
    constructor(type, siteID, roomID, character, struct, startBold,endBold,startItalic,endItalic) { //arg4 Character or struct -> arg5 is null
                                                            // arg5 start bolding or italic -> arg5 end 
        this.type = type;
        this.siteID = siteID || 0;
        this.roomID = roomID || 0;

        // Create Char instance if character is not null, otherwise assign null
        this.character = character ? new Char(character.value, character.counter, character.siteId, character.position, character.isBold, character.isItalic) : null;

        // Create Char instances for struct
        this.struct = struct ? struct.map(character => new Char(character.value, character.counter, character.siteId, character.position, character.isBold, character.isItalic)) : null;

        // Create Char instances for startBold, endBold, startItalic, endItalic
        this.startBold = startBold ? new Char(startBold.value, startBold.counter, startBold.siteId, startBold.position, startBold.isBold, startBold.isItalic) : null;
        this.endBold = endBold ? new Char(endBold.value, endBold.counter, endBold.siteId, endBold.position, endBold.isBold, endBold.isItalic) : null;
        this.startItalic = startItalic ? new Char(startItalic.value, startItalic.counter, startItalic.siteId, startItalic.position, startItalic.isBold, startItalic.isItalic) : null;
        this.endItalic = endItalic ? new Char(endItalic.value, endItalic.counter, endItalic.siteId, endItalic.position, endItalic.isBold, endItalic.isItalic) : null;
      
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

export default Message_Json;
