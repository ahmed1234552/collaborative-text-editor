import React, { useEffect, useState, useRef } from 'react';
import Char from '../utils/Char.js';
import InsertionResult from '../utils/InsertionResult.js';
import Identifier from '../utils/Identifier.js';
import MessageType from '../utils/MessageType.js';
import Message from '../utils/Message.js';
import Message_Json from '../utils/Message_json.js';
import CRDT from '../utils/CRDT.js';
import { generateUniqueInteger } from '../utils/Unique_generator.js';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Quill from 'quill';

import '../styles/TextEditor.css'; 


import { useParams } from 'react-router-dom';
import axios from 'axios';

const Texteditor = ({}) => {
  const { documentId } = useParams();

  console.log("ID is: " + documentId);

  useEffect(() => {
    toggleEdit(); // Run toggleEdit when component mounts
  }, [documentId]); // Empty dependency array ensures this runs only once  

  let Room_Id = 1;
  let Site_Id = generateUniqueInteger();
  let CRDT_Obj = new CRDT(Site_Id);
  const [value, setValue] = useState('');
  const quillRef = useRef(null);
  const quillInstanceRef = useRef(null);
  const socketRef = useRef(null);

  // Inside the Texteditor component
  const [isEditable, setIsEditable] = useState(true); // Start with editing enabled

  const toggleEdit = async () => {
    const response = await axios.get(
      `http://localhost:8082/api/documents/${documentId}`
    );
    console.log("Document fetched successfully:", response.data);

    if (response.data.permissionType == 'VIEW')
    {
      quillInstanceRef.current.disable();
      setIsEditable(false); 
    }
    else
    {
      quillInstanceRef.current.enable();
      setIsEditable(true); 
    }
    // Toggle the state
  };

  const textChangeHandler = (delta, oldDelta, source) => {
    if (source === 'user') {
      delta.ops.forEach(op => {
        if (op.insert) {

          let index = getCaretIndex() - op.insert.length;
          if(getCaretIndex()==0)
            {
                //index+=1;
            }

          console.log(`${getCaretIndex()}`)

           if (op.insert === '\n') {
             index += 1;
            }
            console.log(`${index}`)
          let isBold = quillInstanceRef.current.getFormat(index).bold;
          let isItalic = quillInstanceRef.current.getFormat(index).italic;
          const insertedChar = op.insert;
          let object = CRDT_Obj.localInsert(insertedChar, index, !!isBold, !!isItalic);
          let message = new Message(MessageType.Inserting, Site_Id, Room_Id, object);
          let json = JSON.stringify(message);
          socketRef.current.send(json);
          console.log(`Inserted '${op.insert}' at index ${index}`);
        } else if (op.delete) {
          const index = getCaretIndex();
          let object = CRDT_Obj.handleLocalDelete(index);
          object.isBold = !!object.isBold;
          object.isItalic = !!object.isItalic;
          let message = new Message(MessageType.Deleting, Site_Id, Room_Id, object);
          let json = JSON.stringify(message);
          console.log(`deletion ${json}`);
          socketRef.current.send(json);
          console.log(`Deleted character at index ${index}`);
        }
      });
    }
  };

  const modules = {
    toolbar: false, // Disable the toolbar
  };

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:8081/websocket');

    socketRef.current.onopen = function() {
      setTimeout(() => {
      const message = new Message(MessageType.ConnectionOpening, Site_Id, Room_Id);
      const json = JSON.stringify(message);
      socketRef.current.send(json);
      console.log('WebSocket connection established.');
      }, 100);
    };

    socketRef.current.onmessage = function(event) {
        console.log('Message received from server:', event.data);
        const jsonData = JSON.parse(event.data);
        // converting data 
        const type = jsonData.hasOwnProperty('type') ? jsonData['type'] : null; 
        
        const Site_ID = jsonData.hasOwnProperty('Site_ID') ? jsonData['Site_ID'] : null;
        
        const Room_ID = jsonData.hasOwnProperty('Room_ID') ? jsonData['Room_ID'] : null;
        
        const character = jsonData.hasOwnProperty('character') ? jsonData['character'] : null;
        
        const struct = jsonData.hasOwnProperty('struct') ? jsonData['struct'] : null;
        
        const startBold = jsonData.hasOwnProperty('startBold') ? jsonData['startBold'] : null;
        
        const endBold = jsonData.hasOwnProperty('endBold') ? jsonData['endBold'] : null; 
       
        const startItalic = jsonData.hasOwnProperty('startItalic') ? jsonData['startItalic'] : null; 
        
        const endItalic = jsonData.hasOwnProperty('endItalic') ? jsonData['endItalic'] : null; 
        
        // Use Data as Object 
    
        const messageObject = new Message_Json(type,Site_ID,Room_ID,character,struct,startBold,endBold,startItalic,endItalic);
        
        switch(messageObject.getType()){
            case MessageType.ConnectionOpening:
                
                CRDT_Obj.struct=messageObject.getStruct();
                struct_Rendering(CRDT_Obj.struct)
                break;
            case MessageType.Inserting:
                console.log("inserted :");
                console.log(messageObject.getCharacter());
                let object=CRDT_Obj.handleRemoteInsert(messageObject.getCharacter())
                console.log("insertTextAtPosition: " + "Index: " +  object.getValue() + " ,Value: " + object.getIndex() + " ,Bold?: " + object.getisBold()+ " ,Italic?: " + object.getisItalic() )
                insertTextAtPosition(object.getValue(),object.getIndex(),object.getisBold(),object.getisItalic())
                break;
            case MessageType.Deleting:
                
                let index=CRDT_Obj.handleRemoteDelete(messageObject.getCharacter())
                deleteCharacterAtIndex(index)
                break;
            case MessageType.Bolding:
                console.log(messageObject);
                let startBold=CRDT_Obj.findIndexByPosition(messageObject.getStartBold());
    
                let endBold=CRDT_Obj.findIndexByPosition(messageObject.getEndBold());
    
                let isBold=messageObject.getStartBold().isBold 
                
                for(let i=startBold;i<=endBold;i++)
                    {
                        CRDT_Obj.struct[i].isBold=!!isBold;
                      
                    }
                    console.log("bolding done");
                    console.log(CRDT_Obj.struct);
                    console.log("start_italic: " + startBold);
                    console.log("end_italic: " + endBold);
    
            
                    applyBoldToRange(startBold,endBold,isBold);
                    
                 break;
            case MessageType.Italic:
                console.log(messageObject);
    
                let startItalic=CRDT_Obj.findIndexByPosition(messageObject.getStartItalic());
    
                let endItalic=CRDT_Obj.findIndexByPosition(messageObject.getEndItalic());
        
                let isItalic=messageObject.getStartItalic().isItalic 
                    
                for(let i=startItalic;i<=endItalic;i++)
                    {
                            CRDT_Obj.struct[i].isItalic=!!isItalic;
                          
                    }
                    
                    
                    console.log("itlaic done");
                    console.log(CRDT_Obj.struct);
                    console.log("start_italic: " + startItalic);
                    console.log("end_italic: " + endItalic);
                
                    applyItalicToRange(startItalic,endItalic,isItalic);
                        
                break;
            default:
                
    
        }
     
    };

    socketRef.current.onclose = function(event) {
      console.log('WebSocket connection closed:', event);
    };
  
    // onerror
    socketRef.current.onerror = function(error) {
      console.error('WebSocket error:', error);
    };

    return () => {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (quillRef.current) {
      // Set the initial size of the Quill editor

      quillInstanceRef.current = new Quill(quillRef.current, {
        theme: 'snow',
        modules: {
          toolbar: false, // Disable the toolbar
        },
      });

      enableTextChangeListener();
    }
  }, [quillRef]);

  const getCaretIndex = () => {
    const selection = quillInstanceRef.current.getSelection();
    return selection ? selection.index : null;
  };

  const insertTextAtPosition = (text, index, isBold, isItalic) => {
    disableTextChangeListener();
    quillInstanceRef.current.insertText(index, text, { bold: isBold, italic: isItalic });
    enableTextChangeListener();
  };

  const deleteCharacterAtIndex = (index) => {
    disableTextChangeListener();
    quillInstanceRef.current.deleteText(index, 1);
    enableTextChangeListener();
  };

  const applyBoldToRange = (startIndex, endIndex, isBold) => {
    disableTextChangeListener();
    quillInstanceRef.current.formatText(startIndex, endIndex - startIndex + 1, { bold: isBold });
    enableTextChangeListener();
  };

  // Function to apply or remove italic formatting over a specified range
