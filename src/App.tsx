import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bookmark, Share2, Search, Menu, Plus, ArrowLeft, Pin, X, Mic } from 'lucide-react';
import { DollarBillIcon } from './components/DollarBillIcon';
import { HealthIcon } from './components/HealthIcon';
import { secureStorage, rateLimiter } from './utils/security';

interface Affirmation {
  id: string;
  text: string;
  category: 'love' | 'wealth' | 'health' | 'learning';
}

interface BookmarkedAffirmation extends Affirmation {
  isPinned: boolean;
  dateAdded: string;
}

const affirmations: Affirmation[] = [
  // Love & Self-Love
  { id: '1', text: 'I am worthy of love and respect', category: 'love' },
  { id: '2', text: 'I choose to love myself unconditionally', category: 'love' },
  { id: '3', text: 'I attract loving relationships into my life', category: 'love' },
  { id: '4', text: 'I am enough exactly as I am', category: 'love' },
  { id: '5', text: 'I radiate love and positivity', category: 'love' },
  { id: '6', text: 'I forgive myself and others with compassion', category: 'love' },
  { id: '7', text: 'I am deserving of happiness and joy', category: 'love' },
  { id: '8', text: 'I trust in the power of love to heal', category: 'love' },
  { id: '9', text: 'I am grateful for the love in my life', category: 'love' },
  { id: '10', text: 'I choose kindness towards myself and others', category: 'love' },

  // Wealth & Business
  { id: '11', text: 'I am a magnet for financial abundance', category: 'wealth' },
  { id: '12', text: 'Money flows to me easily and effortlessly', category: 'wealth' },
  { id: '13', text: 'I make smart financial decisions', category: 'wealth' },
  { id: '14', text: 'I am worthy of financial success', category: 'wealth' },
  { id: '15', text: 'My business grows and prospers daily', category: 'wealth' },
  { id: '16', text: 'I attract lucrative opportunities', category: 'wealth' },
  { id: '17', text: 'I am financially free and secure', category: 'wealth' },
  { id: '18', text: 'Wealth and prosperity are my birthright', category: 'wealth' },
  { id: '19', text: 'I create multiple streams of income', category: 'wealth' },
  { id: '20', text: 'I invest wisely and see great returns', category: 'wealth' },

  // Health & Fitness
  { id: '21', text: 'I am strong, healthy, and vibrant', category: 'health' },
  { id: '22', text: 'My body heals quickly and completely', category: 'health' },
  { id: '23', text: 'I make healthy choices that nourish my body', category: 'health' },
  { id: '24', text: 'I have abundant energy and vitality', category: 'health' },
  { id: '25', text: 'I am grateful for my healthy body', category: 'health' },
  { id: '26', text: 'I enjoy exercising and staying active', category: 'health' },
  { id: '27', text: 'My mind is clear and focused', category: 'health' },
  { id: '28', text: 'I sleep peacefully and wake refreshed', category: 'health' },
  { id: '29', text: 'I radiate health and wellness', category: 'health' },
  { id: '30', text: 'I listen to my body and honor its needs', category: 'health' },

  // Learning & Growth
  { id: '31', text: 'I am constantly learning and growing', category: 'learning' },
  { id: '32', text: 'I embrace challenges as opportunities', category: 'learning' },
  { id: '33', text: 'My mind is open to new possibilities', category: 'learning' },
  { id: '34', text: 'I am capable of achieving anything I set my mind to', category: 'learning' },
  { id: '35', text: 'I learn from every experience', category: 'learning' },
  { id: '36', text: 'I am becoming the best version of myself', category: 'learning' },
  { id: '37', text: 'Knowledge comes to me easily', category: 'learning' },
  { id: '38', text: 'I am curious and eager to learn', category: 'learning' },
  { id: '39', text: 'I trust in my ability to figure things out', category: 'learning' },
  { id: '40', text: 'Every day I grow wiser and stronger', category: 'learning' },
];

