import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bookmark, Share2, Plus, Search, Menu, ArrowLeft, Thumbtack, X, Heart, Star } from 'lucide-react';
import { DollarBillIcon } from './components/DollarBillIcon';
import { HealthIcon } from './components/HealthIcon';
import { secureStorage, generateSecureId, rateLimiter } from './utils/security';

interface Affirmation {
  id: string;
  text: string;
  category: 'love' | 'wealth' | 'health' | 'learning';
}

interface BookmarkedAffirmation extends Affirmation {
  isPinned: boolean;
  bookmarkedAt: number;
}

const affirmations: Affirmation[] = [
  // Love & Self-Love
  { id: '1', text: 'I am worthy of love and respect', category: 'love' },
  { id: '2', text: 'I radiate love and attract loving relationships', category: 'love' },
  { id: '3', text: 'I love and accept myself completely', category: 'love' },
  { id: '4', text: 'My heart is open to giving and receiving love', category: 'love' },
  { id: '5', text: 'I deserve happiness and joy in my life', category: 'love' },
  { id: '6', text: 'I am beautiful inside and out', category: 'love' },
  { id: '7', text: 'I choose to see the good in myself and others', category: 'love' },
  { id: '8', text: 'Love flows through me effortlessly', category: 'love' },
  
  // Wealth & Business
  { id: '9', text: 'I am a magnet for financial abundance', category: 'wealth' },
  { id: '10', text: 'Money flows to me easily and frequently', category: 'wealth' },
  { id: '11', text: 'I create value and wealth through my talents', category: 'wealth' },
  { id: '12', text: 'Opportunities for prosperity surround me', category: 'wealth' },
  { id: '13', text: 'I am worthy of financial success', category: 'wealth' },
  { id: '14', text: 'My business grows and thrives every day', category: 'wealth' },
  { id: '15', text: 'I make wise financial decisions', category: 'wealth' },
  { id: '16', text: 'Abundance is my natural state of being', category: 'wealth' },
  
  // Health & Fitness
  { id: '17', text: 'My body is strong and healthy', category: 'health' },
  { id: '18', text: 'I nourish my body with healthy choices', category: 'health' },
  { id: '19', text: 'Every cell in my body vibrates with energy', category: 'health' },
  { id: '20', text: 'I am grateful for my healthy body', category: 'health' },
  { id: '21', text: 'I enjoy exercising and moving my body', category: 'health' },
  { id: '22', text: 'My mind is clear and focused', category: 'health' },
  { id: '23', text: 'I sleep peacefully and wake up refreshed', category: 'health' },
  { id: '24', text: 'I radiate vitality and wellness', category: 'health' },
  
  // Learning & Growth
  { id: '25', text: 'I am constantly learning and growing', category: 'learning' },
  { id: '26', text: 'My mind is open to new possibilities', category: 'learning' },
  { id: '27', text: 'I embrace challenges as opportunities to grow', category: 'learning' },
  { id: '28', text: 'Knowledge comes to me easily', category: 'learning' },
  { id: '29', text: 'I am curious and eager to learn', category: 'learning' },
  { id: '30', text: 'Every experience teaches me something valuable', category: 'learning' },
  { id: '31', text: 'I trust in my ability to figure things out', category: 'learning' },
  { id: '32', text: 'I am becoming the best version of myself', category: 'learning' },
];

