// TextEditor.js
import React, { useRef, useState } from 'react';
import '../styles/TextEditor.css'; // Import CSS file for styling (create this file in the same directory)

const TextEditor = () => {
  const editorRef = useRef(null);
  const [isEditable, setIsEditable] = useState(false); // State starts as non-editable
  const [isEditorAllowed, setIsEditorAllowed] = useState(true); // Simulate getting permission from backend

  const toggleEdit = () => {
    setIsEditable(prev => !prev); // Toggle the state
  };

  const handleBold = () => {
    document.execCommand('bold', false, '');
  };

  const handleItalic = () => {
    document.execCommand('italic', false, '');
  };

  const handlePaste = (e) => {
    e.preventDefault(); // Prevent pasting
  };

  const handleContextMenu = (e) => {
    e.preventDefault(); // Prevent context menu
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Prevent drag over
  };

  const handleKeyDown = (e) => {
    if (!isEditable) {
      e.preventDefault();
      return;
    }
    // Clear selection if there's a selection
    const selection = window.getSelection();
    if (!selection.isCollapsed) {
      selection.removeAllRanges();
    }
    // Disable any Ctrl+ combination
    if (e.ctrlKey) {
      e.preventDefault();
    }
  };

  // Simulate setting isEditorAllowed from a backend request
  // setTimeout(() => {
  //   setIsEditorAllowed(true); // Example of setting isEditorAllowed to true
  // }, 5000);

  return (
    <div className="text-editor">
      <div className="toolbar">

          <button onClick={handleBold}>Bold</button>
          <button onClick={handleItalic}>Italic</button>

          <button onClick={toggleEdit}
            disabled={!isEditorAllowed}>{isEditable ? "Disable Editing" : "Enable Editing"}</button>

      </div>
      <div
        ref={editorRef}
        contentEditable={isEditable}
        className="editor"
        placeholder="Start typing..."
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onContextMenu={handleContextMenu}
        onDragOver={handleDragOver}
      />
    </div>
  );
};

export default TextEditor;