const App: React.FC = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation>(affirmations[0]);
  const [clickedLetters, setClickedLetters] = useState<Set<number>>(new Set());
  const [showBurst, setShowBurst] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'bookmarks' | 'search'>('main');
  const [bookmarks, setBookmarks] = useState<BookmarkedAffirmation[]>([]);
  const [bookmarkedAffirmations, setBookmarkedAffirmations] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [affirmationHistory, setAffirmationHistory] = useState<Affirmation[]>([affirmations[0]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('Speech recognized:', transcript);
        
        if (transcript.includes('next') || transcript.includes('new')) {
          getRandomAffirmation();
        } else if (transcript.includes('back') || transcript.includes('previous')) {
          goToPreviousAffirmation();
        } else if (transcript.includes('bookmark') || transcript.includes('save')) {
          toggleBookmark();
        } else if (transcript.includes('share')) {
          shareAffirmation();
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setMicPermission('denied');
        }
      };

      recognitionRef.current.onend = () => {
        console.log('Recognition ended, continuous mode:', recognitionRef.current?.continuous);
        setIsListening(false);
      };
    }
  }, []);

  // Request microphone permission
  const requestMicPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicPermission('denied');
      return false;
    }
  };

  // Toggle speech recognition
  const toggleSpeechRecognition = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (!rateLimiter.isAllowed('speech-recognition', 10, 60000)) {
      alert('Too many speech recognition attempts. Please wait a moment.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (micPermission !== 'granted') {
        const granted = await requestMicPermission();
        if (!granted) {
          alert('Microphone access is required for voice commands. Please enable microphone permissions in your browser settings.');
          return;
        }
      }

      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        alert('Failed to start voice recognition. Please try again.');
      }
    }
  };

  // Load bookmarks on component mount
  useEffect(() => {
    const savedBookmarks = secureStorage.getItem('goaly-bookmarks') || [];
    setBookmarks(savedBookmarks);
    const bookmarkIds = new Set(savedBookmarks.map((b: BookmarkedAffirmation) => b.id));
    setBookmarkedAffirmations(bookmarkIds);
  }, []);

  // Check if affirmation is bookmarked
  const isBookmarked = useCallback((affirmationId: string): boolean => {
    return bookmarkedAffirmations.has(affirmationId);
  }, [bookmarkedAffirmations]);

  // Get random affirmation
  const getRandomAffirmation = useCallback(() => {
    if (!rateLimiter.isAllowed('new-affirmation', 20, 60000)) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * affirmations.length);
    const newAffirmation = affirmations[randomIndex];
    
    setCurrentAffirmation(newAffirmation);
    setClickedLetters(new Set());
    setShowBurst(false);
    
    // Update history
    setAffirmationHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), newAffirmation];
      return newHistory.slice(-10); // Keep only last 10
    });
    setHistoryIndex(prev => Math.min(prev + 1, 9));
  }, [historyIndex]);

  // Go to previous affirmation
  const goToPreviousAffirmation = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentAffirmation(affirmationHistory[newIndex]);
      setClickedLetters(new Set());
      setShowBurst(false);
    }
  }, [historyIndex, affirmationHistory]);

  // Handle scroll/swipe navigation
  useEffect(() => {
    let startY = 0;
    let isScrolling = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      isScrolling = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isScrolling) {
        const currentY = e.touches[0].clientY;
        const deltaY = startY - currentY;

        if (Math.abs(deltaY) > 50) {
          isScrolling = true;
          if (deltaY > 0) {
            // Swipe up - new affirmation
            getRandomAffirmation();
          } else {
            // Swipe down - previous affirmation
            goToPreviousAffirmation();
          }
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) {
        // Scroll up - new affirmation
        getRandomAffirmation();
      } else {
        // Scroll down - previous affirmation
        goToPreviousAffirmation();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        getRandomAffirmation();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        goToPreviousAffirmation();
      }
    };

    if (currentView === 'main') {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchmove', handleTouchMove, { passive: true });
      document.addEventListener('wheel', handleWheel, { passive: false });
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentView, getRandomAffirmation, goToPreviousAffirmation]);

  // Handle letter click
  const handleLetterClick = (index: number) => {
    if (!rateLimiter.isAllowed('letter-click', 100, 60000)) {
      return;
    }

    setClickedLetters(prev => new Set([...prev, index]));
    
    // Check if all letters are clicked
    const totalLetters = currentAffirmation.text.replace(/\s/g, '').length;
    if (clickedLetters.size + 1 >= totalLetters) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 3000);
    }
  };

  // Toggle bookmark
  const toggleBookmark = () => {
    if (!rateLimiter.isAllowed('bookmark', 10, 60000)) {
      return;
    }

    const isCurrentlyBookmarked = isBookmarked(currentAffirmation.id);
    
    if (isCurrentlyBookmarked) {
      // Remove bookmark
      const updatedBookmarks = bookmarks.filter(b => b.id !== currentAffirmation.id);
      setBookmarks(updatedBookmarks);
      setBookmarkedAffirmations(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentAffirmation.id);
        return newSet;
      });
      secureStorage.setItem('goaly-bookmarks', updatedBookmarks);
    } else {
      // Add bookmark
      const newBookmark: BookmarkedAffirmation = {
        ...currentAffirmation,
        isPinned: false,
        dateAdded: new Date().toISOString()
      };
      const updatedBookmarks = [...bookmarks, newBookmark];
      setBookmarks(updatedBookmarks);
      setBookmarkedAffirmations(prev => new Set([...prev, currentAffirmation.id]));
      secureStorage.setItem('goaly-bookmarks', updatedBookmarks);
    }
  };

  // Share affirmation
  const shareAffirmation = () => {
    if (!rateLimiter.isAllowed('share', 5, 60000)) {
      return;
    }

    const shareUrl = `${window.location.origin}?affirmation=${encodeURIComponent(currentAffirmation.text)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link. Please try again.');
    });
  };

  // Pin/unpin bookmark
  const togglePin = (affirmationId: string) => {
    const updatedBookmarks = bookmarks.map(bookmark =>
      bookmark.id === affirmationId
        ? { ...bookmark, isPinned: !bookmark.isPinned }
        : bookmark
    );
    setBookmarks(updatedBookmarks);
    secureStorage.setItem('goaly-bookmarks', updatedBookmarks);
  };

  // Delete bookmark
  const deleteBookmark = (affirmationId: string) => {
    if (confirm('Are you sure you want to remove this bookmark?')) {
      const updatedBookmarks = bookmarks.filter(b => b.id !== affirmationId);
      setBookmarks(updatedBookmarks);
      setBookmarkedAffirmations(prev => {
        const newSet = new Set(prev);
        newSet.delete(affirmationId);
        return newSet;
      });
      secureStorage.setItem('goaly-bookmarks', updatedBookmarks);
    }
  };

  // Filter affirmations for search
  const getFilteredAffirmations = () => {
    let filtered = affirmations;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Select affirmation from search
  const selectAffirmation = (affirmation: Affirmation) => {
    setCurrentAffirmation(affirmation);
    setClickedLetters(new Set());
    setShowBurst(false);
    setCurrentView('main');
    
    // Add to history
    setAffirmationHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), affirmation];
      return newHistory.slice(-10);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 9));
  };

  // Render letter with effects
  const renderLetter = (char: string, index: number, letterIndex: number) => {
    if (char === ' ') return <span key={index}>&nbsp;</span>;
    
    const isClicked = clickedLetters.has(letterIndex);
    const category = currentAffirmation.category;
    
    return (
      <span
        key={index}
        className={`cursor-pointer transition-all duration-300 ${
          isClicked 
            ? `letter-fill-${category} letter-glow-${category} letter-sparkle`
            : 'hover:scale-110'
        }`}
        onClick={() => handleLetterClick(letterIndex)}
      >
        {char}
      </span>
    );
  };

  // Render burst animation
  const renderBurstAnimation = () => {
    if (!showBurst) return null;

    const icons = [];
    const iconCount = 15;
    
    for (let i = 0; i < iconCount; i++) {
      const angle = (i / iconCount) * 2 * Math.PI;
      const distance = 100 + Math.random() * 100;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      let IconComponent;
      switch (currentAffirmation.category) {
        case 'love':
          IconComponent = '💖';
          break;
        case 'wealth':
          IconComponent = DollarBillIcon;
          break;
        case 'health':
          IconComponent = HealthIcon;
          break;
        case 'learning':
          IconComponent = '⭐';
          break;
        default:
          IconComponent = '✨';
      }
      
      icons.push(
        <div
          key={i}
          className="absolute top-1/2 left-1/2 pointer-events-none"
          style={{
            '--end-x': `${x}px`,
            '--end-y': `${y}px`,
            animation: `heartBurst 2s ease-out forwards`,
            animationDelay: `${i * 0.1}s`
          } as React.CSSProperties}
        >
          {typeof IconComponent === 'string' ? (
            <span className="text-2xl">{IconComponent}</span>
          ) : (
            <IconComponent className="w-6 h-6" />
          )}
        </div>
      );
    }
    
    return <div className="fixed inset-0 pointer-events-none z-50">{icons}</div>;
  };

  // Render main view
  const renderMainView = () => {
    let letterIndex = 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col relative overflow-hidden">
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between p-4 relative z-10">
          <button
            onClick={getRandomAffirmation}
            className="text-white text-xl font-bold font-fredoka-one hover:text-purple-300 transition-colors"
          >
            Goaly
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('bookmarks')}
              className="text-white hover:text-purple-300 transition-colors"
            >
              <Bookmark className="w-6 h-6" />
            </button>
            <button
              onClick={getRandomAffirmation}
              className="text-white hover:text-purple-300 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentView('search')}
              className="text-white hover:text-purple-300 transition-colors"
            >
              <Search className="w-6 h-6" />
            </button>
            <button className="text-white hover:text-purple-300 transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-6 relative">
          <div className="text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight font-fredoka">
              {currentAffirmation.text.split('').map((char, index) => {
                if (char !== ' ') {
                  return renderLetter(char, index, letterIndex++);
                }
                return renderLetter(char, index, letterIndex);
              })}
            </h1>
          </div>
        </div>

        {/* Right Side Icons */}
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 z-20">
          {/* Microphone Icon */}
          <button
            onClick={toggleSpeechRecognition}
            className={`p-3 rounded-full transition-all duration-300 ${
              isListening 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/50' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice commands'}
          >
            <Mic className="w-6 h-6" />
          </button>

          {/* Bookmark Icon */}
          <button
            onClick={toggleBookmark}
            className={`p-3 rounded-full transition-all duration-300 ${
              isBookmarked(currentAffirmation.id)
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Bookmark className="w-6 h-6" />
          </button>

          {/* Share Icon */}
          <button
            onClick={shareAffirmation}
            className="p-3 bg-white/20 text-white rounded-full hover:bg-white/30 transition-all duration-300"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>

        {/* Burst Animation */}
        {renderBurstAnimation()}

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 text-center text-sm">
          <p>Click letters to make them glow • Scroll or swipe for new affirmations</p>
          {historyIndex > 0 && (
            <p className="mt-1">↓ Scroll down to go back</p>
          )}
        </div>
      </div>
    );
  };

  // Render bookmarks view
  const renderBookmarksView = () => {
    const sortedBookmarks = [...bookmarks].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <button
            onClick={() => setCurrentView('main')}
            className="text-white hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-xl font-bold font-fredoka">Bookmarks</h1>
          <div className="w-6"></div>
        </div>

        {/* Bookmarks List */}
        <div className="p-4 space-y-4">
          {sortedBookmarks.length === 0 ? (
            <div className="text-center text-white/70 py-12">
              <Bookmark className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No bookmarks yet</p>
              <p className="text-sm mt-2">Save affirmations to see them here</p>
            </div>
          ) : (
            sortedBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p 
                      className="text-white font-medium cursor-pointer hover:text-purple-300 transition-colors"
                      onClick={() => selectAffirmation(bookmark)}
                    >
                      {bookmark.text}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        bookmark.category === 'love' ? 'bg-pink-500/30 text-pink-200' :
                        bookmark.category === 'wealth' ? 'bg-green-500/30 text-green-200' :
                        bookmark.category === 'health' ? 'bg-blue-500/30 text-blue-200' :
                        'bg-yellow-500/30 text-yellow-200'
                      }`}>
                        {bookmark.category}
                      </span>
                      <span className="text-white/50 text-xs">
                        {new Date(bookmark.dateAdded).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => togglePin(bookmark.id)}
                      className={`p-2 rounded-full transition-colors ${
                        bookmark.isPinned 
                          ? 'text-blue-400 hover:text-blue-300' 
                          : 'text-white/50 hover:text-white/70'
                      }`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteBookmark(bookmark.id)}
                      className="p-2 text-white/50 hover:text-red-400 transition-colors rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Render search view
  const renderSearchView = () => {
    const filteredAffirmations = getFilteredAffirmations();

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <button
            onClick={() => setCurrentView('main')}
            className="text-white hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-xl font-bold font-fredoka">Search</h1>
          <div className="w-6"></div>
        </div>

        {/* Search Controls */}
        <div className="p-4 space-y-4">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search affirmations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
          />

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {['all', 'love', 'wealth', 'health', 'learning'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="p-4 space-y-3">
          {filteredAffirmations.length === 0 ? (
            <div className="text-center text-white/70 py-12">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No affirmations found</p>
              <p className="text-sm mt-2">Try adjusting your search or category filter</p>
            </div>
          ) : (
            filteredAffirmations.map((affirmation) => (
              <div
                key={affirmation.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => selectAffirmation(affirmation)}
              >
                <p className="text-white font-medium">{affirmation.text}</p>
                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                  affirmation.category === 'love' ? 'bg-pink-500/30 text-pink-200' :
                  affirmation.category === 'wealth' ? 'bg-green-500/30 text-green-200' :
                  affirmation.category === 'health' ? 'bg-blue-500/30 text-blue-200' :
                  'bg-yellow-500/30 text-yellow-200'
                }`}>
                  {affirmation.category}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Main render
  switch (currentView) {
    case 'bookmarks':
      return renderBookmarksView();
    case 'search':
      return renderSearchView();
    default:
      return renderMainView();
  }
};

export default App;