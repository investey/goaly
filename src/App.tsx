import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Search, 
  Plus, 
  Menu, 
  ArrowLeft,
  Pin,
  X,
  Mic
} from 'lucide-react';
// import { HealthIcon } from './components/HealthIcon';
// import { DollarBillIcon } from './components/DollarBillIcon';
// import { secureStorage, rateLimiter } from './utils/security';

// Temporary inline security utilities
const secureStorage = {
  setItem: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  getItem: (key: string): any => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  }
};

const rateLimiter = {
  isAllowed: () => true // Simplified for now
};

// Affirmations data with categories
const affirmations = [
  // Love & Self-Love (Pink)
  { text: "I am worthy of love and respect", category: "love" },
  { text: "I choose to love myself unconditionally", category: "love" },
  { text: "I attract loving relationships into my life", category: "love" },
  { text: "I am enough exactly as I am", category: "love" },
  { text: "I radiate love and positivity", category: "love" },
  { text: "I deserve happiness and joy", category: "love" },
  { text: "I am beautiful inside and out", category: "love" },
  { text: "I trust in my ability to create meaningful connections", category: "love" },
  { text: "I am grateful for the love in my life", category: "love" },
  { text: "I choose self-compassion over self-criticism", category: "love" },

  // Wealth & Business (Green)
  { text: "I deserve to be financially free", category: "wealth" },
  { text: "Money flows to me easily and abundantly", category: "wealth" },
  { text: "I am a successful entrepreneur", category: "wealth" },
  { text: "I create multiple streams of income", category: "wealth" },
  { text: "I make smart financial decisions", category: "wealth" },
  { text: "Wealth and prosperity are my natural state", category: "wealth" },
  { text: "I attract lucrative opportunities", category: "wealth" },
  { text: "I am worthy of financial abundance", category: "wealth" },
  { text: "My business grows and thrives", category: "wealth" },
  { text: "I invest wisely and see great returns", category: "wealth" },

  // Health & Fitness (Blue)
  { text: "I am strong, healthy, and vibrant", category: "health" },
  { text: "My body is capable of amazing things", category: "health" },
  { text: "I nourish my body with healthy choices", category: "health" },
  { text: "I have boundless energy and vitality", category: "health" },
  { text: "I am getting stronger every day", category: "health" },
  { text: "My mind and body are in perfect harmony", category: "health" },
  { text: "I choose foods that fuel my body", category: "health" },
  { text: "Exercise brings me joy and strength", category: "health" },
  { text: "I sleep deeply and wake up refreshed", category: "health" },
  { text: "I am grateful for my healthy body", category: "health" },

  // Learning & Growth (Yellow)
  { text: "I am constantly learning and growing", category: "learning" },
  { text: "Knowledge comes easily to me", category: "learning" },
  { text: "I embrace challenges as opportunities", category: "learning" },
  { text: "My mind is sharp and focused", category: "learning" },
  { text: "I am curious and open to new experiences", category: "learning" },
  { text: "I learn from every situation", category: "learning" },
  { text: "My potential is limitless", category: "learning" },
  { text: "I am becoming the best version of myself", category: "learning" },
  { text: "I adapt quickly to change", category: "learning" },
  { text: "Every day I discover something new", category: "learning" }
];

const categoryColors = {
  love: { fill: 'letter-fill', glow: 'letter-glow' },
  wealth: { fill: 'letter-fill-wealth', glow: 'letter-glow-wealth' },
  health: { fill: 'letter-fill-health', glow: 'letter-glow-health' },
  learning: { fill: 'letter-fill-learning', glow: 'letter-glow-learning' }
};

