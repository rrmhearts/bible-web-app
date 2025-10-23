import React from 'react';
import './Dialog.css';

const NoteDialog = ({
  isOpen,
  verseRef,
  note,
  onNoteChange,
  onSave,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h3 className="dialog-title">Add Note - {verseRef}</h3>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          className="dialog-textarea"
          placeholder="Enter your note here..."
        />
        <div className="dialog-buttons">
          <button
            onClick={onSave}
            className="dialog-button dialog-button-primary"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="dialog-button dialog-button-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteDialog;