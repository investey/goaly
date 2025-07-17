import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Bookmark, Share2, Search, Menu, Plus, ArrowLeft, Pin, X } from 'lucide-react';
import { DollarBillIcon } from './components/DollarBillIcon';
import { HealthIcon } from './components/HealthIcon';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

interface Affirmation {
  id: string;
  text: string;
  category: 'love' | 'wealth' | 'health' | 'learning';
}

interface BookmarkedAffirmation extends Affirmation {
  isPinned: boolean;
}

// ============================================================================
// CONSTANTS AND DATA
// ============================================================================

const affirmations: Affirmation[] = [
  // Love & Self-Love Affirmations
  { id: '1', text: 'I am worthy of love and respect', category: 'love' },
  { id: '2', text: 'I radiate love and attract loving relationships', category: 'love' },
  { id: '3', text: 'I love and accept myself completely', category: 'love' },
  { id: '4', text: 'My heart is open to giving and receiving love', category: 'love' },
  { id: '5', text: 'I deserve happiness and joy in my life', category: 'love' },
  { id: '6', text: 'I am beautiful inside and out', category: 'love' },
  { id: '7', text: 'Love flows freely through my life', category: 'love' },
  { id: '8', text: 'I attract positive and loving people', category: 'love' },
  { id: '9', text: 'I am grateful for all the love in my life', category: 'love' },
  { id: '10', text: 'I choose to see the good in myself and others', category: 'love' },

  // Wealth & Business Affirmations
  { id: '11', text: 'I am a magnet for financial abundance', category: 'wealth' },
  { id: '12', text: 'Money flows to me easily and effortlessly', category: 'wealth' },
  { id: '13', text: 'I create multiple streams of income', category: 'wealth' },
  { id: '14', text: 'My business grows and prospers every day', category: 'wealth' },
  { id: '15', text: 'I make wise financial decisions', category: 'wealth' },
  { id: '16', text: 'Opportunities for wealth surround me', category: 'wealth' },
  { id: '17', text: 'I am worthy of financial success', category: 'wealth' },
  { id: '18', text: 'My income increases consistently', category: 'wealth' },
  { id: '19', text: 'I attract profitable business ventures', category: 'wealth' },
  { id: '20', text: 'Wealth and prosperity are my natural state', category: 'wealth' },

  // Health & Fitness Affirmations
  { id: '21', text: 'My body is strong and healthy', category: 'health' },
  { id: '22', text: 'I nourish my body with healthy choices', category: 'health' },
  { id: '23', text: 'Every cell in my body vibrates with energy', category: 'health' },
  { id: '24', text: 'I am committed to my fitness goals', category: 'health' },
  { id: '25', text: 'My mind and body are in perfect harmony', category: 'health' },
  { id: '26', text: 'I choose foods that fuel my body', category: 'health' },
  { id: '27', text: 'Exercise brings me joy and vitality', category: 'health' },
  { id: '28', text: 'I sleep peacefully and wake refreshed', category: 'health' },
  { id: '29', text: 'My immune system is strong and protective', category: 'health' },
  { id: '30', text: 'I radiate health and wellness', category: 'health' },

  // Learning & Growth Affirmations
  { id: '31', text: 'I am constantly learning and growing', category: 'learning' },
  { id: '32', text: 'My mind is open to new possibilities', category: 'learning' },
  { id: '33', text: 'I embrace challenges as opportunities', category: 'learning' },
  { id: '34', text: 'Knowledge comes easily to me', category: 'learning' },
  { id: '35', text: 'I am curious and eager to learn', category: 'learning' },
  { id: '36', text: 'Every experience teaches me something valuable', category: 'learning' },
  { id: '37', text: 'I have unlimited potential for growth', category: 'learning' },
  { id: '38', text: 'I trust in my ability to learn new skills', category: 'learning' },
  { id: '39', text: 'Wisdom flows through me naturally', category: 'learning' },
  { id: '40', text: 'I am becoming the best version of myself', category: 'learning' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const App: React.FC = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation>(affirmations[0]);
  const [clickedLetters, setClickedLetters] = useState<Set<number>>(new Set());
  const [showHearts, setShowHearts] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkedAffirmation[]>([]);
  const [currentView, setCurrentView] = useState<'main' | 'bookmarks' | 'search'>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [affirmationHistory, setAffirmationHistory] = useState<Affirmation[]>([affirmations[0]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [holdStartTime, setHoldStartTime] = useState<number | null>(null);
  const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.lang = 'en-US';
      recognitionInstance.maxAlternatives = 1;
      
      recognitionInstance.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };
      
      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        if (isContinuousMode) {
          // Restart recognition in continuous mode
          try {
            recognitionInstance.start();
          } catch (error) {
            console.error('Error restarting recognition:', error);
            setIsListening(false);
            setIsContinuousMode(false);
          }
        } else {
          setIsListening(false);
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access and try again.');
        }
      };
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        console.log('Speech result:', transcript);
        handleSpeechResult(transcript);
      };
      
      setRecognition(recognitionInstance);
      recognitionRef.current = recognitionInstance;
    }
  }, [isContinuousMode]);

  const getRandomAffirmation = useCallback((): Affirmation => {
    const availableAffirmations = affirmations.filter(a => a.id !== currentAffirmation.id);
    return availableAffirmations[Math.floor(Math.random() * availableAffirmations.length)];
  }, [currentAffirmation.id]);

  const getCategoryClass = (category: string): string => {
    switch (category) {
      case 'love': return 'letter-fill';
      case 'wealth': return 'letter-fill-wealth';
      case 'health': return 'letter-fill-health';
      case 'learning': return 'letter-fill-learning';
      default: return 'letter-fill';
    }
  };

  const getCategoryGlowClass = (category: string): string => {
    switch (category) {
      case 'love': return 'letter-glow';
      case 'wealth': return 'letter-glow-wealth';
      case 'health': return 'letter-glow-health';
      case 'learning': return 'letter-glow-learning';
      default: return 'letter-glow';
    }
  };

  const startListening = () => {
    if (!recognition) {
      console.log('Speech recognition not available');
      return;
    }
    
    // Reset any existing progress
    setClickedLetters(new Set());
    setShowHearts(false);
    
    // Configure recognition based on mode
    recognition.continuous = isContinuousMode;
    recognition.interimResults = isContinuousMode;
    
    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.continuous = false;
      recognition.stop();
    }
    setIsListening(false);
    setIsContinuousMode(false);
  };

  const handleSpeechResult = (transcript: string) => {
    const words = transcript.split(' ');
    const affirmationWords = currentAffirmation.text.toLowerCase().split(' ');
    
    let newClickedLetters = new Set(clickedLetters);
    let letterIndex = 0;
    
    for (const word of affirmationWords) {
      if (words.some(spokenWord => word.includes(spokenWord) || spokenWord.includes(word))) {
        for (let i = 0; i < word.length; i++) {
          if (currentAffirmation.text[letterIndex] !== ' ') {
            newClickedLetters.add(letterIndex);
          }
          letterIndex++;
        }
      } else {
        letterIndex += word.length;
      }
      letterIndex++; // Skip space
    }
    
    setClickedLetters(newClickedLetters);
    
    const totalLetters = currentAffirmation.text.replace(/\s/g, '').length;
    if (newClickedLetters.size >= totalLetters) {
      triggerBurstAnimation();
    }
  };

  const handleMicrophoneMouseDown = () => {
    setHoldStartTime(Date.now());
    const timer = setTimeout(() => {
      // After 5 seconds, enable continuous mode and start listening
      setIsContinuousMode(true);
      startListening();
      console.log('Continuous listening mode enabled');
    }, 5000);
    setHoldTimer(timer);
  };

  const handleMicrophoneMouseUp = () => {
    const holdDuration = holdStartTime ? Date.now() - holdStartTime : 0;
    
    if (holdTimer) {
      clearTimeout(holdTimer);
      setHoldTimer(null);
    }
    
    setHoldStartTime(null);
    
    if (holdDuration < 5000) {
      // Short press - normal single listening or stop continuous mode
      if (isContinuousMode) {
        stopListening();
      } else {
        setIsContinuousMode(false);
        startListening();
      }
    }
    // Long press is handled by the timeout
  };

  const handleLetterClick = (index: number) => {
    if (currentAffirmation.text[index] === ' ') return;
    
    const newClickedLetters = new Set(clickedLetters);
    newClickedLetters.add(index);
    setClickedLetters(newClickedLetters);
    
    const totalLetters = currentAffirmation.text.replace(/\s/g, '').length;
    if (newClickedLetters.size >= totalLetters) {
      triggerBurstAnimation();
    }
  };

  const triggerBurstAnimation = () => {
    setShowHearts(true);
    setTimeout(() => setShowHearts(false), 2000);
  };

  const renderBurstIcon = (index: number) => {
    const category = currentAffirmation.category;
    const baseClasses = "absolute w-6 h-6 pointer-events-none";
    
    switch (category) {
      case 'love':
        return <Heart key={index} className={`${baseClasses} text-pink-500 fill-current`} />;
      case 'wealth':
        return <DollarBillIcon key={index} className={`${baseClasses} w-8 h-6`} />;
      case 'health':
        return <HealthIcon key={index} className={`${baseClasses} w-6 h-6`} />;
      case 'learning':
        return <span key={index} className={`${baseClasses} text-yellow-500 text-2xl`}>⭐</span>;
      default:
        return <Heart key={index} className={`${baseClasses} text-pink-500 fill-current`} />;
    }
  };

  const handleNewAffirmation = () => {
    const newAffirmation = getRandomAffirmation();
    setCurrentAffirmation(newAffirmation);
    setClickedLetters(new Set());
    setShowHearts(false);
    
    const newHistory = affirmationHistory.slice(0, historyIndex + 1);
    newHistory.push(newAffirmation);
    if (newHistory.length > 10) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    setAffirmationHistory(newHistory);
  };

  const handlePreviousAffirmation = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentAffirmation(affirmationHistory[newIndex]);
      setClickedLetters(new Set());
      setShowHearts(false);
    }
  };

  const handleGoToMain = () => {
    const newAffirmation = getRandomAffirmation();
    setCurrentAffirmation(newAffirmation);
    setCurrentView('main');
    setClickedLetters(new Set());
    setShowHearts(false);
    
    const newHistory = [...affirmationHistory, newAffirmation];
    if (newHistory.length > 10) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    setAffirmationHistory(newHistory);
  };

  const loadBookmarks = useCallback(() => {
    const saved = localStorage.getItem('affirmationBookmarks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBookmarks(Array.isArray(parsed) ? parsed : []);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
        setBookmarks([]);
      }
    }
  }, []);

  const saveBookmarks = useCallback((newBookmarks: BookmarkedAffirmation[]) => {
    localStorage.setItem('affirmationBookmarks', JSON.stringify(newBookmarks));
    setBookmarks(newBookmarks);
  }, []);

  const isBookmarked = (affirmation: Affirmation): boolean => {
    return bookmarks.some(bookmark => bookmark.id === affirmation.id);
  };

  const toggleBookmark = () => {
    if (isBookmarked(currentAffirmation)) {
      const newBookmarks = bookmarks.filter(bookmark => bookmark.id !== currentAffirmation.id);
      saveBookmarks(newBookmarks);
    } else {
      const newBookmark: BookmarkedAffirmation = {
        ...currentAffirmation,
        isPinned: false
      };
      const newBookmarks = [...bookmarks, newBookmark];
      saveBookmarks(newBookmarks);
    }
  };

  const togglePin = (affirmationId: string) => {
    const newBookmarks = bookmarks.map(bookmark =>
      bookmark.id === affirmationId
        ? { ...bookmark, isPinned: !bookmark.isPinned }
        : bookmark
    );
    saveBookmarks(newBookmarks);
  };

  const removeBookmark = (affirmationId: string) => {
    const newBookmarks = bookmarks.filter(bookmark => bookmark.id !== affirmationId);
    saveBookmarks(newBookmarks);
  };

  const getSortedBookmarks = (): BookmarkedAffirmation[] => {
    return [...bookmarks].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  };

  const getFilteredAffirmations = (): Affirmation[] => {
    let filtered = affirmations;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(affirmation => affirmation.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(affirmation =>
        affirmation.text.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const selectAffirmation = (affirmation: Affirmation) => {
    setCurrentAffirmation(affirmation);
    setCurrentView('main');
    setClickedLetters(new Set());
    setShowHearts(false);
    
    const newHistory = affirmationHistory.slice(0, historyIndex + 1);
    newHistory.push(affirmation);
    if (newHistory.length > 10) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    setAffirmationHistory(newHistory);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}?affirmation=${encodeURIComponent(currentAffirmation.id)}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Unable to copy link. Please try again.');
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (currentView !== 'main') return;
    
    if (e.deltaY < 0) {
      handleNewAffirmation();
    } else if (e.deltaY > 0) {
      handlePreviousAffirmation();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (currentView !== 'main') return;
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (currentView !== 'main' || !touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaY = touchStart.y - touch.clientY;
    const deltaX = Math.abs(touchStart.x - touch.clientX);
    
    if (Math.abs(deltaY) > 50 && deltaX < 100) {
      if (deltaY > 0) {
        handleNewAffirmation();
      } else {
        handlePreviousAffirmation();
      }
    }
    
    setTouchStart(null);
  };

  useEffect(() => {
    loadBookmarks();
    
    const urlParams = new URLSearchParams(window.location.search);
    const affirmationId = urlParams.get('affirmation');
    if (affirmationId) {
      const foundAffirmation = affirmations.find(a => a.id === affirmationId);
      if (foundAffirmation) {
        setCurrentAffirmation(foundAffirmation);
        setAffirmationHistory([foundAffirmation]);
        setHistoryIndex(0);
      }
    }
  }, [loadBookmarks]);

  const renderMainView = () => (
    <div 
      className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="text-center max-w-4xl mx-auto relative">
        <div className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 relative">
          {currentAffirmation.text.split('').map((char, index) => {
            const isClicked = clickedLetters.has(index);
            const isSpace = char === ' ';
            
            return (
              <span
                key={index}
                className={`
                  inline-block cursor-pointer transition-all duration-300 select-none
                  ${isSpace ? 'w-4' : ''}
                  ${isClicked ? `${getCategoryClass(currentAffirmation.category)} ${getCategoryGlowClass(currentAffirmation.category)} letter-sparkle transform scale-110` : 'text-gray-800 hover:text-gray-600'}
                `}
                onClick={() => handleLetterClick(index)}
                style={{ 
                  fontFamily: "'Fredoka One', cursive",
                  textShadow: isClicked ? '0 0 20px rgba(255, 255, 255, 0.5)' : 'none'
                }}
              >
                {isSpace ? '\u00A0' : char}
              </span>
            );
          })}
        </div>
        
        {showHearts && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }, (_, i) => {
              const randomX = Math.random() * 100 - 50;
              const randomY = Math.random() * 100 - 50;
              const delay = Math.random() * 0.5;
              
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 animate-ping"
                  style={{
                    '--end-x': `${randomX}px`,
                    '--end-y': `${randomY}px`,
                    animationDelay: `${delay}s`,
                    animationDuration: '1.5s',
                    animationName: 'heartBurst'
                  } as React.CSSProperties}
                >
                  {renderBurstIcon(i)}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-10">
        <button
          onClick={toggleBookmark}
          className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
            isBookmarked(currentAffirmation)
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Bookmark className="w-6 h-6" />
        </button>
        
        <button
          onClick={handleShare}
          className="p-3 bg-white text-gray-600 rounded-full shadow-lg hover:bg-gray-50 transition-all duration-200"
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>
      
      <div className="fixed bottom-8 right-8">
        <button
          onMouseDown={handleMicrophoneMouseDown}
          onMouseUp={handleMicrophoneMouseUp}
          onTouchStart={handleMicrophoneMouseDown}
          onTouchEnd={handleMicrophoneMouseUp}
          className={`p-4 rounded-full shadow-lg transition-all duration-200 ${
            isContinuousMode 
              ? 'bg-green-500 text-white' 
              : isListening 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="w-8 h-8 bg-current rounded-full"></div>
        </button>
      </div>
    </div>
  );

  const renderBookmarksView = () => (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
          Saved Affirmations
        </h2>
        
        {bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No saved affirmations yet</p>
            <p className="text-gray-400">Tap the bookmark icon to save your favorites</p>
          </div>
        ) : (
          <div className="space-y-4">
            {getSortedBookmarks().map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-pink-400 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => selectAffirmation(bookmark)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-lg font-medium text-gray-800 mb-2">
                      {bookmark.text}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      bookmark.category === 'love' ? 'bg-pink-100 text-pink-800' :
                      bookmark.category === 'wealth' ? 'bg-green-100 text-green-800' :
                      bookmark.category === 'health' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {bookmark.category.charAt(0).toUpperCase() + bookmark.category.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(bookmark.id);
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        bookmark.isPinned
                          ? 'text-blue-500 hover:bg-blue-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Remove this affirmation from bookmarks?')) {
                          removeBookmark(bookmark.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
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
  );

  const renderSearchView = () => (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
          Find Affirmations
        </h2>
        
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="Search affirmations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          
          <div className="flex flex-wrap gap-2">
            {['all', 'love', 'wealth', 'health', 'learning'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          {getFilteredAffirmations().map((affirmation) => (
            <div
              key={affirmation.id}
              className="bg-white rounded-lg shadow-md p-4 border-l-4 border-pink-400 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => selectAffirmation(affirmation)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-800 font-medium mb-1">
                    {affirmation.text}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    affirmation.category === 'love' ? 'bg-pink-100 text-pink-800' :
                    affirmation.category === 'wealth' ? 'bg-green-100 text-green-800' :
                    affirmation.category === 'health' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {affirmation.category.charAt(0).toUpperCase() + affirmation.category.slice(1)}
                  </span>
                </div>
                
                {isBookmarked(affirmation) && (
                  <Bookmark className="w-5 h-5 text-blue-500 ml-2" />
                )}
              </div>
            </div>
          ))}
        </div>
        
        {getFilteredAffirmations().length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No affirmations found</p>
            <p className="text-gray-400">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            {currentView !== 'main' && (
              <button
                onClick={() => setCurrentView('main')}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            <button
              onClick={handleGoToMain}
              className="text-2xl font-bold text-gray-800 hover:text-pink-600 transition-colors"
              style={{ fontFamily: "'Fredoka One', cursive" }}
            >
              Goaly
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('bookmarks')}
              className={`p-2 rounded-full transition-colors ${
                currentView === 'bookmarks'
                  ? 'bg-pink-100 text-pink-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Bookmark className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleNewAffirmation}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setCurrentView('search')}
              className={`p-2 rounded-full transition-colors ${
                currentView === 'search'
                  ? 'bg-pink-100 text-pink-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {currentView === 'main' && renderMainView()}
      {currentView === 'bookmarks' && renderBookmarksView()}
      {currentView === 'search' && renderSearchView()}
    </div>
  );
};

export default App;