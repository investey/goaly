import React, { useState, useEffect, useRef } from 'react';
import { Heart, Bookmark, Share, Search, Plus, Menu, ArrowLeft, Pin, X, Mic } from 'lucide-react';
import { DollarBillIcon } from './components/DollarBillIcon';
import { HealthIcon } from './components/HealthIcon';

interface Affirmation {
  id: string;
  text: string;
  category: 'love' | 'wealth' | 'health' | 'learning';
}

interface BookmarkedAffirmation extends Affirmation {
  isPinned: boolean;
}

const affirmations: Affirmation[] = [
  // Love affirmations
  { id: '1', text: 'I am worthy of love and affection', category: 'love' },
  { id: '2', text: 'I radiate love and attract loving relationships', category: 'love' },
  { id: '3', text: 'I love and accept myself completely', category: 'love' },
  { id: '4', text: 'My heart is open to giving and receiving love', category: 'love' },
  { id: '5', text: 'I deserve healthy and fulfilling relationships', category: 'love' },
  { id: '6', text: 'I am surrounded by love in all its forms', category: 'love' },
  { id: '7', text: 'Love flows freely through my life', category: 'love' },
  { id: '8', text: 'I attract my perfect romantic partner', category: 'love' },
  { id: '9', text: 'I am lovable exactly as I am', category: 'love' },
  { id: '10', text: 'My relationships are built on trust and respect', category: 'love' },

  // Wealth affirmations
  { id: '11', text: 'I am a magnet for financial abundance', category: 'wealth' },
  { id: '12', text: 'Money flows to me easily and effortlessly', category: 'wealth' },
  { id: '13', text: 'I deserve to be wealthy and prosperous', category: 'wealth' },
  { id: '14', text: 'My income increases every month', category: 'wealth' },
  { id: '15', text: 'I make smart financial decisions', category: 'wealth' },
  { id: '16', text: 'Opportunities for wealth surround me', category: 'wealth' },
  { id: '17', text: 'I am financially free and secure', category: 'wealth' },
  { id: '18', text: 'My business grows and thrives daily', category: 'wealth' },
  { id: '19', text: 'I attract lucrative opportunities', category: 'wealth' },
  { id: '20', text: 'Wealth and success are my natural state', category: 'wealth' },

  // Health affirmations
  { id: '21', text: 'My body is strong and healthy', category: 'health' },
  { id: '22', text: 'I make healthy choices every day', category: 'health' },
  { id: '23', text: 'I am full of energy and vitality', category: 'health' },
  { id: '24', text: 'My immune system is powerful and protective', category: 'health' },
  { id: '25', text: 'I love and care for my body', category: 'health' },
  { id: '26', text: 'Every cell in my body radiates health', category: 'health' },
  { id: '27', text: 'I sleep peacefully and wake refreshed', category: 'health' },
  { id: '28', text: 'My mind is clear and focused', category: 'health' },
  { id: '29', text: 'I am grateful for my healthy body', category: 'health' },
  { id: '30', text: 'Healing energy flows through me', category: 'health' },

  // Learning affirmations
  { id: '31', text: 'I learn new things easily and quickly', category: 'learning' },
  { id: '32', text: 'My mind is sharp and focused', category: 'learning' },
  { id: '33', text: 'I embrace challenges as opportunities to grow', category: 'learning' },
  { id: '34', text: 'Knowledge comes to me naturally', category: 'learning' },
  { id: '35', text: 'I am constantly expanding my skills', category: 'learning' },
  { id: '36', text: 'Every experience teaches me something valuable', category: 'learning' },
  { id: '37', text: 'I have an excellent memory', category: 'learning' },
  { id: '38', text: 'I am curious and eager to learn', category: 'learning' },
  { id: '39', text: 'My creativity flows freely', category: 'learning' },
  { id: '40', text: 'I master new concepts with ease', category: 'learning' },
];

