import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Bookmark, Share2, Search, Plus, Menu, ArrowLeft, Pin, X, Sparkles } from 'lucide-react';
import { DollarBillIcon } from './components/DollarBillIcon';
import { HealthIcon } from './components/HealthIcon';
import { secureStorage, generateSecureId, rateLimiter } from './utils/security';

// Affirmations data
const affirmations = [
  // Love & Self-Love (Pink)
  { id: 1, text: "I am worthy of love and respect", category: "love" },
  { id: 2, text: "I choose to love myself unconditionally", category: "love" },
  { id: 3, text: "I attract loving relationships into my life", category: "love" },
  { id: 4, text: "I am enough exactly as I am", category: "love" },
  { id: 5, text: "I radiate love and positivity", category: "love" },
  { id: 6, text: "I deserve happiness and joy", category: "love" },
  { id: 7, text: "I am beautiful inside and out", category: "love" },
  { id: 8, text: "I forgive myself and others with ease", category: "love" },
  { id: 9, text: "I am surrounded by love and support", category: "love" },
  { id: 10, text: "I trust in the power of love", category: "love" },

  // Wealth & Business (Green)
  { id: 11, text: "I am a magnet for financial abundance", category: "wealth" },
  { id: 12, text: "Money flows to me easily and effortlessly", category: "wealth" },
  { id: 13, text: "I create multiple streams of income", category: "wealth" },
  { id: 14, text: "I am worthy of financial success", category: "wealth" },
  { id: 15, text: "My business grows and prospers daily", category: "wealth" },
  { id: 16, text: "I make wise financial decisions", category: "wealth" },
  { id: 17, text: "Opportunities for wealth surround me", category: "wealth" },
  { id: 18, text: "I am financially free and independent", category: "wealth" },
  { id: 19, text: "I attract prosperity in all areas of life", category: "wealth" },
  { id: 20, text: "My income increases every month", category: "wealth" },

  // Health & Fitness (Blue)
  { id: 21, text: "I am healthy, strong, and vibrant", category: "health" },
  { id: 22, text: "My body heals itself naturally", category: "health" },
  { id: 23, text: "I choose foods that nourish my body", category: "health" },
  { id: 24, text: "I enjoy exercising and moving my body", category: "health" },
  { id: 25, text: "I have abundant energy and vitality", category: "health" },
  { id: 26, text: "I sleep peacefully and wake refreshed", category: "health" },
  { id: 27, text: "My mind is clear and focused", category: "health" },
  { id: 28, text: "I am grateful for my healthy body", category: "health" },
  { id: 29, text: "I radiate wellness and vitality", category: "health" },
  { id: 30, text: "Every cell in my body vibrates with health", category: "health" },

  // Learning & Growth (Yellow)
  { id: 31, text: "I am constantly learning and growing", category: "learning" },
  { id: 32, text: "My mind is open to new possibilities", category: "learning" },
  { id: 33, text: "I embrace challenges as opportunities", category: "learning" },
  { id: 34, text: "Knowledge comes to me easily", category: "learning" },
  { id: 35, text: "I am curious and eager to learn", category: "learning" },
  { id: 36, text: "I trust in my ability to figure things out", category: "learning" },
  { id: 37, text: "Every experience teaches me something valuable", category: "learning" },
  { id: 38, text: "I am becoming the best version of myself", category: "learning" },
  { id: 39, text: "I have unlimited potential", category: "learning" },
  { id: 40, text: "I am wise and make good decisions", category: "learning" },
];

interface BookmarkedAffirmation {
  id: string;
  affirmation: typeof affirmations[0];
  isPinned: boolean;
  dateAdded: string;
}

