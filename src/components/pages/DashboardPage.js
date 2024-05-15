import React, { useState, useEffect } from "react";
import "../styles/dashboard.css"; // Import CSS file
import Modal from "./Modal"; // Import Modal component
import axios from "axios";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const navigate = useNavigate();

  // State to store the user's documents
  const [myDocuments, setMyDocuments] = useState([]);
  // State to store the documents the user is invited to
  const [invitedDocuments, setInvitedDocuments] = useState([]);

  // the document has the following fields:  title, permissionType, ownerId, docId
  //enum PermissionType {
  //     VIEW,
  //     EDIT,
  //     OWNER
  // }
  //the user document has permissionType owner while the invited document has permissionType view or edit

  // function to set the user documents and the invited documents
  const setDocuments = async () => {
    try {
      const response = await axios.get("http://localhost:8082/api/documents");
      console.log("Documents fetched successfully:", response.data);
      // Set the user's documents
      setMyDocuments(
        response.data.filter((doc) => doc.permissionType === "OWNER")
      );
      // Set the invited documents
      setInvitedDocuments(
        response.data.filter((doc) => doc.permissionType !== "OWNER")
      );
    } catch (error) {
      console.error("Error fetching documents:", error);
      // Handle error appropriately, e.g., show an error message to the user
    }
  };

  useEffect(() => {
    setDocuments(); // Call setDocuments function within useEffect to fetch data on component mount
  }, []); // Empty dependency array to fetch data only once on component mount

  const [myPage, setMyPage] = useState(1);
  const [invitedPage, setInvitedPage] = useState(1);
  // const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const documentsPerPage = 3;

  const handleOpenDocument = (document) => {
    // Implement logic to open the document
    console.log(`Opening document: ${document.name} with ID ${document.docId}`);
    // For now, just log the document name to the console

    navigate(`/text-editor/${document.docId}`);
  };

  const handleRenameDocument = async () => {
    // Implement logic to rename the document
    try {
      const response = await axios.put(
        `http://localhost:8082/api/documents/${renameDocument.docId}`,
        {
          title: newDocumentName,
        }
      );
      console.log("Document renamed successfully:", response.data);
      // Handle success appropriately, e.g., show a success message to the user

      setNewDocumentName("");
    } catch (error) {
      console.error("Error renaming document:", error);
      // Handle error appropriately, e.g., show an error message to the user
    }
    setDocuments();
  };

  const [shareDocument, setShareDocument] = useState(null); // State to store the document being shared
  const [modalOpen, setModalOpen] = useState(false); // State to control the visibility of the share modal dialog
  const [renameDocument, setRenameDocument] = useState(null); // State to store the document being renamed
  const [modalOpenRename, setModalOpenRename] = useState(false); // State to control the visibility of the rename modal dialog
  const [selectedRecipient, setSelectedRecipient] = useState(""); // State to store the selected recipient
  const [recipientCanEdit, setRecipientCanEdit] = useState(false); // State to store whether the recipient can edit the document
  const [documentName, setDocumentName] = useState(""); // State to store the name of the new document
  const [newDocumentName, setNewDocumentName] = useState(""); // State to store the new document name
  const [modalOpen2, setModalOpen2] = useState(false); // State to control the visibility of the modal dialog

  const handleShareDocument = (document) => {
    // Set the document being shared
    setShareDocument(document);
    // Open the share modal dialog
    setModalOpen(true);
  };

  const handleRename = (document) => {
    // Set the document being renamed
    setRenameDocument(document);

    // Open the rename modal dialog
    setModalOpenRename(true);
  };

  const handleShare = async () => {
    // Implement logic to share the document with the selected recipient
    // if recipientCanEdit so permissionType will be EDIT else VIEW
    let sharePermission = "VIEW";
    if (recipientCanEdit) {
      sharePermission = "EDIT";
    }
    setModalOpen(false);
    console.log(
      `Sharing document ${shareDocument.title} with id ${shareDocument.docId} with ${selectedRecipient} (Can Edit: ${recipientCanEdit})`
    );
    try {
      // Make a POST request to share the document with the selected recipient
      const response = await axios.post(
        `http://localhost:8082/api/document/${shareDocument.docId}/share`,
        {
          userEmail: selectedRecipient,
          permissionType: sharePermission,
        }
      );

      // Log the response or handle it as needed
      console.log("Share document response:", response.data);

      // Close the share modal dialog if sharing is successful
      setModalOpen(false);
    } catch (error) {
      console.error("Error sharing document:", error);
      // Handle error appropriately, e.g., show an error message to the user
    }
  };

  const handleDeleteDocument = async (document) => {
    console.log("Deleting document:", document.docId);
    // Implement logic to delete the document
    try {
      // Make a DELETE request to delete the document
      const response = await axios.delete(
        `http://localhost:8082/api/documents/${document.docId}`
      );
      console.log("Document deleted successfully:", response.data);
      // Remove the deleted document from the list
      // const updatedDocuments = myDocuments.filter(
      //   (doc) => doc.id !== document.id
      // );
      // setMyDocuments(updatedDocuments);

      setDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      // Handle error appropriately, e.g., show an error message to the user
    }
  };

  const handleNext = (type) => {
    if (type === "my") {
      setMyPage(myPage + 1);
    } else {
      setInvitedPage(invitedPage + 1);
    }
  };

  const handlePrevious = (type) => {
    if (type === "my") {
      setMyPage(myPage - 1);
    } else {
      setInvitedPage(invitedPage - 1);
    }
  };

  const handleCreateDocument = async () => {
    console.log("Creating document:", documentName);
    try {
      // Make a POST request to create a new document
      const response = await axios.post("http://localhost:8082/api/documents", {
        title: documentName,
        // Add any other required fields for the new document
      });

      // Update the document list with the newly created document
      console.log(response.data);
      // setMyDocuments([...myDocuments, response.data]);

      setDocuments();

      // Close the create document modal dialog
      setModalOpen2(false);

      // Reset the document name input field
      setDocumentName("");
      navigate("/text-editor/" + response.data.docId);
    } catch (error) {
      console.error("Error creating document:", error);
    }
  };

  return (
    <div className="all">
      <div
        className={`container ${
          modalOpen || modalOpenRename ? "blur-background" : ""
        }`}
      >
        <h2>Dashboard</h2>
        <div>
          <h3>My Documents</h3>
          {/* My Documents section */}
          <ul>
            {/* Map through my documents */}
            {myDocuments
              .slice((myPage - 1) * documentsPerPage, myPage * documentsPerPage)
              .map((document) => (
                <li key={document.docId}>
                  <span onClick={() => handleOpenDocument(document)}>
                    {document.title}
                  </span>
                  <div className="button-container">
                    <button onClick={() => handleRename(document)}>
                      Rename
                    </button>
                    <button onClick={() => handleDeleteDocument(document)}>
                      Delete
                    </button>
                    <button onClick={() => handleShareDocument(document)}>
                      Share
                    </button>
                  </div>
                </li>
              ))}
          </ul>
          <div className="pagination-container">
            <button
              onClick={() => handlePrevious("my")}
              disabled={myPage === 1}
            >
              Previous
            </button>
            <button
              onClick={() => handleNext("my")}
              disabled={myDocuments.length <= myPage * documentsPerPage}
            >
              Next
            </button>
          </div>
        </div>
        {/* Invited Documents section */}
        <div>
          <h3>Shared Documents</h3>
          <ul>
            {/* Map through invited documents */}
            {invitedDocuments
              .slice(
                (invitedPage - 1) * documentsPerPage,
                invitedPage * documentsPerPage
              )
              .map((document) => (
                <li key={document.docId}>
                  <span onClick={() => handleOpenDocument(document)}>
                    {document.title}
                  </span>
                </li>
              ))}
          </ul>
          <div className="pagination-container">
            <button
              onClick={() => handlePrevious("invited")}
              disabled={invitedPage === 1}
            >
              Previous
            </button>
            <button
              onClick={() => handleNext("invited")}
              disabled={
                invitedDocuments.length <= invitedPage * documentsPerPage
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {/* Share Document Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="modal-content">
          <h3 className="modal-title">Share Document</h3>
          <div className="input-group">
            <label htmlFor="recipient" className="input-label">
              Recipient:
            </label>
            <input
              type="text"
              id="recipient"
              className="input-field"
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={recipientCanEdit}
                onChange={(e) => setRecipientCanEdit(e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              Can Edit
            </label>
          </div>
          <button className="share-button" onClick={handleShare}>
            Share
          </button>
        </div>
      </Modal>
      {/* Rename Document Modal */}
      <Modal isOpen={modalOpenRename} onClose={() => setModalOpenRename(false)}>
        <div className="modal-content">
          <h3 className="modal-title">Rename Document</h3>
          <div className="input-group">
            <label htmlFor="newName" className="input-label">
              New Name:
            </label>
            <input
              type="text"
              id="newName"
              className="input-field"
              // Here you should bind the input value to some state
              // and update it when the user types
              // value={??}
              // onChange={(e) => ??}
              value={newDocumentName} // Bind value to newDocumentName state
              onChange={(event) => setNewDocumentName(event.target.value)} // Call handleNewDocumentNameChange on change
            />
          </div>
          <button
            className="rename-button"
            onClick={() => {
              handleRenameDocument();
              setModalOpenRename(false);
            }}
          >
            Rename
          </button>
        </div>
      </Modal>
      <button className="create-button" onClick={() => setModalOpen2(true)}>Create Document</button>
      {/* Create Document Modal */}
      <Modal isOpen={modalOpen2} onClose={() => setModalOpen2(false)}>
        <div className="modal-content">
          <h3 className="modal-title">Create Document</h3>
          <div className="input-group">
            <label htmlFor="documentName" className="input-label">
              Document Name:
            </label>
            <input
              type="text"
              id="documentName"
              className="input-field"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />
          </div>
          <button
            className="create-document-button"
            onClick={handleCreateDocument}
          >
            Create
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default DashboardPage;