function applyItalicToRange(startIndex, endIndex, isItalic) {
    disableTextChangeListener();
    quillInstanceRef.current.formatText(startIndex, endIndex - startIndex + 1, { italic: isItalic });
    enableTextChangeListener();
}


  const disableTextChangeListener = () => {
    if (quillInstanceRef.current) {
      quillInstanceRef.current.off('text-change', textChangeHandler);
    }
  };

  const enableTextChangeListener = () => {
    quillInstanceRef.current.on('text-change', textChangeHandler);
  };

  const struct_Rendering = (struct) => {
    for (let i = 0; i < struct.length; i++) {
      const obj = struct[i];
      insertTextAtPosition(obj.value, i, obj.isBold, obj.isItalic);
    }
  };

  const toggleBold = () => {
    const selection = quillInstanceRef.current.getSelection();
    if (selection && selection.length > 0) {
      let isBold = quillInstanceRef.current.getFormat(selection).bold;
      quillInstanceRef.current.format('bold', !isBold);
      isBold = !isBold;
      let end = selection.index + selection.length;
      for (let i = selection.index; i < end; i++) {
        CRDT_Obj.struct[i].isBold = !!isBold;
      }
      let object1 = CRDT_Obj.struct[selection.index];
      let object2 = CRDT_Obj.struct[end - 1];
      object1.isBold = !!object1.isBold;
      object1.isItalic = !!object1.isItalic;
      object2.isBold = !!object2.isBold;
      object2.isItalic = !!object2.isItalic;
      let message = new Message(MessageType.Bolding, Site_Id, Room_Id, object1, object2, false);
      let json = JSON.stringify(message);
      socketRef.current.send(json);
      console.log(`Selection from index ${selection.index} to ${selection.index + selection.length}`);
      console.log(`Operation done: ${isBold ? 'bolding' : 'unbolding'}`);
    }
  };

  const toggleItalic = () => {
    const selection = quillInstanceRef.current.getSelection();
    if (selection && selection.length > 0) {
      let isItalic = quillInstanceRef.current.getFormat(selection).italic;
      quillInstanceRef.current.format('italic', !isItalic);
      isItalic = !isItalic;
      let end = selection.index + selection.length;
      for (let i = selection.index; i < end; i++) {
        CRDT_Obj.struct[i].isItalic = !!isItalic;
      }
      let object1 = CRDT_Obj.struct[selection.index];
      let object2 = CRDT_Obj.struct[end - 1];
      object1.isBold = !!object1.isBold;
      object1.isItalic = !!object1.isItalic;
      object2.isBold = !!object2.isBold;
      object2.isItalic = !!object2.isItalic;
      let message = new Message(MessageType.Italic, Site_Id, Room_Id, object1, object2, true);
      let json = JSON.stringify(message);
      socketRef.current.send(json);
      console.log(`Selection from index ${selection.index} to ${selection.index + selection.length}`);
      console.log(`Operation done: ${isItalic ? 'italicizing' : 'unitalicizing'}`);
    }
  };

  return (
    <div className="text-editor">
      <div className="toolbar">
      <div class="left-buttons">
        <button onClick={toggleBold} disabled={!isEditable}>Bold</button>
        <button onClick={toggleItalic} disabled={!isEditable}>Italic</button>
        </div>
      </div>
      <div ref={quillRef} className="editor" />
    </div>
  );
};

export default Texteditor;