const App: React.FC = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState(affirmations[0]);
  const [clickedLetters, setClickedLetters] = useState<Set<number>>(new Set());
  const [showBurst, setShowBurst] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'bookmarks' | 'search'>('main');
  const [bookmarks, setBookmarks] = useState<BookmarkedAffirmation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [affirmationHistory, setAffirmationHistory] = useState<typeof affirmations>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  
  const affirmationRef = useRef<HTMLDivElement>(null);
  const lastInteractionRef = useRef<number>(0);

  // Load bookmarks from localStorage on component mount
  useEffect(() => {
    const savedBookmarks = secureStorage.getItem('goaly-bookmarks');
    if (savedBookmarks && Array.isArray(savedBookmarks)) {
      setBookmarks(savedBookmarks);
    }
  }, []);

  // Save bookmarks to localStorage whenever bookmarks change
  useEffect(() => {
    secureStorage.setItem('goaly-bookmarks', bookmarks);
  }, [bookmarks]);

  const getRandomAffirmation = useCallback(() => {
    if (!rateLimiter.isAllowed('new-affirmation', 30, 60000)) {
      return; // Rate limit exceeded
    }

    let newAffirmation;
    do {
      newAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    } while (newAffirmation.id === currentAffirmation.id && affirmations.length > 1);
    
    // Add current affirmation to history before changing
    setAffirmationHistory(prev => {
      const newHistory = [currentAffirmation, ...prev.slice(0, 9)]; // Keep last 10
      return newHistory;
    });
    setHistoryIndex(-1);
    
    setCurrentAffirmation(newAffirmation);
    setClickedLetters(new Set());
    setShowBurst(false);
  }, [currentAffirmation]);

  const goToPreviousAffirmation = useCallback(() => {
    if (historyIndex < affirmationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentAffirmation(affirmationHistory[newIndex]);
      setClickedLetters(new Set());
      setShowBurst(false);
    }
  }, [historyIndex, affirmationHistory]);

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
      setCurrentAffirmation(affirmationHistory[0]);
      setClickedLetters(new Set());
      setShowBurst(false);
    }
  }, [historyIndex, affirmationHistory]);

  const handleLetterClick = (index: number) => {
    if (!rateLimiter.isAllowed('letter-click', 100, 60000)) {
      return; // Rate limit exceeded
    }

    const newClickedLetters = new Set(clickedLetters);
    newClickedLetters.add(index);
    setClickedLetters(newClickedLetters);

    // Check if all letters are clicked
    const totalLetters = currentAffirmation.text.replace(/\s/g, '').length;
    if (newClickedLetters.size === totalLetters) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 2000);
    }
  };

  const isBookmarked = (affirmationId: number): boolean => {
    return bookmarks.some(bookmark => bookmark.affirmation.id === affirmationId);
  };

  const toggleBookmark = () => {
    if (!rateLimiter.isAllowed('bookmark-toggle', 20, 60000)) {
      return; // Rate limit exceeded
    }

    const affirmationId = currentAffirmation.id;
    const existingBookmark = bookmarks.find(bookmark => bookmark.affirmation.id === affirmationId);

    if (existingBookmark) {
      // Remove bookmark
      setBookmarks(prev => prev.filter(bookmark => bookmark.affirmation.id !== affirmationId));
    } else {
      // Add bookmark
      const newBookmark: BookmarkedAffirmation = {
        id: generateSecureId(),
        affirmation: currentAffirmation,
        isPinned: false,
        dateAdded: new Date().toISOString()
      };
      setBookmarks(prev => [...prev, newBookmark]);
    }
  };

  const togglePin = (bookmarkId: string) => {
    if (!rateLimiter.isAllowed('pin-toggle', 20, 60000)) {
      return; // Rate limit exceeded
    }

    setBookmarks(prev => 
      prev.map(bookmark => 
        bookmark.id === bookmarkId 
          ? { ...bookmark, isPinned: !bookmark.isPinned }
          : bookmark
      )
    );
  };

  const deleteBookmark = (bookmarkId: string) => {
    if (!rateLimiter.isAllowed('bookmark-delete', 20, 60000)) {
      return; // Rate limit exceeded
    }

    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
    setShowDeleteConfirm(null);
  };

  const shareAffirmation = async () => {
    if (!rateLimiter.isAllowed('share', 10, 60000)) {
      return; // Rate limit exceeded
    }

    const shareUrl = `${window.location.origin}?affirmation=${encodeURIComponent(currentAffirmation.text)}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleSearch = (query: string, category: string) => {
    setSearchQuery(query);
    setSelectedCategory(category);
  };

  const getFilteredAffirmations = () => {
    let filtered = affirmations;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(affirmation => affirmation.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(affirmation => 
        affirmation.text.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const selectAffirmation = (affirmation: typeof affirmations[0]) => {
    // Add current affirmation to history before changing
    setAffirmationHistory(prev => {
      const newHistory = [currentAffirmation, ...prev.slice(0, 9)]; // Keep last 10
      return newHistory;
    });
    setHistoryIndex(-1);
    
    setCurrentAffirmation(affirmation);
    setClickedLetters(new Set());
    setShowBurst(false);
    setCurrentView('main');
  };

  // Handle scroll/swipe for navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsScrolling(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.touches[0];
    const deltaY = touchStart.y - touch.clientY;
    const deltaX = Math.abs(touchStart.x - touch.clientX);
    
    // Only consider vertical swipes (ignore horizontal)
    if (deltaX > 50) return;
    
    if (Math.abs(deltaY) > 10) {
      setIsScrolling(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !isScrolling) {
      setTouchStart(null);
      setIsScrolling(false);
      return;
    }

    const touch = e.changedTouches[0];
    const deltaY = touchStart.y - touch.clientY;
    const deltaX = Math.abs(touchStart.x - touch.clientX);
    
    // Only consider vertical swipes
    if (deltaX > 50) {
      setTouchStart(null);
      setIsScrolling(false);
      return;
    }

    const now = Date.now();
    if (now - lastInteractionRef.current < 500) {
      setTouchStart(null);
      setIsScrolling(false);
      return; // Prevent rapid interactions
    }

    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0) {
        // Swiped up - new affirmation
        getRandomAffirmation();
      } else {
        // Swiped down - previous affirmation
        goToPreviousAffirmation();
      }
      lastInteractionRef.current = now;
    }

    setTouchStart(null);
    setIsScrolling(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const now = Date.now();
    if (now - lastInteractionRef.current < 500) {
      return; // Prevent rapid scrolling
    }

    if (e.deltaY < 0) {
      // Scrolled up - new affirmation
      getRandomAffirmation();
    } else {
      // Scrolled down - previous affirmation
      goToPreviousAffirmation();
    }
    
    lastInteractionRef.current = now;
  };

  const renderLetter = (letter: string, index: number, letterIndex: number) => {
    if (letter === ' ') {
      return <span key={`${index}-${letterIndex}`} className="inline-block w-4"></span>;
    }

    const isClicked = clickedLetters.has(letterIndex);
    const category = currentAffirmation.category;
    
    let colorClass = '';
    let glowClass = '';
    
    switch (category) {
      case 'love':
        colorClass = isClicked ? 'letter-fill' : 'text-pink-300';
        glowClass = isClicked ? 'letter-glow' : '';
        break;
      case 'wealth':
        colorClass = isClicked ? 'letter-fill-wealth' : 'text-green-300';
        glowClass = isClicked ? 'letter-glow-wealth' : '';
        break;
      case 'health':
        colorClass = isClicked ? 'letter-fill-health' : 'text-blue-300';
        glowClass = isClicked ? 'letter-glow-health' : '';
        break;
      case 'learning':
        colorClass = isClicked ? 'letter-fill-learning' : 'text-yellow-300';
        glowClass = isClicked ? 'letter-glow-learning' : '';
        break;
      default:
        colorClass = isClicked ? 'letter-fill' : 'text-pink-300';
        glowClass = isClicked ? 'letter-glow' : '';
    }

    return (
      <span
        key={`${index}-${letterIndex}`}
        className={`inline-block cursor-pointer transition-all duration-300 hover:scale-110 letter-sparkle ${colorClass} ${glowClass}`}
        onClick={() => handleLetterClick(letterIndex)}
        style={{ 
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}
      >
        {letter}
      </span>
    );
  };

  const renderAffirmationText = () => {
    const words = currentAffirmation.text.split(' ');
    let letterIndex = 0;

    return words.map((word, wordIndex) => (
      <span key={wordIndex} className="inline-block mr-4 mb-2">
        {word.split('').map((letter, charIndex) => {
          const currentLetterIndex = letterIndex++;
          return renderLetter(letter, wordIndex * 1000 + charIndex, currentLetterIndex);
        })}
      </span>
    ));
  };

  const renderBurstAnimation = () => {
    if (!showBurst) return null;

    const category = currentAffirmation.category;
    let IconComponent;
    let iconColor;

    switch (category) {
      case 'love':
        IconComponent = Heart;
        iconColor = 'text-pink-500';
        break;
      case 'wealth':
        IconComponent = DollarBillIcon;
        iconColor = 'text-green-500';
        break;
      case 'health':
        IconComponent = HealthIcon;
        iconColor = 'text-blue-500';
        break;
      case 'learning':
        IconComponent = Sparkles;
        iconColor = 'text-yellow-500';
        break;
      default:
        IconComponent = Heart;
        iconColor = 'text-pink-500';
    }

    const burstItems = Array.from({ length: 12 }, (_, i) => {
      const angle = (i * 30) * (Math.PI / 180);
      const distance = 100 + Math.random() * 50;
      const endX = Math.cos(angle) * distance;
      const endY = Math.sin(angle) * distance;

      return (
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
          <IconComponent className={`w-6 h-6 ${iconColor}`} />
        </div>
      );
    });

    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {burstItems}
      </div>
    );
  };

  const getSortedBookmarks = () => {
    return [...bookmarks].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });
  };

  if (currentView === 'bookmarks') {
    const sortedBookmarks = getSortedBookmarks();
    
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
        <div className="p-4 space-y-4">
          {sortedBookmarks.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400 text-lg">No bookmarks yet</p>
              <p className="text-gray-500 text-sm mt-2">Save your favorite affirmations to see them here</p>
            </div>
          ) : (
            sortedBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-start justify-between"
              >
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => selectAffirmation(bookmark.affirmation)}
                >
                  <p className="text-white font-medium leading-relaxed">
                    {bookmark.affirmation.text}
                  </p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bookmark.affirmation.category === 'love' ? 'bg-pink-500/20 text-pink-300' :
                      bookmark.affirmation.category === 'wealth' ? 'bg-green-500/20 text-green-300' :
                      bookmark.affirmation.category === 'health' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {bookmark.affirmation.category}
                    </span>
                    {bookmark.isPinned && (
                      <Pin className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => togglePin(bookmark.id)}
                    className={`p-2 rounded-full transition-colors ${
                      bookmark.isPinned 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'hover:bg-white/10 text-gray-400'
                    }`}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(bookmark.id)}
                    className="p-2 hover:bg-red-500/20 text-red-400 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Delete Bookmark?</h3>
              <p className="text-gray-300 mb-6">This action cannot be undone.</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteBookmark(showDeleteConfirm)}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentView === 'search') {
    const filteredAffirmations = getFilteredAffirmations();
    
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
            className="w-full p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter */}
        <div className="px-4 pb-4">
          <div className="flex space-x-2 overflow-x-auto">
            {[
              { key: 'all', label: 'All', color: 'bg-gray-500' },
              { key: 'love', label: 'Love', color: 'bg-pink-500' },
              { key: 'wealth', label: 'Wealth', color: 'bg-green-500' },
              { key: 'health', label: 'Health', color: 'bg-blue-500' },
              { key: 'learning', label: 'Learning', color: 'bg-yellow-500' }
            ].map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category.key
                    ? `${category.color} text-white`
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="p-4 space-y-3">
          {filteredAffirmations.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400 text-lg">No affirmations found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your search or category filter</p>
            </div>
          ) : (
            filteredAffirmations.map((affirmation) => (
              <div
                key={affirmation.id}
                onClick={() => selectAffirmation(affirmation)}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-colors"
              >
                <p className="text-white font-medium leading-relaxed mb-2">
                  {affirmation.text}
                </p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  affirmation.category === 'love' ? 'bg-pink-500/20 text-pink-300' :
                  affirmation.category === 'wealth' ? 'bg-green-500/20 text-green-300' :
                  affirmation.category === 'health' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {affirmation.category}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Main view
  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden relative"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-4 bg-black/20 relative z-10">
        <button
          onClick={getRandomAffirmation}
          className="text-2xl font-bold text-white hover:text-blue-300 transition-colors"
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
            onClick={getRandomAffirmation}
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
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div
          ref={affirmationRef}
          className="text-center max-w-4xl mx-auto relative z-10"
        >
          <div 
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8"
            style={{ 
              fontFamily: 'Fredoka, cursive',
              lineHeight: '1.2'
            }}
          >
            {renderAffirmationText()}
          </div>
          
          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/20 rounded-full px-4 py-2">
              <span className="text-sm">
                {clickedLetters.size} / {currentAffirmation.text.replace(/\s/g, '').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right edge icons */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4 z-20">
        {/* Bookmark icon */}
        <button
          onClick={toggleBookmark}
          className={`p-3 rounded-full backdrop-blur-sm transition-all duration-300 ${
            isBookmarked(currentAffirmation.id)
              ? 'bg-blue-500/30 text-blue-300 scale-110'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Bookmark 
            className="w-6 h-6" 
            fill={isBookmarked(currentAffirmation.id) ? 'currentColor' : 'none'}
          />
        </button>
        
        {/* Share icon */}
        <button
          onClick={shareAffirmation}
          className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-colors"
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center z-10">
        <p className="text-white/60 text-sm mb-2">Scroll or swipe for more affirmations</p>
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      {/* Burst Animation */}
      {renderBurstAnimation()}
    </div>
  );
};

export default App;