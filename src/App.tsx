import React, { useState, useEffect, useCallback } from 'react';
import { Heart, Bookmark, Share2, Plus, Search, Menu, ArrowLeft, Pin, X } from 'lucide-react';
import { DollarBillIcon } from './components/DollarBillIcon';
import { HealthIcon } from './components/HealthIcon';
import { sanitizeInput, secureStorage, rateLimiter } from './utils/security';

const loveAffirmations = [
  "I am worthy of deep love",
  "I radiate love and attract loving relationships",
  "I love and accept myself completely",
  "My heart is open to giving and receiving love",
  "I deserve to be loved for who I am",
  "Love flows through me effortlessly",
  "I am surrounded by love in all its forms",
  "I choose to love myself more each day",
  "My capacity for love is infinite",
  "I attract healthy, loving relationships"
];

const wealthAffirmations = [
  "I am a magnet for financial abundance",
  "Money flows to me easily and effortlessly",
  "I deserve to be wealthy and prosperous",
  "My income increases every month",
  "I make smart financial decisions",
  "Abundance is my natural state",
  "I attract lucrative opportunities",
  "Wealth and success come naturally to me",
  "I am financially free and secure",
  "Money is a tool for good in my life"
];

const healthAffirmations = [
  "My body is strong, healthy, and vibrant",
  "I nourish my body with healthy choices",
  "Every cell in my body radiates health",
  "I have abundant energy and vitality",
  "My body heals quickly and completely",
  "I am in perfect health and wellness",
  "I listen to my body's wisdom",
  "Health and vitality flow through me",
  "I am grateful for my healthy body",
  "I choose foods that energize and heal me"
];

const learningAffirmations = [
  "I am constantly learning and growing",
  "My mind is sharp and focused",
  "I absorb new information easily",
  "Learning brings me joy and fulfillment",
  "I am curious and open to new ideas",
  "My potential for growth is unlimited",
  "I embrace challenges as opportunities to learn",
  "Knowledge comes to me naturally",
  "I am becoming wiser every day",
  "I trust in my ability to learn anything"
];

interface Affirmation {
  text: string;
  category: 'love' | 'wealth' | 'health' | 'learning';
}

const allAffirmations: Affirmation[] = [
  ...loveAffirmations.map(text => ({ text, category: 'love' as const })),
  ...wealthAffirmations.map(text => ({ text, category: 'wealth' as const })),
  ...healthAffirmations.map(text => ({ text, category: 'health' as const })),
  ...learningAffirmations.map(text => ({ text, category: 'learning' as const }))
];

