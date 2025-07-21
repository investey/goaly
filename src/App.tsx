import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bookmark, Share2, Search, Menu, Plus, ArrowLeft, ThumbsUp as Thumbtack, X, Mic } from 'lucide-react';
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
}

const affirmations: Affirmation[] = [
  // Love & Self-Love Affirmations
  { id: '1', text: 'I am worthy of love and respect', category: 'love' },
  { id: '2', text: 'I choose to love myself unconditionally', category: 'love' },
  { id: '3', text: 'I attract loving relationships into my life', category: 'love' },
  { id: '4', text: 'I am enough exactly as I am', category: 'love' },
  { id: '5', text: 'I radiate love and positivity', category: 'love' },
  { id: '6', text: 'I deserve happiness and joy', category: 'love' },
  { id: '7', text: 'I am beautiful inside and out', category: 'love' },
  { id: '8', text: 'I forgive myself and others with ease', category: 'love' },
  { id: '9', text: 'I am grateful for all the love in my life', category: 'love' },
  { id: '10', text: 'I trust in the power of love', category: 'love' },

  // Wealth & Business Affirmations
  { id: '11', text: 'I am a magnet for financial abundance', category: 'wealth' },
  { id: '12', text: 'Money flows to me easily and effortlessly', category: 'wealth' },
  { id: '13', text: 'I create multiple streams of income', category: 'wealth' },
  { id: '14', text: 'I am worthy of financial success', category: 'wealth' },
  { id: '15', text: 'My business grows and prospers daily', category: 'wealth' },
  { id: '16', text: 'I make wise financial decisions', category: 'wealth' },
  { id: '17', text: 'Opportunities for wealth surround me', category: 'wealth' },
  { id: '18', text: 'I am financially free and independent', category: 'wealth' },
  { id: '19', text: 'I attract prosperity in all areas of my life', category: 'wealth' },
  { id: '20', text: 'I am grateful for my abundant wealth', category: 'wealth' },

  // Health & Fitness Affirmations
  { id: '21', text: 'I am healthy, strong, and vibrant', category: 'health' },
  { id: '22', text: 'My body heals quickly and naturally', category: 'health' },
  { id: '23', text: 'I choose foods that nourish my body', category: 'health' },
  { id: '24', text: 'I enjoy exercising and moving my body', category: 'health' },
  { id: '25', text: 'I am full of energy and vitality', category: 'health' },
  { id: '26', text: 'I sleep peacefully and wake refreshed', category: 'health' },
  { id: '27', text: 'I listen to my body and honor its needs', category: 'health' },
  { id: '28', text: 'I am grateful for my healthy body', category: 'health' },
  { id: '29', text: 'I radiate health and wellness', category: 'health' },
  { id: '30', text: 'Every cell in my body vibrates with health', category: 'health' },

  // Learning & Growth Affirmations
  { id: '31', text: 'I am constantly learning and growing', category: 'learning' },
  { id: '32', text: 'I embrace challenges as opportunities', category: 'learning' },
  { id: '33', text: 'My mind is sharp and focused', category: 'learning' },
  { id: '34', text: 'I absorb new information easily', category: 'learning' },
  { id: '35', text: 'I am curious and open to new experiences', category: 'learning' },
  { id: '36', text: 'I trust in my ability to learn anything', category: 'learning' },
  { id: '37', text: 'Knowledge comes to me naturally', category: 'learning' },
  { id: '38', text: 'I am wise and make good decisions', category: 'learning' },
  { id: '39', text: 'I grow stronger through every experience', category: 'learning' },
  { id: '40', text: 'I am grateful for my expanding wisdom', category: 'learning' },
];