const App: React.FC = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation>(affirmations[0]);
  const [clickedLetters, setClickedLetters] = useState<Set<number>>(new Set());
  const [showBurst, setShowBurst] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkedAffirmation[]>([]);
  const [currentView, setCurrentView] = useState<'main' | 'bookmarks' | 'search'>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [affirmationHistory, setAffirmationHistory] = useState<Affirmation[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const burstRef = useRef<HTMLDivElement>(null);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const savedBookmarks = secureStorage.getItem('goaly-bookmarks');
    if (savedBookmarks) {
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
    
    const availableAffirmations = affirmations.filter(a => a.id !== currentAffirmation.id);
    const randomIndex = Math.floor(Math.random() * availableAffirmations.length);
    const newAffirmation = availableAffirmations[randomIndex];
    
    // Add current affirmation to history
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
    if (affirmationHistory.length > 0) {
      const nextIndex = Math.min(historyIndex + 1, affirmationHistory.length - 1);
      if (nextIndex !== historyIndex) {
        setCurrentAffirmation(affirmationHistory[nextIndex]);
        setHistoryIndex(nextIndex);
        setClickedLetters(new Set());
        setShowBurst(false);
      }
    }
  }, [affirmationHistory, historyIndex]);

  const handleLetterClick = (index: number) => {
    if (!rateLimiter.isAllowed('letter-click', 100, 60000)) {
      return; // Rate limit exceeded
    }
    
    setClickedLetters(prev => new Set([...prev, index]));
    
    // Check if all letters are clicked
    const totalLetters = currentAffirmation.text.replace(/\s/g, '').length;
    const newClickedCount = clickedLetters.size + 1;
    
    if (newClickedCount === totalLetters) {
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 3000);
    }
  };

  const isBookmarked = (affirmationId: string) => {
    return bookmarks.some(bookmark => bookmark.id === affirmationId);
  };

  const toggleBookmark = () => {
    if (!rateLimiter.isAllowed('bookmark-toggle', 20, 60000)) {
      return; // Rate limit exceeded
    }
    
    if (isBookmarked(currentAffirmation.id)) {
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== currentAffirmation.id));
    } else {
      const newBookmark: BookmarkedAffirmation = {
        ...currentAffirmation,
        isPinned: false,
        bookmarkedAt: Date.now()
      };
      setBookmarks(prev => [...prev, newBookmark]);
    }
  };

  const togglePin = (affirmationId: string) => {
    if (!rateLimiter.isAllowed('pin-toggle', 20, 60000)) {
      return; // Rate limit exceeded
    }
    
    setBookmarks(prev => 
      prev.map(bookmark => 
        bookmark.id === affirmationId 
          ? { ...bookmark, isPinned: !bookmark.isPinned }
          : bookmark
      )
    );
  };

  const removeBookmark = (affirmationId: string) => {
    if (!rateLimiter.isAllowed('bookmark-remove', 20, 60000)) {
      return; // Rate limit exceeded
    }
    
    if (window.confirm('Are you sure you want to remove this bookmark?')) {
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== affirmationId));
    }
  };

  const shareAffirmation = async () => {
    if (!rateLimiter.isAllowed('share', 10, 60000)) {
      return; // Rate limit exceeded
    }
    
    const shareUrl = `${window.location.origin}?affirmation=${encodeURIComponent(currentAffirmation.id)}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link. Please try again.');
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsScrolling(false);
  };

  const handleTouchMove = () => {
    setIsScrolling(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || isScrolling) {
      setTouchStart(null);
      return;
    }

    const touch = e.changedTouches[0];
    const deltaY = touchStart.y - touch.clientY;
    const deltaX = Math.abs(touchStart.x - touch.clientX);

    // Only trigger if it's a vertical swipe (not horizontal)
    if (deltaX < 50 && Math.abs(deltaY) > 50) {
      if (deltaY > 0) {
        // Swipe up - new affirmation
        getRandomAffirmation();
      } else {
        // Swipe down - previous affirmation
        goToPreviousAffirmation();
      }
    }

    setTouchStart(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > 10) {
      if (e.deltaY < 0) {
        // Scroll up - new affirmation
        getRandomAffirmation();
      } else {
        // Scroll down - previous affirmation
        goToPreviousAffirmation();
      }
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'love': return 'text-pink-500';
      case 'wealth': return 'text-green-500';
      case 'health': return 'text-blue-500';
      case 'learning': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getLetterClasses = (index: number, category: string) => {
    const isClicked = clickedLetters.has(index);
    let classes = 'cursor-pointer transition-all duration-300 select-none ';
    
    if (isClicked) {
      classes += 'letter-sparkle ';
      switch (category) {
        case 'love':
          classes += 'letter-fill letter-glow';
          break;
        case 'wealth':
          classes += 'letter-fill-wealth letter-glow-wealth';
          break;
        case 'health':
          classes += 'letter-fill-health letter-glow-health';
          break;
        case 'learning':
          classes += 'letter-fill-learning letter-glow-learning';
          break;
      }
    } else {
      classes += 'hover:scale-110 text-gray-800';
    }
    
    return classes;
  };

  const renderBurstAnimation = () => {
    if (!showBurst) return null;

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
          IconComponent = Heart;
          break;
        case 'wealth':
          IconComponent = DollarBillIcon;
          break;
        case 'health':
          IconComponent = HealthIcon;
          break;
        case 'learning':
          IconComponent = Star;
          break;
        default:
          IconComponent = Heart;
      }
      
      icons.push(
        <div
          key={i}
          className="absolute top-1/2 left-1/2 pointer-events-none"
          style={{
            '--end-x': `${endX}px`,
            '--end-y': `${endY}px`,
            animation: `heartBurst 2s ease-out forwards`,
            animationDelay: `${i * 0.1}s`
          } as React.CSSProperties}
        >
          <IconComponent className={`w-6 h-6 ${getCategoryColor(currentAffirmation.category)}`} />
        </div>
      );
    }
    
    return (
      <div ref={burstRef} className="fixed inset-0 pointer-events-none z-50">
        {icons}
      </div>
    );
  };

  const filteredAffirmations = affirmations.filter(affirmation => {
    const matchesSearch = affirmation.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || affirmation.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.bookmarkedAt - a.bookmarkedAt;
  });

  if (currentView === 'bookmarks') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 font-['Fredoka']">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentView('main')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Bookmarks</h1>
          <div className="w-10"></div>
        </div>

        {/* Bookmarks List */}
        <div className="p-4 space-y-3">
          {sortedBookmarks.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No bookmarks yet</p>
              <p className="text-gray-400">Save your favorite affirmations to see them here</p>
            </div>
          ) : (
            sortedBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3"
              >
                <button
                  onClick={() => togglePin(bookmark.id)}
                  className={`p-2 rounded-full transition-colors ${
                    bookmark.isPinned 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'hover:bg-gray-100 text-gray-400'
                  }`}
                >
                  <Thumbtack className="w-4 h-4" />
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 leading-relaxed">{bookmark.text}</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(bookmark.category)} bg-gray-100`}>
                    {bookmark.category}
                  </span>
                </div>
                
                <button
                  onClick={() => removeBookmark(bookmark.id)}
                  className="p-2 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'search') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 font-['Fredoka']">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentView('main')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Search</h1>
          <div className="w-10"></div>
        </div>

        {/* Search Controls */}
        <div className="p-4 space-y-4">
          <input
            type="text"
            placeholder="Search affirmations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory('love')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'love'
                  ? 'bg-pink-500 text-white'
                  : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
              }`}
            >
              Love
            </button>
            <button
              onClick={() => setSelectedCategory('wealth')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'wealth'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
            >
              Wealth
            </button>
            <button
              onClick={() => setSelectedCategory('health')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'health'
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
              }`}
            >
              Health
            </button>
            <button
              onClick={() => setSelectedCategory('learning')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === 'learning'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
              }`}
            >
              Learning
            </button>
          </div>
        </div>

        {/* Search Results */}
        <div className="p-4 space-y-3">
          {filteredAffirmations.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No affirmations found</p>
              <p className="text-gray-400">Try adjusting your search or category filter</p>
            </div>
          ) : (
            filteredAffirmations.map((affirmation) => (
              <button
                key={affirmation.id}
                onClick={() => {
                  setCurrentAffirmation(affirmation);
                  setClickedLetters(new Set());
                  setShowBurst(false);
                  setCurrentView('main');
                }}
                className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow"
              >
                <p className="text-gray-800 leading-relaxed mb-2">{affirmation.text}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(affirmation.category)} bg-gray-100`}>
                  {affirmation.category}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-['Fredoka'] relative overflow-hidden"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Navigation */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm p-4 flex items-center justify-between relative z-10">
        <button
          onClick={() => {
            getRandomAffirmation();
            setCurrentView('main');
          }}
          className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors font-['Fredoka_One']"
        >
          Goaly
        </button>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('bookmarks')}
            className="p-2 hover:bg-purple-100 rounded-full transition-colors"
          >
            <Bookmark className="w-6 h-6 text-gray-600" />
          </button>
          
          <button
            onClick={getRandomAffirmation}
            className="p-2 hover:bg-purple-100 rounded-full transition-colors"
          >
            <Plus className="w-6 h-6 text-gray-600" />
          </button>
          
          <button
            onClick={() => setCurrentView('search')}
            className="p-2 hover:bg-purple-100 rounded-full transition-colors"
          >
            <Search className="w-6 h-6 text-gray-600" />
          </button>
          
          <button className="p-2 hover:bg-purple-100 rounded-full transition-colors">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="max-w-4xl mx-auto text-center relative">
          {/* Affirmation Text */}
          <div className="mb-8">
            <p className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              {currentAffirmation.text.split('').map((char, index) => {
                if (char === ' ') {
                  return <span key={index} className="inline-block w-4"></span>;
                }
                
                return (
                  <span
                    key={index}
                    className={getLetterClasses(index, currentAffirmation.category)}
                    onClick={() => handleLetterClick(index)}
                  >
                    {char}
                  </span>
                );
              })}
            </p>
            
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(currentAffirmation.category)} bg-white/50`}>
                {currentAffirmation.category}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-gray-600 text-lg mb-8">
            <p>Click each letter to make it glow ✨</p>
            <p className="text-sm mt-2">Scroll up for new affirmation • Scroll down for previous</p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="fixed right-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-20">
          <button
            onClick={toggleBookmark}
            className={`p-3 rounded-full shadow-lg transition-all ${
              isBookmarked(currentAffirmation.id)
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Bookmark className="w-6 h-6" />
          </button>
          
          <button
            onClick={shareAffirmation}
            className="p-3 bg-white text-gray-600 hover:bg-gray-50 rounded-full shadow-lg transition-colors"
          >
            <Share2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Burst Animation */}
      {renderBurstAnimation()}
    </div>
  );
};

export default App;