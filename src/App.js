import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import BiblePanel from './components/Panels/BiblePanel';
import PDFPanel from './components/Panels/PDFPanel';
import EmptyPanel from './components/Panels/EmptyPanel';
import { VerseView, ChapterView } from './components/Verse/Verse';
import Note from './components/Verse/Note';
import NoteDialog from './components/Dialog/NoteDialog';
import './App.css';

const BibleStudyApp = () => {
  const [bibleData, setBibleData] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [splitMode, setSplitMode] = useState(false);
  const [highlights, setHighlights] = useState({});
  const [panels, setPanels] = useState([
    { type: 'bible', content: null, book: '', chapter: 1 }, // left panel
    { type: null, content: null, book: '', chapter: 1 }     // right panel
  ]);
  const [currentPanelIndex, setCurrentPanelIndex] = useState(0);
  const [notes, setNotes] = useState({});
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState(null);

  const handleSearchResultClick = (result) => {
    setPanels(prevPanels => {
      const newPanels = [...prevPanels];
      newPanels[currentPanelIndex] = { 
        type: "bible", 
        content: result,
        book: result.book,
        chapter: result.chapter
      };
      return newPanels;
    });
    setSearchHighlight(result.reference);
  };
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
        setPanels(prev => {
          const newPanels = [...prev];
          newPanels[0] = { ...newPanels[0], book: uniqueBooks[0], chapter: 1 };
          return newPanels;
        });
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
    setPanels(prev => {
      const newPanels = [...prev];
      newPanels[1] = { type: 'pdf', content: url, book: '', chapter: 0 };
      return newPanels;
    });
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
  const navigateChapter = (panelIndex, direction) => {
    const currentPanel = panels[panelIndex];
    const verses = bibleData.filter(v => v.book === currentPanel.book);
    const chapters = [...new Set(verses.map(v => v.chapter))].sort((a, b) => a - b);
    const currentIndex = chapters.indexOf(currentPanel.chapter);
    
    let newChapter = currentPanel.chapter;
    if (direction === 'prev' && currentIndex > 0) {
      newChapter = chapters[currentIndex - 1];
    } else if (direction === 'next' && currentIndex < chapters.length - 1) {
      newChapter = chapters[currentIndex + 1];
    }
    
    setPanels(prev => {
      const newPanels = [...prev];
      newPanels[panelIndex] = { ...currentPanel, chapter: newChapter };
      return newPanels;
    });
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
  const renderVerseContent = (verse, panel) => {
    const hasHighlight = highlights[verse.reference];
    const hasNote = notes[verse.reference];
    const isSearchHighlight = searchHighlight === verse.reference;

    return (
      <VerseView
        key={verse.reference}
        verse={verse}
        highlight={hasHighlight}
        isSearchHighlight={isSearchHighlight}
        onSelect={() => handleTextSelection(panel, verse.reference)}
      >
        {hasNote && (
          <Note
            text={notes[verse.reference]}
            onDelete={() => deleteNote(verse.reference)}
          />
        )}
      </VerseView>
    );
  };

  // Component to handle verse scrolling
  const BibleContent = React.memo(({ verses, panel, viewMode, searchHighlight, highlights, notes }) => {
    useEffect(() => {
      if (searchHighlight) {
        const verseElement = document.querySelector(`.verse-text.search-highlight`);
        if (verseElement) {
          verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, [searchHighlight]);

    if (viewMode === 'verse') {
      return (
        <div>
          {verses.map(v => renderVerseContent(v, panel))}
        </div>
      );
    } else {
      return (
        <ChapterView
          verses={verses}
          highlights={highlights}
          searchHighlight={searchHighlight}
          onSelect={(verseRef) => handleTextSelection(panel, verseRef)}
          notes={notes}
        />
      );
    }
  });

  // Render panel content
  const renderPanelContent = (panel, panelData) => {    
    if (panelData.type === 'bible' && panelData.book) {
      const verses = getChapterVerses(panelData.book, panelData.chapter);
      
      return (
        <BibleContent
          verses={verses}
          panel={panel}
          viewMode={viewMode}
          searchHighlight={searchHighlight}
          highlights={highlights}
          notes={notes}
        />
      );
    }
    
    return null;
  };

  return (
    <div className="app">
      <Header
        splitMode={splitMode}
        viewMode={viewMode}
        onBibleLoad={handleBibleUpload}
        onPdfLoad={handlePdfUpload}
        onSplitToggle={() => setSplitMode(!splitMode)}
        onViewModeChange={(mode) => setViewMode(mode)}
        fileInputRef={fileInputRef}
        pdfInputRef={pdfInputRef}
      />

      <div className="main-content">
        <Sidebar
          searchQuery={searchQuery}
          searchResults={searchResults}
          books={books}
          currentBook={panels[0].book}
          onSearch={handleSearch}
          onSearchChange={setSearchQuery}
          onBookSelect={(book) => {
            setPanels(prev => {
              const newPanels = [...prev];
              newPanels[0] = { ...newPanels[0], type: 'bible', book, chapter: 1 };
              return newPanels;
            });
          }}
          onSearchResultClick={handleSearchResultClick}
        />
        
        <div className="content-area">
          <div className={`panel-container ${!splitMode ? 'full-width' : ''}`}>
            {panels[0].type === 'bible' && (
              <BiblePanel
                panel={0}
                books={books}
                currentBook={panels[0].book}
                currentChapter={panels[0].chapter}
                splitMode={splitMode}
                onBookChange={(book) => {
                  setPanels(prev => {
                    const newPanels = [...prev];
                    newPanels[0] = { ...newPanels[0], book };
                    return newPanels;
                  });
                  setSearchHighlight(null);
                }}
                onChapterChange={(chapter) => {
                  setPanels(prev => {
                    const newPanels = [...prev];
                    newPanels[0] = { ...newPanels[0], chapter };
                    return newPanels;
                  });
                  setSearchHighlight(null);
                }}
                onNavigate={(direction) => navigateChapter(0, direction)}
                selectedText={selectedText}
                onHighlight={addHighlight}
                onRemoveHighlight={removeHighlight}
                onAddNote={() => {
                  setCurrentNote(notes[selectedText.verseRef] || '');
                  setShowNoteDialog(true);
                }}
                renderContent={() => renderPanelContent(0, panels[0])}
              />
            )}
          </div>

          {/* Right Panel */}
          {splitMode && (
            <div className="panel-container right">
              {panels[1].type === 'bible' ? (
                <BiblePanel
                  panel={1}
                  books={books}
                  currentBook={panels[1].book}
                  currentChapter={panels[1].chapter}
                  splitMode={splitMode}
                  onBookChange={(book) => {
                    setPanels(prev => {
                      const newPanels = [...prev];
                      newPanels[1] = { ...newPanels[1], book, chapter: 1 };
                      return newPanels;
                    });
                  }}
                  onChapterChange={(chapter) => {
                    setPanels(prev => {
                      const newPanels = [...prev];
                      newPanels[1] = { ...newPanels[1], chapter };
                      return newPanels;
                    });
                  }}
                  onNavigate={(direction) => navigateChapter(1, direction)}
                  onClose={() => {
                    setPanels(prev => {
                      const newPanels = [...prev];
                      newPanels[1] = { type: null, content: null, book: '', chapter: 1 };
                      return newPanels;
                    });
                    setSplitMode(false);
                  }}
                  selectedText={selectedText}
                  onHighlight={addHighlight}
                  onRemoveHighlight={removeHighlight}
                  onAddNote={() => {
                    setCurrentNote(notes[selectedText.verseRef] || '');
                    setShowNoteDialog(true);
                  }}
                  renderContent={() => renderPanelContent(1, panels[1])}
                />
              ) : panels[1].type === 'pdf' ? (
                <PDFPanel
                  url={panels[1].content}
                  onClose={() => {
                    setPanels(prev => {
                      const newPanels = [...prev];
                      newPanels[1] = { type: null, content: null, book: '', chapter: 1 };
                      return newPanels;
                    });
                  }}
                />
              ) : (
                <EmptyPanel
                  books={books}
                  onLoadBible={(book) => {
                    setPanels(prev => {
                      const newPanels = [...prev];
                      newPanels[1] = { type: 'bible', book, chapter: 1 };
                      return newPanels;
                    });
                  }}
                  onLoadPDF={() => pdfInputRef.current?.click()}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <NoteDialog
        isOpen={showNoteDialog}
        verseRef={selectedText.verseRef}
        note={currentNote}
        onNoteChange={setCurrentNote}
        onSave={saveNote}
        onClose={() => {
          setShowNoteDialog(false);
          setCurrentNote('');
        }}
      />
    </div>
  );
};

export default BibleStudyApp;