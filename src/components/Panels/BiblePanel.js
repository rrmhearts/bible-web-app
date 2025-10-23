import React from 'react';
import { ChevronLeft, ChevronRight, X, Highlighter, StickyNote } from 'lucide-react';
import './Panel.css';

const BiblePanel = ({
  panel,
  books,
  currentBook,
  currentChapter,
  splitMode,
  onBookChange,
  onChapterChange,
  onNavigate,
  onClose,
  selectedText,
  onHighlight,
  onRemoveHighlight,
  onAddNote,
  renderContent
}) => {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-navigation">
          <select
            value={currentBook}
            onChange={(e) => onBookChange(e.target.value)}
            className="panel-select"
          >
            {books.map(book => (
              <option key={book} value={book}>{book}</option>
            ))}
          </select>
          
          <button
            onClick={() => onNavigate('prev')}
            className="nav-button"
          >
            <ChevronLeft size={20} />
          </button>
          
          <input
            type="number"
            value={currentChapter}
            onChange={(e) => onChapterChange(parseInt(e.target.value) || 1)}
            className="chapter-input"
            min="1"
          />
          
          <button
            onClick={() => onNavigate('next')}
            className="nav-button"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        
        {selectedText?.panel === panel && selectedText?.text && (
          <div className="highlight-tools">
            <button
              onClick={() => onHighlight('yellow')}
              className="highlight-button"
              style={{ backgroundColor: '#fef08a' }}
              title="Yellow Highlight"
            >
              <Highlighter size={16} />
            </button>
            <button
              onClick={() => onHighlight('green')}
              className="highlight-button"
              style={{ backgroundColor: '#bbf7d0' }}
              title="Green Highlight"
            >
              <Highlighter size={16} />
            </button>
            <button
              onClick={() => onHighlight('blue')}
              className="highlight-button"
              style={{ backgroundColor: '#bfdbfe' }}
              title="Blue Highlight"
            >
              <Highlighter size={16} />
            </button>
            <button
              onClick={() => onHighlight('pink')}
              className="highlight-button"
              style={{ backgroundColor: '#fbcfe8' }}
              title="Pink Highlight"
            >
              <Highlighter size={16} />
            </button>
            <button
              onClick={() => onRemoveHighlight(selectedText.verseRef)}
              className="highlight-button"
              style={{ backgroundColor: '#e5e7eb' }}
              title="Remove Highlight"
            >
              <X size={16} />
            </button>
            <button
              onClick={onAddNote}
              className="highlight-button"
              style={{ backgroundColor: '#fde68a' }}
              title="Add Note"
            >
              <StickyNote size={16} />
            </button>
          </div>
        )}

        {panel === 'right' && (
          <button
            onClick={onClose}
            className="nav-button"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      <div className="panel-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default BiblePanel;