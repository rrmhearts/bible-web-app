import React, { useState, useEffect, useRef } from 'react';
import { Search, Book, FileText, Split, X, Plus, Highlighter, StickyNote, ChevronLeft, ChevronRight } from 'lucide-react';

const BibleStudyApp = () => {
  const [bibleData, setBibleData] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [leftPanel, setLeftPanel] = useState({ type: 'bible', content: null, book: '', chapter: 1 });
  const [rightPanel, setRightPanel] = useState({ type: null, content: null, book: '', chapter: 1 });
  const [splitMode, setSplitMode] = useState(false);
  const [highlights, setHighlights] = useState({});
  const [notes, setNotes] = useState({});
  const [viewMode, setViewMode] = useState('chapter');
  const [selectedText, setSelectedText] = useState({ panel: null, text: '', verseRef: '' });
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [searchHighlight, setSearchHighlight] = useState(null);
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const verseRefs = useRef({});

  // Load saved data from storage
  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const highlightsResult = await window.storage.get('bible-highlights');
      const notesResult = await window.storage.get('bible-notes');
      
      if (highlightsResult) setHighlights(JSON.parse(highlightsResult.value));
      if (notesResult) setNotes(JSON.parse(notesResult.value));
    } catch (error) {
      console.log('No stored data found or error loading:', error);
    }
  };

  // Save highlights
  useEffect(() => {
    if (Object.keys(highlights).length > 0) {
      window.storage.set('bible-highlights', JSON.stringify(highlights)).catch(console.error);
    }
  }, [highlights]);

  // Save notes
  useEffect(() => {
    if (Object.keys(notes).length > 0) {
      window.storage.set('bible-notes', JSON.stringify(notes)).catch(console.error);
    }
  }, [notes]);

  // Parse Bible file
  const handleBibleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const content = text;
      const lines = content.split('\n').filter(line => line.trim());
      
      // Skip header lines (translation info)
      const verses = lines.slice(2).map(line => {
        const [reference, ...textParts] = line.split('\t');
        const text = textParts.join('\t').trim();
        
        // Parse reference: "Genesis 1:1"
        const match = reference.match(/^(.+?)\s+(\d+):(\d+)$/);
        if (match) {
          return {
            book: match[1],
            chapter: parseInt(match[2]),
            verse: parseInt(match[3]),
            reference,
            text
          };
        }
        return null;
      }).filter(v => v);

      setBibleData(verses);
      
      // Extract unique books
      const uniqueBooks = [...new Set(verses.map(v => v.book))];
      setBooks(uniqueBooks);
      
      if (uniqueBooks.length > 0) {
        setLeftPanel({ ...leftPanel, book: uniqueBooks[0], chapter: 1 });
      }
    } catch (error) {
      console.error('Error loading Bible:', error);
      alert('Error loading Bible file. Please ensure it follows the format: Reference[TAB]Text');
    }
  };

  // Handle PDF upload
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setRightPanel({ type: 'pdf', content: url, book: '', chapter: 0 });
    setSplitMode(true);
  };

  // Search functionality
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = bibleData.filter(verse => 
      verse.text.toLowerCase().includes(query)
    ).slice(0, 100); // Limit to 100 results

    setSearchResults(results);
  };

  // Get verses for a chapter
  const getChapterVerses = (book, chapter) => {
    return bibleData.filter(v => v.book === book && v.chapter === chapter);
  };

  // Navigate chapters
  const navigateChapter = (panel, direction) => {
    const currentPanel = panel === 'left' ? leftPanel : rightPanel;
    const verses = bibleData.filter(v => v.book === currentPanel.book);
    const chapters = [...new Set(verses.map(v => v.chapter))].sort((a, b) => a - b);
    const currentIndex = chapters.indexOf(currentPanel.chapter);
    
    let newChapter = currentPanel.chapter;
    if (direction === 'prev' && currentIndex > 0) {
      newChapter = chapters[currentIndex - 1];
    } else if (direction === 'next' && currentIndex < chapters.length - 1) {
      newChapter = chapters[currentIndex + 1];
    }
    
    if (panel === 'left') {
      setLeftPanel({ ...leftPanel, chapter: newChapter });
    } else {
      setRightPanel({ ...rightPanel, chapter: newChapter });
    }
  };

  // Handle text selection for highlighting
  const handleTextSelection = (panel, verseRef) => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text) {
      setSelectedText({ panel, text, verseRef });
    }
  };

  // Add highlight
  const addHighlight = (color) => {
    if (!selectedText.verseRef) return;
    
    setHighlights(prev => ({
      ...prev,
      [selectedText.verseRef]: color
    }));
    
    setSelectedText({ panel: null, text: '', verseRef: '' });
  };

  // Remove highlight
  const removeHighlight = (verseRef) => {
    setHighlights(prev => {
      const newHighlights = { ...prev };
      delete newHighlights[verseRef];
      return newHighlights;
    });
  };

  // Add/edit note
  const saveNote = () => {
    if (!selectedText.verseRef) return;
    
    setNotes(prev => ({
      ...prev,
      [selectedText.verseRef]: currentNote
    }));
    
    setShowNoteDialog(false);
    setCurrentNote('');
    setSelectedText({ panel: null, text: '', verseRef: '' });
  };

  // Delete note
  const deleteNote = (verseRef) => {
    setNotes(prev => {
      const newNotes = { ...prev };
      delete newNotes[verseRef];
      return newNotes;
    });
  };

  // Render verse with highlighting
  const renderVerse = (verse, panel) => {
    const hasHighlight = highlights[verse.reference];
    const hasNote = notes[verse.reference];
    const isSearchHighlight = searchHighlight === verse.reference;
    
    const highlightStyle = {
      yellow: { backgroundColor: '#fef08a' },
      green: { backgroundColor: '#bbf7d0' },
      blue: { backgroundColor: '#bfdbfe' },
      pink: { backgroundColor: '#fbcfe8' }
    };

    return (
      <div
        key={verse.reference}
        ref={(el) => {
          if (el) verseRefs.current[verse.reference] = el;
        }}
        style={{
          marginBottom: '8px',
          padding: '8px',
          borderRadius: '4px',
          transition: 'background-color 0.3s ease',
          ...(isSearchHighlight ? { backgroundColor: '#fef3c7', boxShadow: '0 0 0 3px #fbbf24' } : {}),
          ...(hasHighlight && !isSearchHighlight ? highlightStyle[hasHighlight] : {})
        }}
        onMouseUp={() => handleTextSelection(panel, verse.reference)}
      >
        <span style={{ fontWeight: '600', color: '#1d4ed8' }}>{verse.verse}</span>
        <span style={{ marginLeft: '8px' }}>{verse.text}</span>
        {hasNote && (
          <div style={{
            marginTop: '4px',
            padding: '8px',
            backgroundColor: '#fffbeb',
            borderLeft: '4px solid #f59e0b',
            fontSize: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <p style={{ color: '#374151' }}>{notes[verse.reference]}</p>
              <button
                onClick={() => deleteNote(verse.reference)}
                style={{
                  color: '#ef4444',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  marginLeft: '8px'
                }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render panel content
  const renderPanelContent = (panel) => {
    const panelData = panel === 'left' ? leftPanel : rightPanel;
    
    if (panelData.type === 'pdf') {
      return (
        <iframe
          src={panelData.content}
          style={{ width: '100%', height: '100%', border: 0 }}
          title="PDF Viewer"
        />
      );
    }
    
    if (panelData.type === 'bible' && panelData.book) {
      const verses = getChapterVerses(panelData.book, panelData.chapter);
      
      if (viewMode === 'verse') {
        return (
          <div>
            {verses.map(v => renderVerse(v, panel))}
          </div>
        );
      } else {
        // Chapter mode - continuous text
        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
              {panelData.book} {panelData.chapter}
            </h2>
            <div style={{ lineHeight: '1.8' }}>
              {verses.map(v => {
                const isSearchHighlight = searchHighlight === v.reference;
                return (
                  <span 
                    key={v.reference}
                    ref={(el) => {
                      if (el) verseRefs.current[v.reference] = el;
                    }}
                    style={{
                      display: 'inline',
                      transition: 'all 0.3s ease',
                      ...(isSearchHighlight ? {
                        backgroundColor: '#fef3c7',
                        boxShadow: '0 0 0 3px #fbbf24',
                        padding: '2px 4px',
                        borderRadius: '4px'
                      } : {})
                    }}
                  >
                  <sup style={{ color: '#2563eb', fontWeight: '600' }}>{v.verse}</sup>
                  <span
                      style={{
                        ...(highlights[v.reference] && !isSearchHighlight ? 
                      { backgroundColor: highlights[v.reference] === 'yellow' ? '#fef08a' :
                                        highlights[v.reference] === 'green' ? '#bbf7d0' :
                                            highlights[v.reference] === 'blue' ? '#bfdbfe' : '#fbcfe8' } : {})
                      }}
                    onMouseUp={() => handleTextSelection(panel, v.reference)}
                  >
                    {v.text}
                  </span>{' '}
                  {notes[v.reference] && (
                    <span style={{ display: 'inline-block' }}>
                      <span style={{ color: '#d97706' }} title={notes[v.reference]}>📝</span>
                    </span>
                  )}
                </span>
                );
              })}
            </div>
          </div>
        );
      }
    }
    
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
        <p>No content loaded</p>
      </div>
    );
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6' }}>
      <div style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Bible Study Desktop</h1>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              backgroundColor: '#1e40af',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Book size={18} />
            Load Bible
          </button>
          
          <button
            onClick={() => setSplitMode(!splitMode)}
            style={{
              backgroundColor: splitMode ? '#16a34a' : '#1e40af',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Split size={18} />
            Split View
          </button>
          
          {splitMode && (
            <button
              onClick={() => pdfInputRef.current?.click()}
              style={{
                backgroundColor: '#1e40af',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FileText size={18} />
              Load PDF
            </button>
          )}
          
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            style={{
              backgroundColor: '#1e40af',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="chapter">Chapter View</option>
            <option value="verse">Verse View</option>
          </select>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={handleBibleUpload}
          style={{ display: 'none' }}
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf"
          onChange={handlePdfUpload}
          style={{ display: 'none' }}
        />
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: '256px', backgroundColor: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search Bible..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px'
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Search size={18} />
              </button>
            </div>
          </div>
          
          {/* Search Results / Book Selection */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {searchResults.length > 0 ? (
              <div style={{ padding: '8px' }}>
                <h3 style={{ fontWeight: '600', marginBottom: '8px', padding: '0 8px' }}>
                  Search Results ({searchResults.length})
                </h3>
                {searchResults.map(verse => (
                  <button
                    key={verse.reference}
                    onClick={() => {
                      setLeftPanel({ type: 'bible', book: verse.book, chapter: verse.chapter });
                      setSearchHighlight(verse.reference);
                      setSearchResults([]);
                      setSearchQuery('');
                      
                      // Scroll to verse after a short delay to allow rendering
                      setTimeout(() => {
                        const element = verseRefs.current[verse.reference];
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }, 100);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginBottom: '4px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#1d4ed8' }}>
                      {verse.reference}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {verse.text}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ padding: '8px' }}>
                <h3 style={{ fontWeight: '600', marginBottom: '8px', padding: '0 8px' }}>Books</h3>
                {books.map(book => (
                  <button
                    key={book}
                    onClick={() => setLeftPanel({ ...leftPanel, type: 'bible', book, chapter: 1 })}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      border: 'none',
                      backgroundColor: leftPanel.book === book ? '#dbeafe' : 'transparent',
                      color: leftPanel.book === book ? '#1e40af' : 'inherit',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginBottom: '4px'
                    }}
                    onMouseOver={(e) => {
                      if (leftPanel.book !== book) e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseOut={(e) => {
                      if (leftPanel.book !== book) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {book}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex' }}>
          <div style={{ width: splitMode ? '50%' : '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
            {leftPanel.book && (
              <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <select
                    value={leftPanel.book}
                    onChange={(e) => {
                      setLeftPanel({ ...leftPanel, book: e.target.value, chapter: 1 });
                      setSearchHighlight(null);
                    }}
                    style={{
                      padding: '4px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  >
                    {books.map(book => (
                      <option key={book} value={book}>{book}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => navigateChapter('left', 'prev')}
                    style={{
                      padding: '4px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <input
                    type="number"
                    value={leftPanel.chapter}
                    onChange={(e) => {
                      setLeftPanel({ ...leftPanel, chapter: parseInt(e.target.value) || 1 });
                      setSearchHighlight(null);
                    }}
                    style={{
                      width: '64px',
                      padding: '4px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}
                    min="1"
                  />
                  
                  <button
                    onClick={() => navigateChapter('left', 'next')}
                    style={{
                      padding: '4px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                {selectedText.panel === 'left' && selectedText.text && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => addHighlight('yellow')}
                      style={{
                        padding: '8px',
                        backgroundColor: '#fef08a',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title="Yellow Highlight"
                    >
                      <Highlighter size={16} />
                    </button>
                    <button
                      onClick={() => addHighlight('green')}
                      style={{
                        padding: '8px',
                        backgroundColor: '#bbf7d0',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title="Green Highlight"
                    >
                      <Highlighter size={16} />
                    </button>
                    <button
                      onClick={() => addHighlight('blue')}
                      style={{
                        padding: '8px',
                        backgroundColor: '#bfdbfe',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title="Blue Highlight"
                    >
                      <Highlighter size={16} />
                    </button>
                    <button
                      onClick={() => addHighlight('pink')}
                      style={{
                        padding: '8px',
                        backgroundColor: '#fbcfe8',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title="Pink Highlight"
                    >
                      <Highlighter size={16} />
                    </button>
                    <button
                      onClick={() => removeHighlight(selectedText.verseRef)}
                      style={{
                        padding: '8px',
                        backgroundColor: '#e5e7eb',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title="Remove Highlight"
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentNote(notes[selectedText.verseRef] || '');
                        setShowNoteDialog(true);
                      }}
                      style={{
                        padding: '8px',
                        backgroundColor: '#fde68a',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      title="Add Note"
                    >
                      <StickyNote size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {renderPanelContent('left')}
            </div>
          </div>

          {/* Right Panel */}
          {splitMode && (
            <div style={{ width: '50%', display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderLeft: '1px solid #e5e7eb' }}>
              {rightPanel.type === 'bible' && rightPanel.book && (
                <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select
                      value={rightPanel.book}
                      onChange={(e) => setRightPanel({ ...rightPanel, book: e.target.value, chapter: 1 })}
                      style={{
                        padding: '4px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px'
                      }}
                    >
                      {books.map(book => (
                        <option key={book} value={book}>{book}</option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => navigateChapter('right', 'prev')}
                      style={{
                        padding: '4px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <input
                      type="number"
                      value={rightPanel.chapter}
                      onChange={(e) => setRightPanel({ ...rightPanel, chapter: parseInt(e.target.value) || 1 })}
                      style={{
                        width: '64px',
                        padding: '4px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        textAlign: 'center'
                      }}
                      min="1"
                    />
                    
                    <button
                      onClick={() => navigateChapter('right', 'next')}
                      style={{
                        padding: '4px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      setRightPanel({ type: null, content: null, book: '', chapter: 1 });
                      setSplitMode(false);
                    }}
                    style={{
                      padding: '4px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              
              {rightPanel.type === 'pdf' && (
                <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '600' }}>PDF Document</span>
                  <button
                    onClick={() => {
                      setRightPanel({ type: null, content: null, book: '', chapter: 1 });
                    }}
                    style={{
                      padding: '4px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                {renderPanelContent('right')}
              </div>
              
              {!rightPanel.type && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  <p style={{ marginBottom: '16px' }}>Right panel empty</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        if (books.length > 0) {
                          setRightPanel({ type: 'bible', book: books[0], chapter: 1 });
                        }
                      }}
                      style={{
                        backgroundColor: '#2563eb',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Book size={18} />
                      Load Bible Passage
                    </button>
                    <button
                      onClick={() => pdfInputRef.current?.click()}
                      style={{
                        backgroundColor: '#2563eb',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <FileText size={18} />
                      Load PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showNoteDialog && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '384px',
            maxWidth: '100%'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
              Add Note - {selectedText.verseRef}
            </h3>
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              style={{
                width: '100%',
                height: '128px',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                resize: 'none'
              }}
              placeholder="Enter your note here..."
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={saveNote}
                style={{
                  flex: 1,
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowNoteDialog(false);
                  setCurrentNote('');
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#d1d5db',
                  color: '#374151',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BibleStudyApp;