import React from 'react';
import { Book, FileText } from 'lucide-react';
import './Panel.css';

const EmptyPanel = ({ onLoadBible, onLoadPDF, books }) => {
  return (
    <div className="empty-panel">
      <p>Right panel empty</p>
      <div className="empty-panel-buttons">
        <button
          onClick={() => books.length > 0 && onLoadBible(books[0])}
          className="header-button"
        >
          <Book size={18} />
          Load Bible Passage
        </button>
        <button
          onClick={onLoadPDF}
          className="header-button"
        >
          <FileText size={18} />
          Load PDF
        </button>
      </div>
    </div>
  );
};

export default EmptyPanel;