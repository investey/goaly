import React, { useState, useEffect, useRef } from 'react';
import { Heart, Bookmark, Share2, Search, Plus, Menu, ArrowLeft, Pin, X, Mic } from 'lucide-react';
import { DollarBillIcon } from './components/DollarBillIcon';
import { HealthIcon } from './components/HealthIcon';

// Affirmation categories and data
const affirmations = {
  love: [
    "I am worthy of love and affection",
    "I radiate love and attract loving relationships",
    "I love and accept myself completely",
    "My heart is open to giving and receiving love",
    "I deserve healthy and fulfilling relationships",
    "I am grateful for the love in my life",
    "Love flows freely to and from me",
    "I attract people who appreciate and value me",
    "I am lovable exactly as I am",
    "My relationships are built on trust and respect"
  ],
  wealth: [
    "I am a magnet for financial abundance",
    "Money flows to me easily and effortlessly",
    "I deserve to be wealthy and prosperous",
    "My income increases every month",
    "I make smart financial decisions",
    "Opportunities for wealth surround me",
    "I am grateful for my financial blessings",
    "I attract lucrative business opportunities",
    "My wealth grows while I sleep",
    "I have multiple streams of income"
  ],
  health: [
    "My body is strong and healthy",
    "I nourish my body with healthy choices",
    "Every cell in my body vibrates with energy",
    "I am grateful for my healthy body",
    "I choose foods that fuel my vitality",
    "My body heals quickly and completely",
    "I enjoy exercising and moving my body",
    "I sleep peacefully and wake refreshed",
    "My mind and body are in perfect harmony",
    "I radiate health and wellness"
  ],
  learning: [
    "I am constantly growing and learning",
    "My mind is sharp and focused",
    "I easily absorb new information",
    "Learning comes naturally to me",
    "I am curious and open to new experiences",
    "My knowledge expands every day",
    "I embrace challenges as opportunities to grow",
    "I am intelligent and capable",
    "I retain information easily",
    "My creativity flows freely"
  ]
};

const allAffirmations = [
  ...affirmations.love,
  ...affirmations.wealth,
  ...affirmations.health,
  ...affirmations.learning
];

const getAffirmationCategory = (affirmation: string) => {
  if (affirmations.love.includes(affirmation)) return 'love';
  if (affirmations.wealth.includes(affirmation)) return 'wealth';
  if (affirmations.health.includes(affirmation)) return 'health';
  if (affirmations.learning.includes(affirmation)) return 'learning';
  return 'love';
};

const getCategoryKeywords = (category: string) => {
  switch (category) {
    case 'love':
      return ['love', 'heart', 'relationship', 'affection', 'romance', 'beloved', 'caring', 'tender', 'loving', 'adore'];
    case 'wealth':
      return ['money', 'wealth', 'rich', 'abundant', 'prosperity', 'financial', 'income', 'business', 'success', 'profitable'];
    case 'health':
      return ['health', 'healthy', 'strong', 'energy', 'vitality', 'fitness', 'wellness', 'healing', 'nourish', 'exercise'];
    case 'learning':
      return ['learn', 'knowledge', 'smart', 'intelligent', 'growth', 'education', 'study', 'wisdom', 'creative', 'curious'];
    default:
      return [];
  }
};

interface LetterState {
  isClicked: boolean;
  isAnimating: boolean;
}

interface BurstParticle {
  id: number;
  x: number;
  y: number;
  endX: number;
  endY: number;
  icon: string;
}