const App: React.FC = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState(affirmations[0]);
  const [clickedLetters, setClickedLetters] = useState<Set<number>>(new Set());
  const [bookmarkedAffirmations, setBookmarkedAffirmations] = useState<typeof affirmations>([]);
  const [pinnedAffirmations, setPinnedAffirmations] = useState<Set<string>>(new Set());
  const [currentView, setCurrentView] = useState<'main' | 'bookmarks' | 'search'>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [affirmationHistory, setAffirmationHistory] = useState<typeof affirmations>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);

  // Load saved data on component mount
  useEffect(() => {
    const savedBookmarks = secureStorage.getItem('goaly-bookmarks') || [];
    const savedPinned = new Set(secureStorage.getItem('goaly-pinned') || []);
    setBookmarkedAffirmations(savedBookmarks);
    setPinnedAffirmations(savedPinned);
    
    // Initialize with random affirmation
    const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    setCurrentAffirmation(randomAffirmation);
    setAffirmationHistory([randomAffirmation]);
    setHistoryIndex(0);
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    secureStorage.setItem('goaly-bookmarks', bookmarkedAffirmations);
  }, [bookmarkedAffirmations]);

  // Save pinned affirmations to localStorage
  useEffect(() => {
    secureStorage.setItem('goaly-pinned', Array.from(pinnedAffirmations));
  }, [pinnedAffirmations]);

  const getRandomAffirmation = useCallback(() => {
    if (!rateLimiter.isAllowed('new-affirmation', 30, 60000)) {
      return; // Rate limit: max 30 new affirmations per minute
    }

    let newAffirmation;
    do {
      newAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    } while (newAffirmation.text === currentAffirmation.text && affirmations.length > 1);
    
    setCurrentAffirmation(newAffirmation);
    setClickedLetters(new Set());
    
    // Update history
    const newHistory = affirmationHistory.slice(0, historyIndex + 1);
    newHistory.push(newAffirmation);
    if (newHistory.length > 10) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    setAffirmationHistory(newHistory);
  }, [currentAffirmation, affirmationHistory, historyIndex]);

  const goToPreviousAffirmation = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setCurrentAffirmation(affirmationHistory[prevIndex]);
      setHistoryIndex(prevIndex);
      setClickedLetters(new Set());
    }
  }, [historyIndex, affirmationHistory]);

  const handleLetterClick = (index: number) => {
    if (!rateLimiter.isAllowed('letter-click', 100, 10000)) {
      return; // Rate limit: max 100 clicks per 10 seconds
    }

    const newClickedLetters = new Set(clickedLetters);
    newClickedLetters.add(index);
    setClickedLetters(newClickedLetters);

    // Check if all letters are clicked
    const letterCount = currentAffirmation.text.replace(/\s/g, '').length;
    if (newClickedLetters.size === letterCount) {
      triggerBurstAnimation();
    }
  };

  const triggerBurstAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Create burst elements based on category
    const burstCount = 12;
    const icons = getBurstIcons(currentAffirmation.category);
    
    for (let i = 0; i < burstCount; i++) {
      const element = document.createElement('div');
      element.innerHTML = icons[i % icons.length];
      element.style.position = 'absolute';
      element.style.left = `${centerX}px`;
      element.style.top = `${centerY}px`;
      element.style.pointerEvents = 'none';
      element.style.fontSize = '24px';
      element.style.zIndex = '1000';
      
      const angle = (i / burstCount) * 2 * Math.PI;
      const distance = 100 + Math.random() * 50;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;
      
      element.style.setProperty('--end-x', `${endX}px`);
      element.style.setProperty('--end-y', `${endY}px`);
      element.style.animation = 'heartBurst 1s ease-out forwards';
      
      container.appendChild(element);
      
      setTimeout(() => {
        if (container.contains(element)) {
          container.removeChild(element);
        }
      }, 1000);
    }

    setTimeout(() => setIsAnimating(false), 1000);
  };

  const getBurstIcons = (category: string) => {
    switch (category) {
      case 'love':
        return ['💖', '💕', '💗', '💝'];
      case 'wealth':
        return ['💰', '💵', '💸', '🤑'];
      case 'health':
        return ['💪', '🏃‍♂️', '🧘‍♀️', '🌟'];
      case 'learning':
        return ['⭐', '✨', '🌟', '💫'];
      default:
        return ['💖'];
    }
  };

  // Check if current affirmation is bookmarked - FIXED VERSION
  const isBookmarked = bookmarkedAffirmations.some(a => a.text === currentAffirmation.text);

  const handleBookmark = () => {
    if (!rateLimiter.isAllowed('bookmark', 20, 60000)) {
      return; // Rate limit: max 20 bookmarks per minute
    }

    if (isBookmarked) {
      // Remove from bookmarks
      setBookmarkedAffirmations(prev => prev.filter(a => a.text !== currentAffirmation.text));
    } else {
      // Add to bookmarks
      setBookmarkedAffirmations(prev => [...prev, currentAffirmation]);
    }
  };

  const handleShare = async () => {
    if (!rateLimiter.isAllowed('share', 10, 60000)) {
      return; // Rate limit: max 10 shares per minute
    }

    const shareUrl = `${window.location.origin}?affirmation=${encodeURIComponent(currentAffirmation.text)}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handlePinToggle = (affirmationText: string) => {
    const newPinned = new Set(pinnedAffirmations);
    if (newPinned.has(affirmationText)) {
      newPinned.delete(affirmationText);
    } else {
      newPinned.add(affirmationText);
    }
    setPinnedAffirmations(newPinned);
  };

  const handleDeleteBookmark = (affirmationText: string) => {
    setBookmarkedAffirmations(prev => prev.filter(a => a.text !== affirmationText));
    setPinnedAffirmations(prev => {
      const newPinned = new Set(prev);
      newPinned.delete(affirmationText);
      return newPinned;
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        // Swiped up - new affirmation
        getRandomAffirmation();
      } else {
        // Swiped down - previous affirmation
        goToPreviousAffirmation();
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      // Scrolled up - new affirmation
      getRandomAffirmation();
    } else {
      // Scrolled down - previous affirmation
      goToPreviousAffirmation();
    }
  };

  const renderLetter = (char: string, index: number, letterIndex: number) => {
    if (char === ' ') {
      return <span key={index} className="inline-block w-4"></span>;
    }

    const isClicked = clickedLetters.has(letterIndex);
    const colors = categoryColors[currentAffirmation.category as keyof typeof categoryColors];
    
    return (
      <span
        key={index}
        className={`
          inline-block cursor-pointer transition-all duration-300 text-6xl md:text-8xl font-bold
          hover:scale-110 select-none font-['Fredoka_One']
          ${isClicked ? `${colors.fill} ${colors.glow} letter-sparkle` : 'text-gray-800 hover:text-gray-600'}
        `}
        onClick={() => handleLetterClick(letterIndex)}
        style={{
          textShadow: isClicked ? 'none' : '2px 2px 4px rgba(0,0,0,0.1)',
          WebkitTextStroke: isClicked ? 'none' : '2px rgba(0,0,0,0.1)'
        }}
      >
        {char}
      </span>
    );
  };

  const renderAffirmationText = () => {
    let letterIndex = 0;
    return currentAffirmation.text.split('').map((char, index) => {
      if (char !== ' ') {
        const currentLetterIndex = letterIndex;
        letterIndex++;
        return renderLetter(char, index, currentLetterIndex);
      }
      return renderLetter(char, index, -1);
    });
  };

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

  const sortedBookmarks = [...bookmarkedAffirmations].sort((a, b) => {
    const aIsPinned = pinnedAffirmations.has(a.text);
    const bIsPinned = pinnedAffirmations.has(b.text);
    
    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    return 0;
  });

  if (currentView === 'bookmarks') {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={() => setCurrentView('main')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 font-['Fredoka']">Bookmarks</h1>
          <div className="w-10"></div>
        </div>

        {/* Bookmarks List */}
        <div className="p-4 space-y-3">
          {sortedBookmarks.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-['Fredoka']">No bookmarks yet</p>
              <p className="text-sm text-gray-400 font-['Fredoka']">Save affirmations to see them here</p>
            </div>
          ) : (
            sortedBookmarks.map((affirmation, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-800 font-medium font-['Fredoka']">{affirmation.text}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 font-['Fredoka'] ${
                    affirmation.category === 'love' ? 'bg-pink-100 text-pink-800' :
                    affirmation.category === 'wealth' ? 'bg-green-100 text-green-800' :
                    affirmation.category === 'health' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {affirmation.category}
                  </span>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handlePinToggle(affirmation.text)}
                    className={`p-2 rounded-full transition-colors ${
                      pinnedAffirmations.has(affirmation.text)
                        ? 'text-blue-500 bg-blue-50'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBookmark(affirmation.text)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
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
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={() => setCurrentView('main')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 font-['Fredoka']">Search</h1>
          <div className="w-10"></div>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Search affirmations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-['Fredoka']"
          />
        </div>

        {/* Category Filter */}
        <div className="px-4 pb-4">
          <div className="flex space-x-2 overflow-x-auto">
            {['all', 'love', 'wealth', 'health', 'learning'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-['Fredoka'] ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="px-4 space-y-3">
          {getFilteredAffirmations().map((affirmation, index) => (
            <div
              key={index}
              onClick={() => {
                setCurrentAffirmation(affirmation);
                setClickedLetters(new Set());
                setCurrentView('main');
              }}
              className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <p className="text-gray-800 font-medium font-['Fredoka']">{affirmation.text}</p>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 font-['Fredoka'] ${
                affirmation.category === 'love' ? 'bg-pink-100 text-pink-800' :
                affirmation.category === 'wealth' ? 'bg-green-100 text-green-800' :
                affirmation.category === 'health' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {affirmation.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-white relative overflow-hidden"
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={getRandomAffirmation}
          className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors font-['Fredoka_One']"
        >
          Goaly
        </button>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentView('bookmarks')}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Bookmark className="w-6 h-6" />
          </button>
          <button
            onClick={getRandomAffirmation}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentView('search')}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Search className="w-6 h-6" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-6 z-10">
        <button className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
          <Mic className="w-6 h-6 text-gray-600" />
        </button>
        
        <button
          onClick={handleBookmark}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-6 h-6 text-blue-500" />
          ) : (
            <Bookmark className="w-6 h-6 text-gray-600" />
          )}
        </button>
        
        <button
          onClick={handleShare}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <Share2 className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-8">
        <div className="text-center max-w-4xl">
          <div className="leading-tight mb-8">
            {renderAffirmationText()}
          </div>
        </div>
      </div>

      {/* Bottom Instruction */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <p className="text-yellow-600 text-sm font-medium font-['Fredoka']">
          ✨ Trace Goal or Scroll Up! ✨
        </p>
      </div>
    </div>
  );
};

export default App;