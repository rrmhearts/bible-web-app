import React from 'react';
import { X } from 'lucide-react';
import './Note.css';

const Note = ({ text, onDelete }) => {
  return (
    <div className="note">
      <div className="note-content">
        <p className="note-text">{text}</p>
        <button
          onClick={onDelete}
          className="delete-note"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default Note;