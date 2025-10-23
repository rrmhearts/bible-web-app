import React from 'react';
import { Search } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({
  searchQuery,
  searchResults,
  books,
  currentBook,
  onSearch,
  onSearchChange,
  onBookSelect,
  onSearchResultClick
}) => {
  return (
    <div className="sidebar">
      <div className="search-container">
        <div className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Search Bible..."
            className="search-input"
          />
          <button
            onClick={onSearch}
            className="search-button"
          >
            <Search size={18} />
          </button>
        </div>
      </div>
      
      <div className="sidebar-content">
        {searchResults.length > 0 ? (
          <>
            <h3 className="content-title">
              Search Results ({searchResults.length})
            </h3>
            {searchResults.map(verse => (
              <button
                key={verse.reference}
                onClick={() => onSearchResultClick(verse)}
                className="search-result"
              >
                <div className="search-result-reference">
                  {verse.reference}
                </div>
                <div className="search-result-text">
                  {verse.text}
                </div>
              </button>
            ))}
          </>
        ) : (
          <>
            <h3 className="content-title">Books</h3>
            {books.map(book => (
              <button
                key={book}
                onClick={() => onBookSelect(book)}
                className={`book-button ${currentBook === book ? 'active' : ''}`}
              >
                {book}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;