const App: React.FC = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState(allAffirmations[0]);
  const [affirmationHistory, setAffirmationHistory] = useState<string[]>([allAffirmations[0]]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [letterStates, setLetterStates] = useState<{ [key: number]: LetterState }>({});
  const [burstParticles, setBurstParticles] = useState<BurstParticle[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [pinnedBookmarks, setPinnedBookmarks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const category = getAffirmationCategory(currentAffirmation);

  // Load bookmarks from localStorage on component mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('affirmationBookmarks');
    const savedPinned = localStorage.getItem('pinnedBookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
    if (savedPinned) {
      setPinnedBookmarks(JSON.parse(savedPinned));
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('affirmationBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('pinnedBookmarks', JSON.stringify(pinnedBookmarks));
  }, [pinnedBookmarks]);

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
        processSpeechResult(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsProcessing(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsProcessing(false);
      };
    }
  }, []);

  const processSpeechResult = (transcript: string) => {
    setIsProcessing(true);
    
    // Get keywords for current category
    const keywords = getCategoryKeywords(category);
    
    // Check if any keyword is mentioned
    const foundKeyword = keywords.find(keyword => 
      transcript.includes(keyword.toLowerCase())
    );
    
    if (foundKeyword) {
      console.log('Keyword found:', foundKeyword);
      // Trigger animation for all letters
      const newLetterStates: { [key: number]: LetterState } = {};
      const letters = currentAffirmation.replace(/\s/g, '').split('');
      
      letters.forEach((_, index) => {
        newLetterStates[index] = { isClicked: true, isAnimating: true };
      });
      
      setLetterStates(newLetterStates);
      
      // Trigger burst animation after a short delay
      setTimeout(() => {
        triggerBurstAnimation();
      }, 500);
    }
    
    setIsProcessing(false);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      setIsProcessing(true);
      recognitionRef.current.start();
    }
  };

  const getRandomAffirmation = () => {
    let newAffirmation;
    do {
      newAffirmation = allAffirmations[Math.floor(Math.random() * allAffirmations.length)];
    } while (newAffirmation === currentAffirmation);
    return newAffirmation;
  };

  const goToNextAffirmation = () => {
    const newAffirmation = getRandomAffirmation();
    setCurrentAffirmation(newAffirmation);
    
    // Add to history and manage history size
    const newHistory = [...affirmationHistory.slice(0, currentIndex + 1), newAffirmation];
    if (newHistory.length > 10) {
      newHistory.shift();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
    setAffirmationHistory(newHistory);
    
    // Reset letter states
    setLetterStates({});
    setBurstParticles([]);
  };

  const goToPreviousAffirmation = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentAffirmation(affirmationHistory[newIndex]);
      setLetterStates({});
      setBurstParticles([]);
    }
  };

  const handleLetterClick = (index: number) => {
    setLetterStates(prev => ({
      ...prev,
      [index]: { isClicked: true, isAnimating: true }
    }));

    // Check if all letters are clicked
    const letters = currentAffirmation.replace(/\s/g, '').split('');
    const allClicked = letters.every((_, i) => 
      letterStates[i]?.isClicked || i === index
    );

    if (allClicked) {
      setTimeout(() => {
        triggerBurstAnimation();
      }, 500);
    }
  };

  const triggerBurstAnimation = () => {
    const particles: BurstParticle[] = [];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * 2 * Math.PI;
      const distance = 150 + Math.random() * 100;
      particles.push({
        id: i,
        x: centerX,
        y: centerY,
        endX: Math.cos(angle) * distance,
        endY: Math.sin(angle) * distance,
        icon: category
      });
    }

    setBurstParticles(particles);

    setTimeout(() => {
      setBurstParticles([]);
    }, 1000);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (showBookmarks || showSearch) return;
    
    if (e.deltaY < 0) {
      goToNextAffirmation();
    } else if (e.deltaY > 0) {
      goToPreviousAffirmation();
    }
  };

  const toggleBookmark = () => {
    if (bookmarks.includes(currentAffirmation)) {
      setBookmarks(bookmarks.filter(b => b !== currentAffirmation));
      setPinnedBookmarks(pinnedBookmarks.filter(p => p !== currentAffirmation));
    } else {
      setBookmarks([...bookmarks, currentAffirmation]);
    }
  };

  const togglePin = (affirmation: string) => {
    if (pinnedBookmarks.includes(affirmation)) {
      setPinnedBookmarks(pinnedBookmarks.filter(p => p !== affirmation));
    } else {
      setPinnedBookmarks([...pinnedBookmarks, affirmation]);
    }
  };

  const removeBookmark = (affirmation: string) => {
    setBookmarks(bookmarks.filter(b => b !== affirmation));
    setPinnedBookmarks(pinnedBookmarks.filter(p => p !== affirmation));
  };

  const shareAffirmation = () => {
    const url = `${window.location.origin}?affirmation=${encodeURIComponent(currentAffirmation)}`;
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

  const filteredAffirmations = selectedCategory 
    ? affirmations[selectedCategory as keyof typeof affirmations]
    : allAffirmations.filter(aff => 
        aff.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const selectAffirmation = (affirmation: string) => {
    setCurrentAffirmation(affirmation);
    setShowSearch(false);
    setShowBookmarks(false);
    setSearchQuery('');
    setSelectedCategory(null);
    setLetterStates({});
    setBurstParticles([]);
    
    // Add to history
    const newHistory = [...affirmationHistory.slice(0, currentIndex + 1), affirmation];
    if (newHistory.length > 10) {
      newHistory.shift();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
    setAffirmationHistory(newHistory);
  };

  const renderLetter = (letter: string, index: number, letterIndex: number) => {
    if (letter === ' ') return ' ';
    
    const state = letterStates[letterIndex];
    const isClicked = state?.isClicked || false;
    
    const baseClasses = "cursor-pointer transition-all duration-300 font-['Fredoka_One'] text-6xl md:text-7xl lg:text-8xl select-none";
    const categoryClasses = {
      love: isClicked ? 'letter-fill letter-sparkle letter-glow' : 'text-pink-200 hover:text-pink-300',
      wealth: isClicked ? 'letter-fill-wealth letter-sparkle letter-glow-wealth' : 'text-green-200 hover:text-green-300',
      health: isClicked ? 'letter-fill-health letter-sparkle letter-glow-health' : 'text-blue-200 hover:text-blue-300',
      learning: isClicked ? 'letter-fill-learning letter-sparkle letter-glow-learning' : 'text-yellow-200 hover:text-yellow-300'
    };

    return (
      <span
        key={`${index}-${letterIndex}`}
        className={`${baseClasses} ${categoryClasses[category as keyof typeof categoryClasses]}`}
        onClick={() => handleLetterClick(letterIndex)}
        style={{
          display: 'inline-block',
          transform: isClicked ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        {letter}
      </span>
    );
  };

  const renderAffirmation = () => {
    const words = currentAffirmation.split(' ');
    let letterIndex = 0;

    return words.map((word, wordIndex) => (
      <span key={wordIndex} className="inline-block mr-4 mb-2">
        {word.split('').map((letter, charIndex) => {
          const rendered = renderLetter(letter, wordIndex * 100 + charIndex, letterIndex);
          letterIndex++;
          return rendered;
        })}
      </span>
    ));
  };

  const renderBurstParticle = (particle: BurstParticle) => {
    const iconMap = {
      love: '💖',
      wealth: <DollarBillIcon className="w-8 h-8" />,
      health: <HealthIcon className="w-8 h-8" />,
      learning: '⭐'
    };

    return (
      <div
        key={particle.id}
        className="fixed pointer-events-none z-50"
        style={{
          left: particle.x,
          top: particle.y,
          '--end-x': `${particle.endX}px`,
          '--end-y': `${particle.endY}px`,
          animation: 'heartBurst 1s ease-out forwards'
        } as React.CSSProperties}
      >
        <div className="text-4xl">
          {iconMap[particle.icon as keyof typeof iconMap]}
        </div>
      </div>
    );
  };

  const sortedBookmarks = [
    ...bookmarks.filter(b => pinnedBookmarks.includes(b)),
    ...bookmarks.filter(b => !pinnedBookmarks.includes(b))
  ];

  if (showBookmarks) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setShowBookmarks(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Saved Affirmations</h1>
            <div className="w-10"></div>
          </div>

          <div className="space-y-4">
            {sortedBookmarks.length === 0 ? (
              <p className="text-center text-gray-300 mt-12">No saved affirmations yet</p>
            ) : (
              sortedBookmarks.map((affirmation, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between hover:bg-white/20 transition-colors cursor-pointer"
                  onClick={() => selectAffirmation(affirmation)}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(affirmation);
                      }}
                      className={`p-1 rounded ${pinnedBookmarks.includes(affirmation) ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <span className="flex-1">{affirmation}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBookmark(affirmation);
                    }}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showSearch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold">Search Affirmations</h1>
            <div className="w-10"></div>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search affirmations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Object.keys(affirmations).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(selectedCategory === cat ? null : cat);
                  setSearchQuery('');
                }}
                className={`p-3 rounded-lg text-center capitalize transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredAffirmations.map((affirmation, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer"
                onClick={() => selectAffirmation(affirmation)}
              >
                {affirmation}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden relative"
      onWheel={handleWheel}
    >
      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goToNextAffirmation}
            className="text-2xl font-bold hover:text-blue-300 transition-colors font-['Fredoka_One']"
          >
            Goaly
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowBookmarks(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Bookmark className="w-6 h-6" />
            </button>
            <button
              onClick={goToNextAffirmation}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Search className="w-6 h-6" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 flex flex-col space-y-4">
        <button
          onClick={toggleBookmark}
          className={`p-3 rounded-full transition-colors ${
            bookmarks.includes(currentAffirmation)
              ? 'bg-blue-500 text-white'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <Bookmark className="w-6 h-6" />
        </button>
        <button
          onClick={shareAffirmation}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      {/* Microphone Button */}
      <div className="absolute bottom-8 right-8 z-40">
        <button
          onClick={startListening}
          disabled={isListening}
          className={`p-4 rounded-full transition-all duration-300 ${
            isListening || isProcessing
              ? 'bg-red-500 animate-pulse'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <Mic className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="leading-tight">
            {renderAffirmation()}
          </div>
        </div>
      </div>

      {/* Burst Animation */}
      {burstParticles.map(renderBurstParticle)}
    </div>
  );
};

export default App;