const App: React.FC = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation>(affirmations[0]);
  const [clickedLetters, setClickedLetters] = useState<Set<number>>(new Set());
  const [showBurst, setShowBurst] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkedAffirmation[]>([]);
  const [currentView, setCurrentView] = useState<'main' | 'bookmarks' | 'search'>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [affirmationHistory, setAffirmationHistory] = useState<Affirmation[]>([affirmations[0]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Load bookmarks from localStorage on component mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('affirmationBookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  // Save bookmarks to localStorage whenever bookmarks change
  useEffect(() => {
    localStorage.setItem('affirmationBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setIsProcessing(false);
      };

      recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript.trim();
            setIsProcessing(true);
            processSpeechResult(transcript);
            recognition.stop();
            break;
          }
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsProcessing(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentAffirmation]);

  const processSpeechResult = (transcript: string) => {
    const affirmationWords = currentAffirmation.text.toLowerCase().split(/\s+/);
    const spokenWords = transcript.toLowerCase().split(/\s+/);
    
    // Check if the spoken words match a significant portion of the affirmation
    const matchedWords = affirmationWords.filter(word => 
      spokenWords.some(spokenWord => 
        spokenWord.includes(word) || word.includes(spokenWord)
      )
    );
    
    // If at least 60% of the affirmation words are matched, trigger the animation
    if (matchedWords.length >= affirmationWords.length * 0.6) {
      // Mark all letters as clicked
      const totalLetters = currentAffirmation.text.length;
      const allLetters = new Set(Array.from({ length: totalLetters }, (_, i) => i));
      setClickedLetters(allLetters);
      
      // Trigger burst animation
      setTimeout(() => {
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 2000);
      }, 500);
    }
    
    setIsProcessing(false);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const getRandomAffirmation = (exclude?: string) => {
    const availableAffirmations = exclude 
      ? affirmations.filter(a => a.id !== exclude)
      : affirmations;
    return availableAffirmations[Math.floor(Math.random() * availableAffirmations.length)];
  };

  const handleNewAffirmation = () => {
    const newAffirmation = getRandomAffirmation(currentAffirmation.id);
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

  const handlePreviousAffirmation = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setCurrentAffirmation(affirmationHistory[prevIndex]);
      setHistoryIndex(prevIndex);
      setClickedLetters(new Set());
      setShowBurst(false);
    }
  };

  const handleLetterClick = (index: number) => {
    const newClickedLetters = new Set(clickedLetters);
    newClickedLetters.add(index);
    setClickedLetters(newClickedLetters);

    // Check if all letters are clicked
    const totalLetters = currentAffirmation.text.length;
    if (newClickedLetters.size === totalLetters) {
      setTimeout(() => {
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 2000);
      }, 500);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      // Scrolling up - new affirmation
      handleNewAffirmation();
    } else if (e.deltaY > 0) {
      // Scrolling down - previous affirmation
      handlePreviousAffirmation();
    }
  };

  const toggleBookmark = () => {
    const isBookmarked = bookmarks.some(b => b.id === currentAffirmation.id);
    
    if (isBookmarked) {
      setBookmarks(bookmarks.filter(b => b.id !== currentAffirmation.id));
    } else {
      setBookmarks([...bookmarks, { ...currentAffirmation, isPinned: false }]);
    }
  };

  const togglePin = (id: string) => {
    setBookmarks(bookmarks.map(b => 
      b.id === id ? { ...b, isPinned: !b.isPinned } : b
    ));
  };

  const removeBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const shareAffirmation = () => {
    const url = `${window.location.origin}?affirmation=${encodeURIComponent(currentAffirmation.id)}`;
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
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
      case 'love': return <Heart className="w-6 h-6 text-pink-500" />;
      case 'wealth': return <DollarBillIcon className="w-6 h-6" />;
      case 'health': return <HealthIcon className="w-6 h-6" />;
      case 'learning': return <span className="text-2xl">⭐</span>;
      default: return <Heart className="w-6 h-6 text-pink-500" />;
    }
  };

  const filteredAffirmations = affirmations.filter(affirmation => {
    const matchesSearch = affirmation.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || affirmation.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const isBookmarked = bookmarks.some(b => b.id === currentAffirmation.id);

  const renderLetter = (letter: string, index: number) => {
    const isClicked = clickedLetters.has(index);
    const isSpace = letter === ' ';
    
    if (isSpace) {
      return <span key={index} className="inline-block w-4"></span>;
    }

    return (
      <span
        key={index}
        className={`
          inline-block cursor-pointer transition-all duration-300 letter-sparkle
          ${isClicked 
            ? `${getCategoryClass(currentAffirmation.category)} ${getCategoryGlowClass(currentAffirmation.category)}` 
            : 'text-gray-800 hover:text-gray-600'
          }
        `}
        onClick={() => handleLetterClick(index)}
      >
        {letter}
      </span>
    );
  };

  if (currentView === 'bookmarks') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentView('main')}
              className="p-2 rounded-full hover:bg-white/50 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Bookmarks</h1>
            <div className="w-10"></div>
          </div>

          {/* Bookmarks List */}
          <div className="space-y-3">
            {sortedBookmarks.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No bookmarks yet</p>
                <p className="text-sm text-gray-400 mt-2">Save your favorite affirmations to see them here</p>
              </div>
            ) : (
              sortedBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800 leading-relaxed">{bookmark.text}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${bookmark.category === 'love' ? 'bg-pink-100 text-pink-700' : ''}
                          ${bookmark.category === 'wealth' ? 'bg-green-100 text-green-700' : ''}
                          ${bookmark.category === 'health' ? 'bg-blue-100 text-blue-700' : ''}
                          ${bookmark.category === 'learning' ? 'bg-yellow-100 text-yellow-700' : ''}
                        `}>
                          {bookmark.category}
                        </span>
                        <button
                          onClick={() => togglePin(bookmark.id)}
                          className={`p-1 rounded transition-colors ${
                            bookmark.isPinned 
                              ? 'text-blue-600 hover:text-blue-700' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'search') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentView('main')}
              className="p-2 rounded-full hover:bg-white/50 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Search</h1>
            <div className="w-10"></div>
          </div>

          {/* Search Input */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search affirmations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {['all', 'love', 'wealth', 'health', 'learning'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-3">
            {filteredAffirmations.map((affirmation) => (
              <div
                key={affirmation.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setCurrentAffirmation(affirmation);
                  setClickedLetters(new Set());
                  setShowBurst(false);
                  setCurrentView('main');
                }}
              >
                <p className="text-gray-800 leading-relaxed">{affirmation.text}</p>
                <span className={`
                  inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium
                  ${affirmation.category === 'love' ? 'bg-pink-100 text-pink-700' : ''}
                  ${affirmation.category === 'wealth' ? 'bg-green-100 text-green-700' : ''}
                  ${affirmation.category === 'health' ? 'bg-blue-100 text-blue-700' : ''}
                  ${affirmation.category === 'learning' ? 'bg-yellow-100 text-yellow-700' : ''}
                `}>
                  {affirmation.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col relative overflow-hidden"
      onWheel={handleWheel}
    >
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-4 relative z-10">
        <button
          onClick={handleNewAffirmation}
          className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors"
          style={{ fontFamily: 'Fredoka One, cursive' }}
        >
          Goaly
        </button>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setCurrentView('bookmarks')}
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <Bookmark className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={handleNewAffirmation}
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <Plus className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={() => setCurrentView('search')}
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <Search className="w-6 h-6 text-gray-700" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 relative">
        <div className="max-w-2xl w-full text-center">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8 select-none"
            style={{ fontFamily: 'Fredoka One, cursive' }}
          >
            {currentAffirmation.text.split('').map((letter, index) => renderLetter(letter, index))}
          </h1>
        </div>

        {/* Right Side Actions */}
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4">
          <button
            onClick={toggleBookmark}
            className={`p-3 rounded-full shadow-lg transition-all ${
              isBookmarked 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Bookmark className="w-6 h-6" />
          </button>
          <button
            onClick={shareAffirmation}
            className="p-3 rounded-full bg-white text-gray-700 hover:bg-gray-50 shadow-lg transition-colors"
          >
            <Share className="w-6 h-6" />
          </button>
          <button
            onClick={startListening}
            className={`p-3 rounded-full shadow-lg transition-all ${
              isListening || isProcessing
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
            disabled={isListening || isProcessing}
          >
            <Mic className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Burst Animation */}
      {showBurst && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: '50%',
                top: '50%',
                animationDelay: `${i * 100}ms`,
                animationDuration: '2s',
                '--end-x': `${(Math.random() - 0.5) * 400}px`,
                '--end-y': `${(Math.random() - 0.5) * 400}px`,
              } as React.CSSProperties}
            >
              {getBurstIcon(currentAffirmation.category)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;