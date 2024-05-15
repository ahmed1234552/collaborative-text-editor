import React, { useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import the default theme

import Char from "../../crdt/Char.js";
import InsertionResult from "../../crdt/InsertionResult.js";
import Identifier from "../../crdt/Identifier.js";
import MessageType from "../../crdt/MessageType.js";
import Message from "../../crdt/Message.js";
import Message_Json from "../../crdt/Message_json.js";
import CRDT from "../../crdt/CRDT.js";



const QuillEditor = () => {
  const editorRef = useRef(null);
  const [editorValue, setEditorValue] = useState("");

  const handleChange = (value) => {
    setEditorValue(value);
  };

  //  objects
  let Room_Id = 1;
  let Site_Id = generateUniqueInteger();
  let CRDT_Obj = new CRDT(Site_Id);

  // Create a new WebSocket instance
  const socket = new WebSocket("ws://localhost:8081/websocket");

  // Event handlers for WebSocket events
  socket.onopen = function () {
    let message = new Message(MessageType.ConnectionOpening, Site_Id, Room_Id);
    let json = JSON.stringify(message);
    socket.send(json);
    console.log("WebSocket connection established.");
    // Sending data to the server
  };

  socket.onmessage = function (event) {
    console.log("Message received from server:", event.data);
    const jsonData = JSON.parse(event.data);
    // converting data
    const type = jsonData.hasOwnProperty("type") ? jsonData["type"] : null;

    const Site_ID = jsonData.hasOwnProperty("Site_ID")
      ? jsonData["Site_ID"]
      : null;

    const Room_ID = jsonData.hasOwnProperty("Room_ID")
      ? jsonData["Room_ID"]
      : null;

    const character = jsonData.hasOwnProperty("character")
      ? jsonData["character"]
      : null;

    const struct = jsonData.hasOwnProperty("struct")
      ? jsonData["struct"]
      : null;

    const startBold = jsonData.hasOwnProperty("startBold")
      ? jsonData["startBold"]
      : null;

    const endBold = jsonData.hasOwnProperty("endBold")
      ? jsonData["endBold"]
      : null;

    const startItalic = jsonData.hasOwnProperty("startItalic")
      ? jsonData["startItalic"]
      : null;

    const endItalic = jsonData.hasOwnProperty("endItalic")
      ? jsonData["endItalic"]
      : null;

    // Use Data as Object

    const messageObject = new Message_Json(
      type,
      Site_ID,
      Room_ID,
      character,
      struct,
      startBold,
      endBold,
      startItalic,
      endItalic
    );

    switch (messageObject.getType()) {
      case MessageType.ConnectionOpening:
        CRDT_Obj.struct = messageObject.getStruct();
        struct_Rendering(CRDT_Obj.struct);
        break;
      case MessageType.Inserting:
        console.log("inserted :");
        console.log(messageObject.getCharacter());
        let object = CRDT_Obj.handleRemoteInsert(messageObject.getCharacter());
        insertTextAtPosition(
          object.getValue(),
          object.getIndex(),
          object.getisBold(),
          object.getisItalic()
        );
        break;
      case MessageType.Deleting:
        let index = CRDT_Obj.handleRemoteDelete(messageObject.getCharacter());
        deleteCharacterAtIndex(index);
        break;
      case MessageType.Bolding:
        console.log(messageObject);
        let startBold = CRDT_Obj.findIndexByPosition(
          messageObject.getStartBold()
        );

        let endBold = CRDT_Obj.findIndexByPosition(messageObject.getEndBold());

        let isBold = messageObject.getStartBold().isBold;

        for (let i = startBold; i <= endBold; i++) {
          CRDT_Obj.struct[i].isBold = !!isBold;
        }
        console.log("bolding done");
        console.log(CRDT_Obj.struct);

        applyBoldToRange(startBold, endBold, isBold);

        break;
      case MessageType.Italic:
        console.log(messageObject);

        let startItalic = CRDT_Obj.findIndexByPosition(
          messageObject.getStartItalic()
        );

        let endItalic = CRDT_Obj.findIndexByPosition(
          messageObject.getEndItalic()
        );

        let isItalic = messageObject.getStartItalic().isItalic;

        for (let i = startItalic; i <= endItalic; i++) {
          CRDT_Obj.struct[i].isItalic = !!isItalic;
        }

        console.log("itlaic done");
        console.log(CRDT_Obj.struct);

        applyItalicToRange(startItalic, endItalic, isItalic);

        break;
      default:
    }
  };

  // close Socket
  socket.onclose = function (event) {
    console.log("WebSocket connection closed:", event);
  };

  // onerror
  socket.onerror = function (error) {
    console.error("WebSocket error:", error);
  };

  // Initialize Quill editor without toolbar
  const quill = new Quill("#editor-container", {
    theme: "snow",
    modules: {
      toolbar: false, // explicitly setting toolbar to false removes it
    },
  });

  // Function to get current caret index
  function getCaretIndex() {
    const selection = quill.getSelection();
    return selection ? selection.index : null;
  }

  // Function to insert text at a specific index with optional bold formatting
  function insertTextAtPosition(text, index, isBold, isItalic) {
    disableTextChangeListener();
    console.log("asd1");
    console.log(text);
    console.log(index);
    console.log("asd2");
    quill.insertText(index, text, { bold: isBold, italic: isItalic });
    enableTextChangeListener();
  }

  // Function to delete character at a specific index
  function deleteCharacterAtIndex(index) {
    disableTextChangeListener();
    quill.deleteText(index, 1);
    enableTextChangeListener();
  }

  // Function to apply bolding to range

  function applyBoldToRange(startIndex, endIndex, isBold) {
    disableTextChangeListener();
    quill.formatText(startIndex, endIndex - startIndex + 1, { bold: isBold });
    enableTextChangeListener();
  }

  // Function to apply or remove italic formatting over a specified range
  function applyItalicToRange(startIndex, endIndex, isItalic) {
    disableTextChangeListener();
    quill.formatText(startIndex, endIndex - startIndex + 1, {
      italic: isItalic,
    });
    enableTextChangeListener();
  }

  // Function to disable text change listener
  let textChangeHandler;
  function disableTextChangeListener() {
    quill.off("text-change", textChangeHandler);
  }

  // Function to enable text change listener
  function enableTextChangeListener() {
    textChangeHandler = function (delta, oldDelta, source) {
      delta.ops.forEach((op) => {
        if (op.insert) {
          // Local Insertion
          let index = getCaretIndex() - op.insert.length;
          let isBold = quill.getFormat(index).bold;
          if (op.insert === "\n") {
            index = index + 1;
          }

          let isItalic = quill.getFormat(index).italic;

          const insertedChar = op.insert;

          let object = CRDT_Obj.localInsert(
            insertedChar,
            index,
            !!isBold,
            !!isItalic
          );

          let message = new Message(
            MessageType.Inserting,
            Site_Id,
            Room_Id,
            object
          );

          let json = JSON.stringify(message);

          socket.send(json);

          console.log(`Inserted '${op.insert}' at index ${index}`);
        } else if (op.delete) {
          // Local Deletion
          const index = getCaretIndex();

          let object = CRDT_Obj.handleLocalDelete(index);

          object.isBold = !!object.isBold;
          object.isItalic = !!object.isItalic;

          let message = new Message(
            MessageType.Deleting,
            Site_Id,
            Room_Id,
            object
          );
          let json = JSON.stringify(message);

          console.log(`deletionn ${json}`);
          socket.send(json);
          console.log(`Deleted character at index ${index}`);
        }
      });
    };
    quill.on("text-change", textChangeHandler);
  }

  // Initial setup: enable the text change listener
  enableTextChangeListener();

  // Add event listeners for the toggleBold button
  document.getElementById("toggleBold").addEventListener("click", function () {
    const selection = quill.getSelection();
    if (selection && selection.length > 0) {
      let isBold = quill.getFormat(selection).bold;
      quill.format("bold", !isBold);

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

      let message = new Message(
        MessageType.Bolding,
        Site_Id,
        Room_Id,
        object1,
        object2,
        false
      );

      let json = JSON.stringify(message);

      socket.send(json);

      console.log(
        `Selection from index ${selection.index} to ${
          selection.index + selection.length
        }`
      );
      console.log(`Operation done: ${isBold ? "bolding" : "unbolding"}`);
    }
  });

  // Add event listeners for the toggleItalic button

  document
    .getElementById("toggleItalic")
    .addEventListener("click", function () {
      const selection = quill.getSelection();
      if (selection && selection.length > 0) {
        let isItalic = quill.getFormat(selection).italic;
        quill.format("italic", !isItalic);

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

        let message = new Message(
          MessageType.Italic,
          Site_Id,
          Room_Id,
          object1,
          object2,
          true
        );

        let json = JSON.stringify(message);

        socket.send(json);

        console.log(
          `Selection from index ${selection.index} to ${
            selection.index + selection.length
          }`
        );
        console.log(
          `Operation done: ${isItalic ? "italicizing" : "unitalicizing"}`
        );
      }
    });

  // Render the whole document at the openning

  function struct_Rendering(struct) {
    for (let i = 0; i < struct.length; i++) {
      const obj = struct[i];
      insertTextAtPosition(obj.value, i, obj.isBold, obj.isItalic);
    }
  }

  // to generate unique integer for siteID
  function generateUniqueInteger() {
    // Use Date.now() to get the current timestamp
    var timestamp = Date.now();

    // Generate a random number between 0 and 9999 to add some randomness
    var random = Math.floor(Math.random() * 10000);

    // Concatenate the timestamp and random number to create a unique integer
    var uniqueInteger = timestamp.toString() + random.toString();

    return parseInt(uniqueInteger);
  }

  return (
    <div id="editor-container">
      <ReactQuill
        ref={editorRef}
        value={editorValue}
        onChange={handleChange}
        modules={{
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            ["clean"], // Optional, to clear formatting
          ],
        }}
        theme="snow" // Specify the default theme
      />
      <button onClick={() => editorRef.current?.bold?.toggle()}>
        Toggle Bold
      </button>
      <button onClick={() => editorRef.current?.italic?.toggle()}>
        Toggle Italic
      </button>
    </div>
  );
};

export default QuillEditor;
