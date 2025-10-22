import logo from './logo.svg';

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
  const [viewMode, setViewMode] = useState('chapter'); // 'chapter' or 'verse'
  const [selectedText, setSelectedText] = useState({ panel: null, text: '', verseRef: '' });
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);

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
    
    const highlightColors = {
      yellow: 'bg-yellow-200',
      green: 'bg-green-200',
      blue: 'bg-blue-200',
      pink: 'bg-pink-200'
    };

    return (
      <div
        key={verse.reference}
        className={`mb-2 p-2 rounded ${hasHighlight ? highlightColors[hasHighlight] : ''}`}
        onMouseUp={() => handleTextSelection(panel, verse.reference)}
      >
        <span className="font-semibold text-blue-700">{verse.verse}</span>
        <span className="ml-2">{verse.text}</span>
        {hasNote && (
          <div className="mt-1 p-2 bg-amber-50 border-l-4 border-amber-400 text-sm">
            <div className="flex justify-between items-start">
              <p className="text-gray-700">{notes[verse.reference]}</p>
              <button
                onClick={() => deleteNote(verse.reference)}
                className="text-red-500 hover:text-red-700 ml-2"
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
          className="w-full h-full border-0"
          title="PDF Viewer"
        />
      );
    }
    
    if (panelData.type === 'bible' && panelData.book) {
      const verses = getChapterVerses(panelData.book, panelData.chapter);
      
      if (viewMode === 'verse') {
        return (
          <div className="space-y-1">
            {verses.map(v => renderVerse(v, panel))}
          </div>
        );
      } else {
        // Chapter mode - continuous text
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">
              {panelData.book} {panelData.chapter}
            </h2>
            <div className="leading-relaxed">
              {verses.map(v => (
                <span key={v.reference}>
                  <sup className="text-blue-600 font-semibold">{v.verse}</sup>
                  <span
                    className={`${highlights[v.reference] ? `bg-${highlights[v.reference]}-200` : ''}`}
                    onMouseUp={() => handleTextSelection(panel, v.reference)}
                  >
                    {v.text}
                  </span>{' '}
                  {notes[v.reference] && (
                    <span className="inline-block">
                      <span className="text-amber-600" title={notes[v.reference]}>📝</span>
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        );
      }
    }
    
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>No content loaded</p>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-blue-900 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold mb-3">Bible Study Desktop</h1>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded flex items-center gap-2"
          >
            <Book size={18} />
            Load Bible
          </button>
          
          <button
            onClick={() => setSplitMode(!splitMode)}
            className={`px-4 py-2 rounded flex items-center gap-2 ${
              splitMode ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-700 hover:bg-blue-600'
            }`}
          >
            <Split size={18} />
            Split View
          </button>
          
          {splitMode && (
            <button
              onClick={() => pdfInputRef.current?.click()}
              className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded flex items-center gap-2"
            >
              <FileText size={18} />
              Load PDF
            </button>
          )}
          
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded text-white"
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
          className="hidden"
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf"
          onChange={handlePdfUpload}
          className="hidden"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-64 bg-white border-r flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-4 border-b">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search Bible..."
                className="flex-1 px-3 py-2 border rounded"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
              >
                <Search size={18} />
              </button>
            </div>
          </div>
          
          {/* Search Results / Book Selection */}
          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="p-2">
                <h3 className="font-semibold mb-2 px-2">
                  Search Results ({searchResults.length})
                </h3>
                {searchResults.map(verse => (
                  <button
                    key={verse.reference}
                    onClick={() => {
                      setLeftPanel({ type: 'bible', book: verse.book, chapter: verse.chapter });
                      setSearchResults([]);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2 hover:bg-blue-50 rounded mb-1"
                  >
                    <div className="font-semibold text-sm text-blue-700">
                      {verse.reference}
                    </div>
                    <div className="text-xs text-gray-600 line-clamp-2">
                      {verse.text}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-2">
                <h3 className="font-semibold mb-2 px-2">Books</h3>
                {books.map(book => (
                  <button
                    key={book}
                    onClick={() => setLeftPanel({ ...leftPanel, type: 'bible', book, chapter: 1 })}
                    className={`w-full text-left px-3 py-2 rounded mb-1 ${
                      leftPanel.book === book ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {book}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Left Panel */}
          <div className={`${splitMode ? 'w-1/2' : 'w-full'} flex flex-col bg-white`}>
            {/* Panel Controls */}
            {leftPanel.book && (
              <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <select
                    value={leftPanel.book}
                    onChange={(e) => setLeftPanel({ ...leftPanel, book: e.target.value, chapter: 1 })}
                    className="px-3 py-1 border rounded"
                  >
                    {books.map(book => (
                      <option key={book} value={book}>{book}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => navigateChapter('left', 'prev')}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <input
                    type="number"
                    value={leftPanel.chapter}
                    onChange={(e) => setLeftPanel({ ...leftPanel, chapter: parseInt(e.target.value) || 1 })}
                    className="w-16 px-2 py-1 border rounded text-center"
                    min="1"
                  />
                  
                  <button
                    onClick={() => navigateChapter('left', 'next')}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                {selectedText.panel === 'left' && selectedText.text && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => addHighlight('yellow')}
                      className="p-2 bg-yellow-200 hover:bg-yellow-300 rounded"
                      title="Yellow Highlight"
                    >
                      <Highlighter size={16} />
                    </button>
                    <button
                      onClick={() => addHighlight('green')}
                      className="p-2 bg-green-200 hover:bg-green-300 rounded"
                      title="Green Highlight"
                    >
                      <Highlighter size={16} />
                    </button>
                    <button
                      onClick={() => addHighlight('blue')}
                      className="p-2 bg-blue-200 hover:bg-blue-300 rounded"
                      title="Blue Highlight"
                    >
                      <Highlighter size={16} />
                    </button>
                    <button
                      onClick={() => addHighlight('pink')}
                      className="p-2 bg-pink-200 hover:bg-pink-300 rounded"
                      title="Pink Highlight"
                    >
                      <Highlighter size={16} />
                    </button>
                    <button
                      onClick={() => removeHighlight(selectedText.verseRef)}
                      className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
                      title="Remove Highlight"
                    >
                      <X size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentNote(notes[selectedText.verseRef] || '');
                        setShowNoteDialog(true);
                      }}
                      className="p-2 bg-amber-200 hover:bg-amber-300 rounded"
                      title="Add Note"
                    >
                      <StickyNote size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto p-6">
              {renderPanelContent('left')}
            </div>
          </div>

          {/* Right Panel */}
          {splitMode && (
            <div className="w-1/2 flex flex-col bg-white border-l">
              {rightPanel.type === 'bible' && rightPanel.book && (
                <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <select
                      value={rightPanel.book}
                      onChange={(e) => setRightPanel({ ...rightPanel, book: e.target.value, chapter: 1 })}
                      className="px-3 py-1 border rounded"
                    >
                      {books.map(book => (
                        <option key={book} value={book}>{book}</option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => navigateChapter('right', 'prev')}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <input
                      type="number"
                      value={rightPanel.chapter}
                      onChange={(e) => setRightPanel({ ...rightPanel, chapter: parseInt(e.target.value) || 1 })}
                      className="w-16 px-2 py-1 border rounded text-center"
                      min="1"
                    />
                    
                    <button
                      onClick={() => navigateChapter('right', 'next')}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      setRightPanel({ type: null, content: null, book: '', chapter: 1 });
                      setSplitMode(false);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              
              {rightPanel.type === 'pdf' && (
                <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
                  <span className="font-semibold">PDF Document</span>
                  <button
                    onClick={() => {
                      setRightPanel({ type: null, content: null, book: '', chapter: 1 });
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              
              <div className="flex-1 overflow-y-auto p-6">
                {renderPanelContent('right')}
              </div>
              
              {!rightPanel.type && (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <p className="mb-4">Right panel empty</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (books.length > 0) {
                          setRightPanel({ type: 'bible', book: books[0], chapter: 1 });
                        }
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Book size={18} />
                      Load Bible Passage
                    </button>
                    <button
                      onClick={() => pdfInputRef.current?.click()}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
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

      {/* Note Dialog */}
      {showNoteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-lg font-semibold mb-3">
              Add Note - {selectedText.verseRef}
            </h3>
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              className="w-full h-32 p-3 border rounded resize-none"
              placeholder="Enter your note here..."
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={saveNote}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowNoteDialog(false);
                  setCurrentNote('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
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