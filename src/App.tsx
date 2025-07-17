import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bookmark, 
  Plus, 
  Search, 
  Menu, 
  Share, 
  ArrowLeft, 
  Pin, 
  X,
  Mic,
  MicOff
} from 'lucide-react';
import { DollarBillIcon } from './components/DollarBillIcon';
import { HealthIcon } from './components/HealthIcon';

// Affirmations data with categories
const affirmations = [
  // Love & Self-Love (Pink)
  { text: "I am worthy of love and respect", category: "love" },
  { text: "I radiate love and positivity", category: "love" },
  { text: "I am beautiful inside and out", category: "love" },
  { text: "I deserve happiness and joy", category: "love" },
  { text: "I love and accept myself completely", category: "love" },
  { text: "I attract loving relationships", category: "love" },
  { text: "I am confident and secure", category: "love" },
  { text: "I choose to see the good in myself", category: "love" },
  { text: "I am enough just as I am", category: "love" },
  { text: "I forgive myself and others", category: "love" },
  
  // Wealth & Business (Green)
  { text: "I am a money magnet", category: "wealth" },
  { text: "Abundance flows to me easily", category: "wealth" },
  { text: "I create wealth through my talents", category: "wealth" },
  { text: "Money comes to me in expected and unexpected ways", category: "wealth" },
  { text: "I am financially free and secure", category: "wealth" },
  { text: "I make smart money decisions", category: "wealth" },
  { text: "My business grows and prospers", category: "wealth" },
  { text: "I attract lucrative opportunities", category: "wealth" },
  { text: "I am worthy of financial success", category: "wealth" },
  { text: "Wealth and prosperity are my birthright", category: "wealth" },
  
  // Health & Fitness (Blue)
  { text: "I am healthy and strong", category: "health" },
  { text: "My body heals quickly and naturally", category: "health" },
  { text: "I make healthy choices every day", category: "health" },
  { text: "I am full of energy and vitality", category: "health" },
  { text: "I love and care for my body", category: "health" },
  { text: "I am getting stronger every day", category: "health" },
  { text: "My mind is clear and focused", category: "health" },
  { text: "I sleep peacefully and wake refreshed", category: "health" },
  { text: "I am in perfect health", category: "health" },
  { text: "I radiate wellness and vitality", category: "health" },
  
  // Learning & Growth (Yellow)
  { text: "I am constantly learning and growing", category: "learning" },
  { text: "I embrace new challenges with confidence", category: "learning" },
  { text: "My mind is open to new possibilities", category: "learning" },
  { text: "I am intelligent and capable", category: "learning" },
  { text: "I learn from every experience", category: "learning" },
  { text: "Knowledge comes easily to me", category: "learning" },
  { text: "I am curious and eager to learn", category: "learning" },
  { text: "I grow stronger through challenges", category: "learning" },
  { text: "I am becoming the best version of myself", category: "learning" },
  { text: "Every day I discover something new", category: "learning" }
];

// Search topics
const searchTopics = [
  { name: "Love", category: "love", color: "bg-pink-500" },
  { name: "Wealth", category: "wealth", color: "bg-green-500" },
  { name: "Health", category: "health", color: "bg-blue-500" },
  { name: "Learning", category: "learning", color: "bg-yellow-500" }
];

interface BookmarkedAffirmation {
  id: string;
  text: string;
  category: string;
  isPinned: boolean;
  timestamp: number;
}