function App() {
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation>(
    allAffirmations[Math.floor(Math.random() * allAffirmations.length)]
  );
  const [completedLetters, setCompletedLetters] = useState<Set<number>>(new Set());
  const [showBurst, setShowBurst] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'bookmarks' | 'search'>('main');
  const [bookmarkedPhrases, setBookmarkedPhrases] = useState<string[]>([]);
  const [pinnedPhrases, setPinnedPhrases] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [affirmationHistory, setAffirmationHistory] = useState<Affirmation[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Load bookmarks and pins from localStorage
  useEffect(() => {
    const savedBookmarks = secureStorage.getItem('goaly-bookmarks') || [];
    const savedPins = secureStorage.getItem('goaly-pins') || [];
    setBookmarkedPhrases(savedBookmarks);
    setPinnedPhrases(savedPins);
  }, []);

  // Save bookmarks to localStorage
  useEffect(() => {
    secureStorage.setItem('goaly-bookmarks', bookmarkedPhrases);
  }, [bookmarkedPhrases]);

  // Save pins to localStorage
  useEffect(() => {
    secureStorage.setItem('goaly-pins', pinnedPhrases);
  }, [pinnedPhrases]);

  const getRandomAffirmation = useCallback(() => {
    if (!rateLimiter.isAllowed('new-affirmation', 50, 60000)) {
      return; // Rate limit exceeded
    }
    
    const newAffirmation = allAffirmations[Math.floor(Math.random() * allAffirmations.length)];
    setCurrentAffirmation(newAffirmation);
    setCompletedLetters(new Set());
    setShowBurst(false);
    
    // Add to history
    setAffirmationHistory(prev => {
      const newHistory = [newAffirmation, ...prev.slice(0, 9)]; // Keep last 10
      return newHistory;
    });
    setHistoryIndex(-1);
  }, []);

  const handleLetterClick = (index: number) => {
    if (!rateLimiter.isAllowed('letter-click', 100, 60000)) {
      return; // Rate limit exceeded
    }
    
    setCompletedLetters(prev => {
      const newSet = new Set(prev);
      newSet.add(index);
      
      // Check if all letters are completed
      const totalLetters = currentAffirmation.text.replace(/\s/g, '').length;
      if (newSet.size === totalLetters) {
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 2000);
      }
      
      return newSet;
    });
  };

  const toggleBookmark = () => {
    if (!rateLimiter.isAllowed('bookmark', 20, 60000)) {
      return; // Rate limit exceeded
    }
    
    const text = currentAffirmation.text;
    setBookmarkedPhrases(prev => 
      prev.includes(text) 
        ? prev.filter(phrase => phrase !== text)
        : [...prev, text]
    );
  };

  const togglePin = (phrase: string) => {
    if (!rateLimiter.isAllowed('pin', 20, 60000)) {
      return; // Rate limit exceeded
    }
    
    setPinnedPhrases(prev => 
      prev.includes(phrase)
        ? prev.filter(p => p !== phrase)
        : [...prev, phrase]
    );
  };

  const removeBookmark = (phrase: string) => {
    if (!rateLimiter.isAllowed('remove-bookmark', 20, 60000)) {
      return; // Rate limit exceeded
    }
    
    setBookmarkedPhrases(prev => prev.filter(p => p !== phrase));
    setPinnedPhrases(prev => prev.filter(p => p !== phrase));
  };

  const shareAffirmation = async () => {
    if (!rateLimiter.isAllowed('share', 10, 60000)) {
      return; // Rate limit exceeded
    }
    
    const url = `${window.location.origin}?affirmation=${encodeURIComponent(currentAffirmation.text)}`;
    try {
      await navigator.clipboard.writeText(url);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleScroll = useCallback((e: WheelEvent) => {
    if (currentView !== 'main') return;
    
    if (e.deltaY < 0) {
      // Scrolling up - new affirmation
      getRandomAffirmation();
    } else if (e.deltaY > 0 && affirmationHistory.length > 0) {
      // Scrolling down - previous affirmation
      const newIndex = Math.min(historyIndex + 1, affirmationHistory.length - 1);
      if (newIndex !== historyIndex && affirmationHistory[newIndex]) {
        setHistoryIndex(newIndex);
        setCurrentAffirmation(affirmationHistory[newIndex]);
        setCompletedLetters(new Set());
        setShowBurst(false);
      }
    }
  }, [currentView, getRandomAffirmation, affirmationHistory, historyIndex]);

  useEffect(() => {
    window.addEventListener('wheel', handleScroll);
    return () => window.removeEventListener('wheel', handleScroll);
  }, [handleScroll]);

  const renderLetter = (letter: string, index: number, letterIndex: number) => {
    if (letter === ' ') return ' ';
    
    const isCompleted = completedLetters.has(letterIndex);
    const category = currentAffirmation.category;
    
    return (
      <span
        key={`${index}-${letterIndex}`}
        className={`cursor-pointer transition-all duration-300 ${
          isCompleted 
            ? `letter-fill-${category} letter-glow-${category} letter-sparkle`
            : 'hover:scale-110'
        }`}
        onClick={() => handleLetterClick(letterIndex)}
      >
        {letter}
      </span>
    );
  };

  const renderAffirmationText = () => {
    let letterIndex = 0;
    return currentAffirmation.text.split('').map((char, index) => {
      if (char === ' ') {
        return <span key={index}> </span>;
      }
      const currentLetterIndex = letterIndex++;
      return renderLetter(char, index, currentLetterIndex);
    });
  };

  const getBurstIcon = () => {
    switch (currentAffirmation.category) {
      case 'love':
        return <Heart className="w-6 h-6 text-pink-500" />;
      case 'wealth':
        return <DollarBillIcon className="w-6 h-6" />;
      case 'health':
        return <HealthIcon className="w-6 h-6" />;
      case 'learning':
        return <span className="text-2xl">⭐</span>;
      default:
        return <Heart className="w-6 h-6 text-pink-500" />;
    }
  };

  const filteredAffirmations = allAffirmations.filter(affirmation => {
    const matchesSearch = affirmation.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || affirmation.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedBookmarks = [...bookmarkedPhrases].sort((a, b) => {
    const aIsPinned = pinnedPhrases.includes(a);
    const bIsPinned = pinnedPhrases.includes(b);
    if (aIsPinned && !bIsPinned) return -1;
    if (!aIsPinned && bIsPinned) return 1;
    return 0;
  });

  const isBookmarked = bookmarkedPhrases.includes(currentAffirmation.text);

  if (currentView === 'bookmarks') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 font-['Fredoka']">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm">
          <button
            onClick={() => setCurrentView('main')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Bookmarks</h1>
          <div className="w-10" />
        </div>

        {/* Bookmarks List */}
        <div className="p-4 space-y-3">
          {sortedBookmarks.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No bookmarks yet</p>
            </div>
          ) : (
            sortedBookmarks.map((phrase, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 shadow-sm border flex items-start justify-between"
              >
                <div className="flex-1">
                  <p className="text-gray-800 leading-relaxed">{phrase}</p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => togglePin(phrase)}
                    className={`p-1 rounded transition-colors ${
                      pinnedPhrases.includes(phrase)
                        ? 'text-blue-600 hover:text-blue-700'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeBookmark(phrase)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 font-['Fredoka']">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm">
          <button
            onClick={() => setCurrentView('main')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Search</h1>
          <div className="w-10" />
        </div>

        {/* Search Input */}
        <div className="p-4">
          <input
            type="text"
            placeholder="Search affirmations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(sanitizeInput(e.target.value))}
            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Category Filter */}
        <div className="px-4 pb-4">
          <div className="flex space-x-2 overflow-x-auto">
            {['all', 'love', 'wealth', 'health', 'learning'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="p-4 space-y-3">
          {filteredAffirmations.map((affirmation, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setCurrentAffirmation(affirmation);
                setCompletedLetters(new Set());
                setShowBurst(false);
                setCurrentView('main');
              }}
            >
              <p className="text-gray-800 leading-relaxed">{affirmation.text}</p>
              <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 font-['Fredoka'] relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm relative z-10">
        <button
          onClick={getRandomAffirmation}
          className="text-2xl font-['Fredoka_One'] text-purple-600 hover:text-purple-700 transition-colors"
        >
          Goaly
        </button>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentView('bookmarks')}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <Bookmark className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={getRandomAffirmation}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <Plus className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentView('search')}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <Search className="w-6 h-6 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-white/50 rounded-full transition-colors">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="text-4xl md:text-6xl font-bold leading-tight mb-8 select-none">
            {renderAffirmationText()}
          </div>
          
          <p className="text-gray-600 text-lg">
            Click each letter to make it glow ✨
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Scroll up for new • Scroll down for previous
          </p>
        </div>

        {/* Burst Animation */}
        {showBurst && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 animate-pulse"
                style={{
                  '--end-x': `${(Math.random() - 0.5) * 400}px`,
                  '--end-y': `${(Math.random() - 0.5) * 400}px`,
                  animation: `heartBurst 2s ease-out ${i * 0.1}s forwards`,
                } as React.CSSProperties}
              >
                {getBurstIcon()}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 space-y-4 z-10">
        <button
          onClick={toggleBookmark}
          className={`p-3 rounded-full shadow-lg transition-all ${
            isBookmarked
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Bookmark className="w-6 h-6" />
        </button>
        <button
          onClick={shareAffirmation}
          className="p-3 bg-white text-gray-600 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

export default App;