const App: React.FC = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation | null>(null);
  const [clickedLetters, setClickedLetters] = useState<Set<number>>(new Set());
  const [showBurst, setShowBurst] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkedAffirmation[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'bookmarks' | 'search'>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Affirmation[]>([]);
  const [affirmationHistory, setAffirmationHistory] = useState<Affirmation[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
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

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setMicPermission('denied');
          alert('Microphone access denied. Please enable microphone permissions in your browser settings to use voice commands.');
        }
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('Voice command:', transcript);
        
        if (transcript.includes('new') || transcript.includes('next')) {
          getNewAffirmation();
        } else if (transcript.includes('back') || transcript.includes('previous')) {
          goToPreviousAffirmation();
        } else if (transcript.includes('bookmark') || transcript.includes('save')) {
          toggleBookmark();
        } else if (transcript.includes('share')) {
          shareAffirmation();
        }
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
      alert('Microphone access is required for voice commands. Please enable microphone permissions in your browser settings.');
      return false;
    }
  };

  // Toggle voice recognition
  const toggleVoiceRecognition = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (micPermission === 'prompt') {
      const granted = await requestMicPermission();
      if (!granted) return;
    } else if (micPermission === 'denied') {
      alert('Microphone access denied. Please enable microphone permissions in your browser settings.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  };

  // Load bookmarks from localStorage on component mount
  useEffect(() => {
    const savedBookmarks = secureStorage.getItem('goaly-bookmarks');
    if (savedBookmarks && Array.isArray(savedBookmarks)) {
      setBookmarks(savedBookmarks);
    }
  }, []);

  // Check if current affirmation is bookmarked
  const checkIfBookmarked = useCallback((affirmation: Affirmation | null) => {
    if (!affirmation) {
      setIsBookmarked(false);
      return;
    }
    const bookmarked = bookmarks.some(bookmark => bookmark.id === affirmation.id);
    setIsBookmarked(bookmarked);
  }, [bookmarks]);

  // Update bookmark status when current affirmation or bookmarks change
  useEffect(() => {
    checkIfBookmarked(currentAffirmation);
  }, [currentAffirmation, bookmarks, checkIfBookmarked]);

  // Get random affirmation
  const getRandomAffirmation = useCallback((): Affirmation => {
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    return affirmations[randomIndex];
  }, []);

  // Get new affirmation and add to history
  const getNewAffirmation = useCallback(() => {
    if (!rateLimiter.isAllowed('new-affirmation', 20, 60000)) {
      return;
    }

    const newAffirmation = getRandomAffirmation();
    
    // Add current affirmation to history before changing
    if (currentAffirmation) {
      setAffirmationHistory(prev => {
        const newHistory = [currentAffirmation, ...prev.slice(0, 9)]; // Keep last 10
        return newHistory;
      });
    }
    
    setCurrentAffirmation(newAffirmation);
    setClickedLetters(new Set());
    setShowBurst(false);
    setHistoryIndex(-1); // Reset to current
  }, [currentAffirmation, getRandomAffirmation]);

  // Go to previous affirmation
  const goToPreviousAffirmation = useCallback(() => {
    if (historyIndex < affirmationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentAffirmation(affirmationHistory[newIndex]);
      setClickedLetters(new Set());
      setShowBurst(false);
    }
  }, [historyIndex, affirmationHistory]);

  // Go to next affirmation (forward in history)
  const goToNextAffirmation = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentAffirmation(affirmationHistory[newIndex]);
      setClickedLetters(new Set());
      setShowBurst(false);
    } else if (historyIndex === 0) {
      // Go back to current (most recent)
      setHistoryIndex(-1);
      if (affirmationHistory.length > 0) {
        setCurrentAffirmation(affirmationHistory[0]);
        setClickedLetters(new Set());
        setShowBurst(false);
      }
    }
  }, [historyIndex, affirmationHistory]);

  // Initialize with first affirmation
  useEffect(() => {
    if (!currentAffirmation) {
      const initialAffirmation = getRandomAffirmation();
      setCurrentAffirmation(initialAffirmation);
    }
  }, [currentAffirmation, getRandomAffirmation]);

  // Handle letter click
  const handleLetterClick = (index: number) => {
    if (!rateLimiter.isAllowed('letter-click', 100, 60000)) {
      return;
    }

    setClickedLetters(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  };

  // Check if all letters are clicked
  useEffect(() => {
    if (!currentAffirmation) return;
    
    const totalLetters = currentAffirmation.text.replace(/\s/g, '').length;
    if (clickedLetters.size === totalLetters) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 2000);
    }
  }, [clickedLetters, currentAffirmation]);

  // Toggle bookmark
  const toggleBookmark = () => {
    if (!currentAffirmation) return;
    
    if (!rateLimiter.isAllowed('bookmark', 50, 60000)) {
      return;
    }

    setBookmarks(prev => {
      const existingIndex = prev.findIndex(bookmark => bookmark.id === currentAffirmation.id);
      let newBookmarks;
      
      if (existingIndex >= 0) {
        // Remove bookmark
        newBookmarks = prev.filter(bookmark => bookmark.id !== currentAffirmation.id);
      } else {
        // Add bookmark
        const newBookmark: BookmarkedAffirmation = {
          ...currentAffirmation,
          isPinned: false
        };
        newBookmarks = [...prev, newBookmark];
      }
      
      secureStorage.setItem('goaly-bookmarks', newBookmarks);
      return newBookmarks;
    });
  };

  // Toggle pin status
  const togglePin = (affirmationId: string) => {
    if (!rateLimiter.isAllowed('pin', 20, 60000)) {
      return;
    }

    setBookmarks(prev => {
      const newBookmarks = prev.map(bookmark => 
        bookmark.id === affirmationId 
          ? { ...bookmark, isPinned: !bookmark.isPinned }
          : bookmark
      );
      secureStorage.setItem('goaly-bookmarks', newBookmarks);
      return newBookmarks;
    });
  };

  // Remove bookmark
  const removeBookmark = (affirmationId: string) => {
    if (!rateLimiter.isAllowed('remove-bookmark', 20, 60000)) {
      return;
    }

    if (confirm('Are you sure you want to remove this bookmark?')) {
      setBookmarks(prev => {
        const newBookmarks = prev.filter(bookmark => bookmark.id !== affirmationId);
        secureStorage.setItem('goaly-bookmarks', newBookmarks);
        return newBookmarks;
      });
    }
  };

  // Share affirmation
  const shareAffirmation = () => {
    if (!currentAffirmation) return;
    
    if (!rateLimiter.isAllowed('share', 10, 60000)) {
      return;
    }

    const shareUrl = `${window.location.origin}?affirmation=${encodeURIComponent(currentAffirmation.id)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy link. Please try again.');
    });
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = affirmations.filter(affirmation =>
        affirmation.text.toLowerCase().includes(query.toLowerCase()) ||
        affirmation.category.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  // Select affirmation from search
  const selectAffirmation = (affirmation: Affirmation) => {
    // Add current affirmation to history before changing
    if (currentAffirmation) {
      setAffirmationHistory(prev => {
        const newHistory = [currentAffirmation, ...prev.slice(0, 9)];
        return newHistory;
      });
    }
    
    setCurrentAffirmation(affirmation);
    setClickedLetters(new Set());
    setShowBurst(false);
    setCurrentView('main');
    setHistoryIndex(-1);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (currentView !== 'main') return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          getNewAffirmation();
          break;
        case 'ArrowDown':
          e.preventDefault();
          goToPreviousAffirmation();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPreviousAffirmation();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextAffirmation();
          break;
        case ' ':
          e.preventDefault();
          toggleBookmark();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentView, getNewAffirmation, goToPreviousAffirmation, goToNextAffirmation, toggleBookmark]);

  // Handle touch/swipe gestures
  useEffect(() => {
    let startY = 0;
    let startX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (currentView !== 'main') return;
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (currentView !== 'main') return;
      
      const endY = e.changedTouches[0].clientY;
      const endX = e.changedTouches[0].clientX;
      const deltaY = startY - endY;
      const deltaX = startX - endX;

      // Vertical swipes
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          // Swipe up - new affirmation
          getNewAffirmation();
        } else {
          // Swipe down - previous affirmation
          goToPreviousAffirmation();
        }
      }
      // Horizontal swipes
      else if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // Swipe left - previous affirmation
          goToPreviousAffirmation();
        } else {
          // Swipe right - next affirmation (forward in history)
          goToNextAffirmation();
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentView, getNewAffirmation, goToPreviousAffirmation, goToNextAffirmation]);

  // Handle scroll navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (currentView !== 'main') return;
      
      e.preventDefault();
      
      if (e.deltaY < 0) {
        // Scroll up - new affirmation
        getNewAffirmation();
      } else {
        // Scroll down - previous affirmation
        goToPreviousAffirmation();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentView, getNewAffirmation, goToPreviousAffirmation]);

  // Get category colors
  const getCategoryColors = (category: string) => {
    switch (category) {
      case 'love':
        return {
          fill: 'letter-fill',
          glow: 'letter-glow',
          bg: 'from-pink-400 to-rose-500'
        };
      case 'wealth':
        return {
          fill: 'letter-fill-wealth',
          glow: 'letter-glow-wealth',
          bg: 'from-green-400 to-emerald-500'
        };
      case 'health':
        return {
          fill: 'letter-fill-health',
          glow: 'letter-glow-health',
          bg: 'from-blue-400 to-indigo-500'
        };
      case 'learning':
        return {
          fill: 'letter-fill-learning',
          glow: 'letter-glow-learning',
          bg: 'from-yellow-400 to-amber-500'
        };
      default:
        return {
          fill: 'letter-fill',
          glow: 'letter-glow',
          bg: 'from-pink-400 to-rose-500'
        };
    }
  };

  // Create burst animation
  const createBurstAnimation = () => {
    if (!currentAffirmation) return null;

    const icons = [];
    const iconCount = 12;
    
    for (let i = 0; i < iconCount; i++) {
      const angle = (i / iconCount) * 2 * Math.PI;
      const distance = 100 + Math.random() * 50;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;
      
      let IconComponent;
      switch (currentAffirmation.category) {
        case 'love':
          IconComponent = '❤️';
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
          IconComponent = '❤️';
      }

      icons.push(
        <div
          key={i}
          className="absolute top-1/2 left-1/2 pointer-events-none"
          style={{
            '--end-x': `${endX}px`,
            '--end-y': `${endY}px`,
            animation: `heartBurst 1.5s ease-out forwards`,
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
    
    return icons;
  };

  // Render letter with click handling
  const renderLetter = (char: string, index: number, letterIndex: number) => {
    if (char === ' ') {
      return <span key={index} className="inline-block w-4"></span>;
    }

    const isClicked = clickedLetters.has(letterIndex);
    const colors = currentAffirmation ? getCategoryColors(currentAffirmation.category) : getCategoryColors('love');

    return (
      <span
        key={index}
        className={`inline-block cursor-pointer transition-all duration-300 select-none ${
          isClicked 
            ? `${colors.fill} ${colors.glow} letter-sparkle transform scale-110` 
            : 'text-gray-800 hover:text-gray-600'
        }`}
        onClick={() => handleLetterClick(letterIndex)}
        style={{ 
          fontFamily: 'Fredoka One, cursive',
          textShadow: isClicked ? '0 0 20px rgba(255, 255, 255, 0.5)' : 'none'
        }}
      >
        {char}
      </span>
    );
  };

  // Get sorted bookmarks (pinned first)
  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  // Filter search results by category
  const getAffirmationsByCategory = (category: string) => {
    return affirmations.filter(affirmation => affirmation.category === category);
  };

  if (!currentAffirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your affirmation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 relative overflow-hidden">
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4">
        <div className="flex items-center space-x-4">
          {currentView !== 'main' ? (
            <button
              onClick={() => setCurrentView('main')}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
          ) : (
            <button
              onClick={getNewAffirmation}
              className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors font-bold text-gray-800"
              style={{ fontFamily: 'Fredoka One, cursive' }}
            >
              Goaly
            </button>
          )}
        </div>

        {currentView === 'main' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentView('bookmarks')}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
            >
              <Bookmark className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={getNewAffirmation}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
            >
              <Plus className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={() => setCurrentView('search')}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
            >
              <Search className="w-6 h-6 text-gray-700" />
            </button>
            <button className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        )}
      </div>

      {/* Right Side Icons */}
      {currentView === 'main' && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 flex flex-col space-y-4">
          <button
            onClick={toggleVoiceRecognition}
            className={`p-3 rounded-full shadow-lg transition-all ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : micPermission === 'denied'
                ? 'bg-gray-300 text-gray-500'
                : 'bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700'
            }`}
            disabled={micPermission === 'denied'}
          >
            <Mic className="w-6 h-6" />
          </button>
          <button
            onClick={toggleBookmark}
            className={`p-3 rounded-full shadow-lg transition-all ${
              isBookmarked 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700'
            }`}
          >
            <Bookmark className="w-6 h-6" />
          </button>
          <button
            onClick={shareAffirmation}
            className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors text-gray-700"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Main Content */}
      {currentView === 'main' && (
        <div className="flex items-center justify-center min-h-screen p-8 relative">
          <div className="text-center max-w-4xl mx-auto relative">
            <div 
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 relative"
              style={{ fontFamily: 'Fredoka One, cursive' }}
            >
              {currentAffirmation.text.split('').map((char, index) => {
                const letterIndex = currentAffirmation.text.substring(0, index).replace(/\s/g, '').length;
                return renderLetter(char, index, letterIndex);
              })}
              
              {/* Burst Animation */}
              {showBurst && (
                <div className="absolute inset-0 pointer-events-none">
                  {createBurstAnimation()}
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-600 mb-4">
              Tap each letter to make it glow ✨
            </div>
            
            <div className="text-xs text-gray-500">
              Swipe up for new • Swipe down for previous
            </div>
          </div>
        </div>
      )}

      {/* Bookmarks View */}
      {currentView === 'bookmarks' && (
        <div className="pt-20 pb-8 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center" style={{ fontFamily: 'Fredoka One, cursive' }}>
              Your Bookmarks
            </h2>
            
            {sortedBookmarks.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No bookmarks yet</p>
                <p className="text-gray-400 text-sm">Save your favorite affirmations to see them here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => selectAffirmation(bookmark)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-lg font-medium text-gray-800 mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                          {bookmark.text}
                        </p>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColors(bookmark.category).bg} text-white`}>
                          {bookmark.category}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePin(bookmark.id);
                          }}
                          className={`p-2 rounded-full transition-colors ${
                            bookmark.isPinned 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          <Thumbtack className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeBookmark(bookmark.id);
                          }}
                          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search View */}
      {currentView === 'search' && (
        <div className="pt-20 pb-8 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center" style={{ fontFamily: 'Fredoka One, cursive' }}>
              Find Affirmations
            </h2>
            
            {/* Search Input */}
            <div className="mb-8">
              <input
                type="text"
                placeholder="Search affirmations..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                style={{ fontFamily: 'Fredoka, sans-serif' }}
              />
            </div>

            {/* Category Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { name: 'Love', category: 'love', color: 'from-pink-400 to-rose-500' },
                { name: 'Wealth', category: 'wealth', color: 'from-green-400 to-emerald-500' },
                { name: 'Health', category: 'health', color: 'from-blue-400 to-indigo-500' },
                { name: 'Learning', category: 'learning', color: 'from-yellow-400 to-amber-500' }
              ].map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => {
                    const categoryAffirmations = getAffirmationsByCategory(cat.category);
                    setSearchResults(categoryAffirmations);
                    setSearchQuery(cat.name);
                  }}
                  className={`p-4 rounded-lg bg-gradient-to-r ${cat.color} text-white font-medium hover:shadow-lg transition-shadow`}
                  style={{ fontFamily: 'Fredoka, sans-serif' }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  Results ({searchResults.length})
                </h3>
                {searchResults.map((affirmation) => (
                  <div
                    key={affirmation.id}
                    className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => selectAffirmation(affirmation)}
                  >
                    <p className="text-lg font-medium text-gray-800 mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                      {affirmation.text}
                    </p>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColors(affirmation.category).bg} text-white`}>
                      {affirmation.category}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No results found</p>
                <p className="text-gray-400 text-sm">Try a different search term</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;