// Speech Recognition types
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const App: React.FC = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState(affirmations[0]);
  const [clickedLetters, setClickedLetters] = useState<Set<number>>(new Set());
  const [showBurst, setShowBurst] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'bookmarks' | 'search'>('main');
  const [bookmarks, setBookmarks] = useState<BookmarkedAffirmation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [affirmationHistory, setAffirmationHistory] = useState<typeof affirmations[0][]>([affirmations[0]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Load bookmarks from localStorage on component mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('goaly-bookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  // Save bookmarks to localStorage whenever bookmarks change
  useEffect(() => {
    localStorage.setItem('goaly-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
          console.log('Speech recognized:', transcript);
          
          // Process the speech and check if it matches the affirmation
          processSpeechResult(transcript);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.log('Speech recognition error:', event.error);
          if (event.error !== 'aborted') {
            setIsListening(false);
          }
        };

        recognitionRef.current.onend = () => {
          console.log('Recognition ended, continuous mode:', recognitionRef.current?.continuous);
          if (isListening && recognitionRef.current) {
            // Restart recognition if we're still supposed to be listening
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.log('Error restarting recognition:', error);
              setIsListening(false);
            }
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, [isListening]);

  const triggerFullAnimation = useCallback(() => {
    // Mark all letters as clicked
    const allLetters = new Set<number>();
    for (let i = 0; i < currentAffirmation.text.length; i++) {
      if (currentAffirmation.text[i] !== ' ') {
        allLetters.add(i);
      }
    }
    setClickedLetters(allLetters);
    
    // Trigger burst animation
    setTimeout(() => {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 3000);
    }, 500);
  }, [currentAffirmation]);

  const processSpeechResult = useCallback((transcript: string) => {
    console.log('Processing speech result:', transcript);
    console.log('Current affirmation:', currentAffirmation.text);
    
    // Get words from the affirmation (filter out short words)
    const affirmationWords = currentAffirmation.text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length >= 3);
    
    // Get words from the transcript (filter out short words)
    const transcriptWords = transcript
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length >= 3);
    
    console.log('Affirmation words:', affirmationWords);
    console.log('Transcript words:', transcriptWords);
    
    // Count matches with more flexible matching
    let matchCount = 0;
    
    for (const affWord of affirmationWords) {
      for (const transWord of transcriptWords) {
        // Exact match
        if (affWord === transWord) {
          matchCount++;
          console.log(`Exact match: "${affWord}" = "${transWord}"`);
          break;
        }
        // Partial match (contains)
        else if (affWord.includes(transWord) || transWord.includes(affWord)) {
          matchCount++;
          console.log(`Partial match: "${affWord}" ~ "${transWord}"`);
          break;
        }
        // Similar words (same length, similar start)
        else if (Math.abs(affWord.length - transWord.length) <= 2 && 
                 affWord.substring(0, 3) === transWord.substring(0, 3)) {
          matchCount++;
          console.log(`Similar match: "${affWord}" ≈ "${transWord}"`);
          break;
        }
      }
    }
    
    const matchPercentage = (matchCount / affirmationWords.length) * 100;
    console.log(`Match count: ${matchCount}/${affirmationWords.length} (${matchPercentage.toFixed(1)}%)`);
    
    // Trigger animation if we have a good match (50% or more)
    if (matchPercentage >= 50) {
      console.log('🎉 Triggering animation!');
      triggerFullAnimation();
    } else {
      console.log('❌ Not enough matches to trigger animation');
    }
  }, [currentAffirmation, triggerFullAnimation]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      console.log('Stopping speech recognition...');
      recognitionRef.current.abort();
      setIsListening(false);
    } else {
      console.log('Starting speech recognition...');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.log('Error starting recognition:', error);
      }
    }
  };

  const getRandomAffirmation = () => {
    let newAffirmation;
    do {
      newAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    } while (newAffirmation === currentAffirmation && affirmations.length > 1);
    return newAffirmation;
  };

  const handleNewAffirmation = () => {
    const newAffirmation = getRandomAffirmation();
    setCurrentAffirmation(newAffirmation);
    setClickedLetters(new Set());
    setShowBurst(false);
    
    // Add to history
    const newHistory = affirmationHistory.slice(0, historyIndex + 1);
    newHistory.push(newAffirmation);
    if (newHistory.length > 10) {
      newHistory.shift();
    }
    setAffirmationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleGoBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentAffirmation(affirmationHistory[newIndex]);
      setClickedLetters(new Set());
      setShowBurst(false);
    }
  };

  const handleLetterClick = (index: number) => {
    if (currentAffirmation.text[index] === ' ') return;
    
    const newClickedLetters = new Set(clickedLetters);
    newClickedLetters.add(index);
    setClickedLetters(newClickedLetters);
    
    // Check if all letters are clicked
    const totalLetters = currentAffirmation.text.replace(/\s/g, '').length;
    if (newClickedLetters.size === totalLetters) {
      setTimeout(() => {
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 3000);
      }, 500);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleNewAffirmation();
    } else if (e.deltaY > 0) {
      handleGoBack();
    }
  };

  const handleTouchStart = useRef({ y: 0, time: 0 });
  const handleTouchStartEvent = (e: React.TouchEvent) => {
    handleTouchStart.current = {
      y: e.touches[0].clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = handleTouchStart.current.y - e.changedTouches[0].clientY;
    const deltaTime = Date.now() - handleTouchStart.current.time;
    
    if (Math.abs(deltaY) > 50 && deltaTime < 300) {
      if (deltaY > 0) {
        handleNewAffirmation();
      } else {
        handleGoBack();
      }
    }
  };

  const isBookmarked = (text: string) => {
    return bookmarks.some(bookmark => bookmark.text === text);
  };

  const toggleBookmark = () => {
    const existingBookmark = bookmarks.find(b => b.text === currentAffirmation.text);
    
    if (existingBookmark) {
      setBookmarks(bookmarks.filter(b => b.id !== existingBookmark.id));
    } else {
      const newBookmark: BookmarkedAffirmation = {
        id: Date.now().toString(),
        text: currentAffirmation.text,
        category: currentAffirmation.category,
        isPinned: false,
        timestamp: Date.now()
      };
      setBookmarks([...bookmarks, newBookmark]);
    }
  };

  const togglePin = (id: string) => {
    setBookmarks(bookmarks.map(bookmark => 
      bookmark.id === id 
        ? { ...bookmark, isPinned: !bookmark.isPinned }
        : bookmark
    ));
  };

  const deleteBookmark = (id: string) => {
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
    }
  };

  const copyToClipboard = async () => {
    const shareUrl = `${window.location.origin}?affirmation=${encodeURIComponent(currentAffirmation.text)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const getFilteredAffirmations = () => {
    if (!searchQuery) return affirmations;
    return affirmations.filter(affirmation =>
      affirmation.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getAffirmationsByCategory = (category: string) => {
    return affirmations.filter(affirmation => affirmation.category === category);
  };

  const selectAffirmation = (affirmation: typeof affirmations[0]) => {
    setCurrentAffirmation(affirmation);
    setClickedLetters(new Set());
    setShowBurst(false);
    setCurrentView('main');
    
    // Add to history
    const newHistory = affirmationHistory.slice(0, historyIndex + 1);
    newHistory.push(affirmation);
    if (newHistory.length > 10) {
      newHistory.shift();
    }
    setAffirmationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const getCategoryClass = (category: string) => {
    switch (category) {
      case 'love': return 'letter-fill';
      case 'wealth': return 'letter-fill-wealth';
      case 'health': return 'letter-fill-health';
      case 'learning': return 'letter-fill-learning';
      default: return 'letter-fill';
    }
  };

  const getCategoryGlowClass = (category: string) => {
    switch (category) {
      case 'love': return 'letter-glow';
      case 'wealth': return 'letter-glow-wealth';
      case 'health': return 'letter-glow-health';
      case 'learning': return 'letter-glow-learning';
      default: return 'letter-glow';
    }
  };

  const getBurstIcon = (category: string) => {
    switch (category) {
      case 'love': return '💖';
      case 'wealth': return <DollarBillIcon className="w-6 h-6" />;
      case 'health': return <HealthIcon className="w-6 h-6" />;
      case 'learning': return '⭐';
      default: return '💖';
    }
  };

  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.timestamp - a.timestamp;
  });

  // Check for shared affirmation on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedAffirmation = urlParams.get('affirmation');
    if (sharedAffirmation) {
      const foundAffirmation = affirmations.find(a => a.text === sharedAffirmation);
      if (foundAffirmation) {
        setCurrentAffirmation(foundAffirmation);
      }
    }
  }, []);

  if (currentView === 'bookmarks') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/20">
          <button 
            onClick={() => setCurrentView('main')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Bookmarks</h1>
          <div className="w-10"></div>
        </div>

        {/* Bookmarks List */}
        <div className="p-4 space-y-3">
          {sortedBookmarks.length === 0 ? (
            <div className="text-center text-white/60 mt-20">
              <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No bookmarks yet</p>
              <p className="text-sm">Save affirmations to see them here</p>
            </div>
          ) : (
            sortedBookmarks.map((bookmark) => (
              <div key={bookmark.id} className="bg-white/10 rounded-lg p-4 flex items-start justify-between">
                <div className="flex-1">
                  <p 
                    className="cursor-pointer hover:text-blue-300 transition-colors"
                    onClick={() => selectAffirmation({ text: bookmark.text, category: bookmark.category })}
                  >
                    {bookmark.text}
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      bookmark.category === 'love' ? 'bg-pink-500/30 text-pink-200' :
                      bookmark.category === 'wealth' ? 'bg-green-500/30 text-green-200' :
                      bookmark.category === 'health' ? 'bg-blue-500/30 text-blue-200' :
                      'bg-yellow-500/30 text-yellow-200'
                    }`}>
                      {bookmark.category}
                    </span>
                    {bookmark.isPinned && (
                      <Pin className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => togglePin(bookmark.id)}
                    className={`p-1 rounded transition-colors ${
                      bookmark.isPinned ? 'text-blue-400 hover:text-blue-300' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBookmark(bookmark.id)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'search') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/20">
          <button 
            onClick={() => setCurrentView('main')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Search</h1>
          <div className="w-10"></div>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Search affirmations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 bg-white/10 rounded-lg text-white placeholder-white/60 border border-white/20 focus:border-white/40 focus:outline-none"
          />
        </div>

        {/* Topics */}
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-3">Browse by Topic</h2>
          <div className="grid grid-cols-2 gap-3">
            {searchTopics.map((topic) => (
              <button
                key={topic.category}
                onClick={() => {
                  const categoryAffirmations = getAffirmationsByCategory(topic.category);
                  if (categoryAffirmations.length > 0) {
                    const randomAffirmation = categoryAffirmations[Math.floor(Math.random() * categoryAffirmations.length)];
                    selectAffirmation(randomAffirmation);
                  }
                }}
                className={`${topic.color} p-4 rounded-lg text-white font-medium hover:opacity-80 transition-opacity`}
              >
                {topic.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-3">Results</h2>
            <div className="space-y-2">
              {getFilteredAffirmations().map((affirmation, index) => (
                <button
                  key={index}
                  onClick={() => selectAffirmation(affirmation)}
                  className="w-full text-left p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <p>{affirmation.text}</p>
                  <span className={`inline-block mt-1 px-2 py-1 rounded text-xs ${
                    affirmation.category === 'love' ? 'bg-pink-500/30 text-pink-200' :
                    affirmation.category === 'wealth' ? 'bg-green-500/30 text-green-200' :
                    affirmation.category === 'health' ? 'bg-blue-500/30 text-blue-200' :
                    'bg-yellow-500/30 text-yellow-200'
                  }`}>
                    {affirmation.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden relative"
      onWheel={handleWheel}
      onTouchStart={handleTouchStartEvent}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-4 bg-black/20 relative z-10">
        <button 
          onClick={handleNewAffirmation}
          className="text-2xl font-bold hover:text-blue-300 transition-colors"
          style={{ fontFamily: 'Fredoka One, cursive' }}
        >
          Goaly
        </button>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setCurrentView('bookmarks')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Bookmark className="w-6 h-6" />
          </button>
          <button 
            onClick={handleNewAffirmation}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setCurrentView('search')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Search className="w-6 h-6" />
          </button>
          <button 
            onClick={toggleListening}
            className={`p-2 rounded-full transition-colors ${
              isListening 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'hover:bg-white/10'
            }`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div 
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight cursor-pointer select-none"
            style={{ fontFamily: 'Fredoka One, cursive' }}
          >
            {currentAffirmation.text.split('').map((char, index) => (
              <span
                key={index}
                className={`inline-block transition-all duration-300 ${
                  char === ' ' ? 'w-4' : 'hover:scale-110'
                } ${
                  clickedLetters.has(index) && char !== ' '
                    ? `${getCategoryClass(currentAffirmation.category)} ${getCategoryGlowClass(currentAffirmation.category)} letter-sparkle`
                    : ''
                }`}
                onClick={() => handleLetterClick(index)}
                style={{
                  textShadow: clickedLetters.has(index) && char !== ' ' 
                    ? '0 0 20px currentColor' 
                    : '2px 2px 4px rgba(0,0,0,0.5)'
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </div>
          
          {/* Listening indicator */}
          {isListening && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-red-400">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Listening...</span>
            </div>
          )}
        </div>

        {/* Right Side Icons */}
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 z-10">
          <button
            onClick={toggleBookmark}
            className={`p-3 rounded-full transition-all duration-300 ${
              isBookmarked(currentAffirmation.text)
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <Bookmark className={`w-6 h-6 ${isBookmarked(currentAffirmation.text) ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={copyToClipboard}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <Share className="w-6 h-6" />
          </button>
        </div>

        {/* Burst Animation */}
        {showBurst && (
          <div className="fixed inset-0 pointer-events-none z-20">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="absolute text-4xl animate-pulse"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  animation: `heartBurst 3s ease-out forwards`,
                  animationDelay: `${i * 0.1}s`,
                  '--end-x': `${(Math.random() - 0.5) * 800}px`,
                  '--end-y': `${(Math.random() - 0.5) * 600}px`,
                } as React.CSSProperties}
              >
                {getBurstIcon(currentAffirmation.category)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;