import React from 'react';
import { Book, Split, FileText } from 'lucide-react';
import './Header.css';

const Header = ({
  splitMode,
  viewMode,
  onBibleLoad,
  onPdfLoad,
  onSplitToggle,
  onViewModeChange,
  fileInputRef,
  pdfInputRef
}) => {
  return (
    <div className="header">
      <h1>Bible Study Desktop</h1>
      
      <div className="header-buttons">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="header-button"
        >
          <Book size={18} />
          Load Bible
        </button>
        
        <button
          onClick={onSplitToggle}
          className={`header-button ${splitMode ? 'active' : ''}`}
        >
          <Split size={18} />
          Split View
        </button>
        
        {splitMode && (
          <button
            onClick={() => pdfInputRef.current?.click()}
            className="header-button"
          >
            <FileText size={18} />
            Load PDF
          </button>
        )}
        
        <select
          value={viewMode}
          onChange={(e) => onViewModeChange(e.target.value)}
          className="view-mode-select"
        >
          <option value="chapter">Chapter View</option>
          <option value="verse">Verse View</option>
        </select>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        onChange={onBibleLoad}
        className="hidden"
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf"
        onChange={onPdfLoad}
        className="hidden"
      />
    </div>
  );
};

export default Header;