import React from 'react';
import './Verse.css';

export const VerseView = ({ verse, highlight, isSearchHighlight, onSelect, children }) => {
  const highlightClass = highlight ? `${highlight}-highlight` : '';
  const searchClass = isSearchHighlight ? 'search-highlight' : '';
  
  return (
    <div 
      className={`verse ${highlightClass} ${searchClass}`}
      onMouseUp={() => onSelect && onSelect(verse.reference)}
    >
      <span className="verse-number">{verse.verse}</span>
      <span className="verse-text">{verse.text}</span>
      {children}
    </div>
  );
};

export const ChapterView = ({ verses, highlights = {}, searchHighlight, onSelect, notes = {} }) => {
  return (
    <div className="chapter-view">
      {verses && verses.length > 0 && (
        <>
          <h2 className="chapter-title">
            {verses[0]?.book} {verses[0]?.chapter}
          </h2>
          <div className="chapter-content">
            {verses.map(verse => {
              const isSearchHighlight = verse.reference === searchHighlight;
              const highlightClass = highlights[verse.reference];
              
              return (
                <span 
                  key={verse.reference}
                  className={`chapter-verse`}
                >
                  <sup className="verse-number-inline">{verse.verse}</sup>
                  <span
                    className={`verse-text ${highlightClass ? `${highlightClass}-highlight` : ''} ${isSearchHighlight ? 'search-highlight' : ''}`}
                    onMouseUp={() => onSelect && onSelect(verse.reference)}
                  >
                    {verse.text}
                  </span>
                  {notes[verse.reference] && (
                    <span className="note-indicator" title={notes[verse.reference]}>
                      📝
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};