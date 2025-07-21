import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Bookmark, 
  BookmarkCheck, 
  Search, 
  ArrowLeft, 
  Menu, 
  Link,
  Plus,
  Heart,
  Star,
  Thumbtack,
  X
} from 'lucide-react';
import { DollarBillIcon } from './components/DollarBillIcon';
import { HealthIcon } from './components/HealthIcon';
import { secureStorage, generateSecureId, rateLimiter } from './utils/security';

// Affirmations data organized by category
const affirmationsData = {
  love: [
    "I am worthy of love and respect",
    "I choose to love myself unconditionally",
    "I attract healthy and loving relationships",
    "I am enough just as I am",
    "I radiate love and positivity",
    "I deserve happiness and joy",
    "I am confident in who I am",
    "I trust in my ability to create meaningful connections",
    "I am grateful for the love in my life",
    "I choose to see the beauty in myself and others",
    "I am open to giving and receiving love",
    "I honor my feelings and emotions",
    "I am worthy of kindness and compassion",
    "I create space for love to flourish in my life",
    "I am deserving of respect and understanding"
  ],
  wealth: [
    "I am a magnet for financial abundance",
    "Money flows to me easily and effortlessly",
    "I am worthy of financial prosperity",
    "I make smart financial decisions",
    "I attract opportunities for wealth creation",
    "I am grateful for my financial blessings",
    "I have a positive relationship with money",
    "I am open to receiving wealth from multiple sources",
    "I invest wisely in my future",
    "I am financially free and independent",
    "I create value and am compensated abundantly",
    "I am confident in my ability to generate income",
    "I attract prosperity in all areas of my life",
    "I am worthy of living a life of abundance",
    "I make decisions that support my financial growth"
  ],
  health: [
    "I am strong, healthy, and full of energy",
    "I nourish my body with healthy choices",
    "I am grateful for my body and treat it with respect",
    "I have the power to heal and transform my health",
    "I choose foods that fuel my body optimally",
    "I enjoy moving my body and staying active",
    "I am committed to my health and well-being",
    "I listen to my body and give it what it needs",
    "I am getting stronger and healthier every day",
    "I prioritize rest and recovery for optimal health",
    "I am in tune with my body's natural rhythms",
    "I make choices that support my long-term health",
    "I am worthy of feeling vibrant and alive",
    "I trust my body's ability to heal and regenerate",
    "I create healthy habits that serve my highest good"
  ],
  learning: [
    "I am capable of learning anything I set my mind to",
    "I embrace challenges as opportunities to grow",
    "I am curious and open to new experiences",
    "I learn from every situation and interaction",
    "I am constantly expanding my knowledge and skills",
    "I trust in my ability to understand and master new concepts",
    "I am patient with myself as I learn and grow",
    "I celebrate my progress and achievements",
    "I am committed to lifelong learning and development",
    "I approach learning with enthusiasm and joy",
    "I am confident in my ability to solve problems",
    "I learn from my mistakes and use them to improve",
    "I am open to feedback and constructive criticism",
    "I invest in my education and personal development",
    "I am becoming the best version of myself every day"
  ]
};

// Get all affirmations in a single array
const getAllAffirmations = () => {
  return [
    ...affirmationsData.love.map(text => ({ text, category: 'love' })),
    ...affirmationsData.wealth.map(text => ({ text, category: 'wealth' })),
    ...affirmationsData.health.map(text => ({ text, category: 'health' })),
    ...affirmationsData.learning.map(text => ({ text, category: 'learning' }))
  ];
};

interface BookmarkedAffirmation {
  id: string;
  text: string;
  category: string;
  isPinned: boolean;
  timestamp: number;
}

interface LetterState {
  isClicked: boolean;
  isAnimating: boolean;
}

interface BurstParticle {
  id: string;
  x: number;
  y: number;
  endX: number;
  endY: number;
  delay: number;
  category: string;
}

// Speech Recognition types
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

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => any) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const App: React.FC = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState(() => {
    const allAffirmations = getAllAffirmations();
    return allAffirmations[Math.floor(Math.random() * allAffirmations.length)];
  });
  
  const [letterStates, setLetterStates] = useState<LetterState[]>([]);
  const [burstParticles, setBurstParticles] = useState<BurstParticle[]>([]);
  const [showBurst, setShowBurst] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkedAffirmation[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{text: string, category: string}>>([]);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [affirmationHistory, setAffirmationHistory] = useState<Array<{text: string, category: string}>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [microphoneHoldTimer, setMicrophoneHoldTimer] = useState<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize letter states when affirmation changes
  useEffect(() => {
    const letters = currentAffirmation.text.split('').filter(char => char !== ' ');
    setLetterStates(letters.map(() => ({ isClicked: false, isAnimating: false })));
    setBurstParticles([]);
    setShowBurst(false);
  }, [currentAffirmation]);

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

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (isContinuousMode) {
            // Restart recognition in continuous mode
            setTimeout(() => {
              if (recognitionRef.current && isContinuousMode) {
                try {
                  recognitionRef.current.start();
                } catch (error) {
                  console.log('Recognition restart failed:', error);
                }
              }
            }, 100);
          }
        };

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }

          if (finalTranscript.trim()) {
            handleVoiceCommand(finalTranscript.trim().toLowerCase());
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event);
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isContinuousMode]);

  const handleVoiceCommand = (command: string) => {
    if (!rateLimiter.isAllowed('voice-command', 20, 60000)) {
      console.warn('Voice command rate limit exceeded');
      return;
    }

    // Commands for navigation
    if (command.includes('next') || command.includes('new affirmation')) {
      getNewAffirmation();
    } else if (command.includes('bookmark') || command.includes('save')) {
      handleBookmark();
    } else if (command.includes('share')) {
      handleShare();
    } else if (command.includes('search')) {
      setShowSearch(true);
    } else if (command.includes('bookmarks') || command.includes('saved')) {
      setShowBookmarks(true);
    } else if (command.includes('back') || command.includes('home')) {
      setShowBookmarks(false);
      setShowSearch(false);
    }
    
    // Category-specific commands
    else if (command.includes('love')) {
      const loveAffirmations = affirmationsData.love.map(text => ({ text, category: 'love' }));
      const randomLove = loveAffirmations[Math.floor(Math.random() * loveAffirmations.length)];
      setCurrentAffirmation(randomLove);
      addToHistory(randomLove);
    } else if (command.includes('wealth') || command.includes('money')) {
      const wealthAffirmations = affirmationsData.wealth.map(text => ({ text, category: 'wealth' }));
      const randomWealth = wealthAffirmations[Math.floor(Math.random() * wealthAffirmations.length)];
      setCurrentAffirmation(randomWealth);
      addToHistory(randomWealth);
    } else if (command.includes('health') || command.includes('fitness')) {
      const healthAffirmations = affirmationsData.health.map(text => ({ text, category: 'health' }));
      const randomHealth = healthAffirmations[Math.floor(Math.random() * healthAffirmations.length)];
      setCurrentAffirmation(randomHealth);
      addToHistory(randomHealth);
    } else if (command.includes('learning') || command.includes('growth')) {
      const learningAffirmations = affirmationsData.learning.map(text => ({ text, category: 'learning' }));
      const randomLearning = learningAffirmations[Math.floor(Math.random() * learningAffirmations.length)];
      setCurrentAffirmation(randomLearning);
      addToHistory(randomLearning);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsContinuousMode(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  };

  const handleMicrophoneMouseDown = () => {
    const timer = setTimeout(() => {
      setIsContinuousMode(true);
      if (recognitionRef.current && !isListening) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Failed to start continuous recognition:', error);
        }
      }
    }, 1000); // 1 second hold to activate continuous mode
    
    setMicrophoneHoldTimer(timer);
  };

  const handleMicrophoneMouseUp = () => {
    if (microphoneHoldTimer) {
      clearTimeout(microphoneHoldTimer);
      setMicrophoneHoldTimer(null);
    }
    
    if (!isContinuousMode) {
      toggleListening();
    }
  };

  const addToHistory = (affirmation: {text: string, category: string}) => {
    setAffirmationHistory(prev => {
      const newHistory = [affirmation, ...prev.slice(0, 9)]; // Keep last 10
      return newHistory;
    });
    setHistoryIndex(-1);
  };

  const getNewAffirmation = () => {
    if (!rateLimiter.isAllowed('new-affirmation', 30, 60000)) {
      console.warn('New affirmation rate limit exceeded');
      return;
    }

    const allAffirmations = getAllAffirmations();
    let newAffirmation;
    do {
      newAffirmation = allAffirmations[Math.floor(Math.random() * allAffirmations.length)];
    } while (newAffirmation.text === currentAffirmation.text && allAffirmations.length > 1);
    
    addToHistory(currentAffirmation);
    setCurrentAffirmation(newAffirmation);
  };

  const goToPreviousAffirmation = () => {
    if (affirmationHistory.length > 0) {
      const nextIndex = Math.min(historyIndex + 1, affirmationHistory.length - 1);
      if (historyIndex === -1) {
        // First time going back, add current to history
        setAffirmationHistory(prev => [currentAffirmation, ...prev]);
        setCurrentAffirmation(affirmationHistory[0]);
        setHistoryIndex(0);
      } else if (nextIndex < affirmationHistory.length) {
        setCurrentAffirmation(affirmationHistory[nextIndex]);
        setHistoryIndex(nextIndex);
      }
    }
  };

  const goToNextInHistory = () => {
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1;
      setCurrentAffirmation(affirmationHistory[nextIndex]);
      setHistoryIndex(nextIndex);
    } else if (historyIndex === 0) {
      // Go back to the most recent (current) affirmation
      const mostRecent = affirmationHistory[0];
      setCurrentAffirmation(mostRecent);
      setHistoryIndex(-1);
    }
  };

  const handleLetterClick = (index: number) => {
    if (!rateLimiter.isAllowed('letter-click', 100, 60000)) {
      return;
    }

    setLetterStates(prev => {
      const newStates = [...prev];
      if (!newStates[index].isClicked) {
        newStates[index] = { isClicked: true, isAnimating: true };
        
        // Stop animation after a delay
        setTimeout(() => {
          setLetterStates(current => {
            const updated = [...current];
            if (updated[index]) {
              updated[index].isAnimating = false;
            }
            return updated;
          });
        }, 3500);
      }
      return newStates;
    });

    // Check if all letters are clicked
    const updatedStates = [...letterStates];
    updatedStates[index] = { isClicked: true, isAnimating: true };
    
    if (updatedStates.every(state => state.isClicked)) {
      triggerBurstAnimation();
    }
  };

  const triggerBurstAnimation = () => {
    const particles: BurstParticle[] = [];
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: generateSecureId(),
        x: 50, // Start from center
        y: 50,
        endX: (Math.random() - 0.5) * 200, // Random end position
        endY: (Math.random() - 0.5) * 200,
        delay: Math.random() * 0.5, // Random delay up to 0.5s
        category: currentAffirmation.category
      });
    }
    
    setBurstParticles(particles);
    setShowBurst(true);
    
    // Clear burst after animation
    setTimeout(() => {
      setShowBurst(false);
      setBurstParticles([]);
    }, 2000);
  };

  const renderBurstIcon = (category: string) => {
    switch (category) {
      case 'love':
        return <Heart className="w-6 h-6 text-pink-500" />;
      case 'wealth':
        return <DollarBillIcon className="w-6 h-6" />;
      case 'health':
        return <HealthIcon className="w-6 h-6" />;
      case 'learning':
        return <Star className="w-6 h-6 text-yellow-500" />;
      default:
        return <Heart className="w-6 h-6 text-pink-500" />;
    }
  };

  const isBookmarked = bookmarks.some(bookmark => bookmark.text === currentAffirmation.text);

  const handleBookmark = () => {
    if (!rateLimiter.isAllowed('bookmark', 20, 60000)) {
      console.warn('Bookmark rate limit exceeded');
      return;
    }

    if (isBookmarked) {
      setBookmarks(prev => prev.filter(bookmark => bookmark.text !== currentAffirmation.text));
    } else {
      const newBookmark: BookmarkedAffirmation = {
        id: generateSecureId(),
        text: currentAffirmation.text,
        category: currentAffirmation.category,
        isPinned: false,
        timestamp: Date.now()
      };
      setBookmarks(prev => [...prev, newBookmark]);
    }
  };

  const handleShare = async () => {
    if (!rateLimiter.isAllowed('share', 10, 60000)) {
      console.warn('Share rate limit exceeded');
      return;
    }

    const shareUrl = `${window.location.origin}?affirmation=${encodeURIComponent(currentAffirmation.text)}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 3000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const togglePin = (id: string) => {
    setBookmarks(prev => 
      prev.map(bookmark => 
        bookmark.id === id 
          ? { ...bookmark, isPinned: !bookmark.isPinned }
          : bookmark
      )
    );
  };

  const deleteBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const allAffirmations = getAllAffirmations();
      const results = allAffirmations.filter(affirmation =>
        affirmation.text.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const selectAffirmation = (affirmation: {text: string, category: string}) => {
    addToHistory(currentAffirmation);
    setCurrentAffirmation(affirmation);
    setShowSearch(false);
    setShowBookmarks(false);
  };

  const selectCategoryAffirmations = (category: keyof typeof affirmationsData) => {
    const categoryAffirmations = affirmationsData[category].map(text => ({ text, category }));
    setSearchResults(categoryAffirmations);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > 50) { // Threshold to prevent accidental triggers
      if (e.deltaY < 0) {
        // Scrolling up - new affirmation
        getNewAffirmation();
      } else {
        // Scrolling down - previous affirmation
        goToPreviousAffirmation();
      }
    }
  };

  const handleTouchStart = useRef({ y: 0, time: 0 });
  const handleTouchMove = useRef({ y: 0 });

  const onTouchStart = (e: React.TouchEvent) => {
    handleTouchStart.current = {
      y: e.touches[0].clientY,
      time: Date.now()
    };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleTouchMove.current = {
      y: e.touches[0].clientY
    };
  };

  const onTouchEnd = () => {
    const deltaY = handleTouchStart.current.y - handleTouchMove.current.y;
    const deltaTime = Date.now() - handleTouchStart.current.time;
    
    // Check for swipe (minimum distance and maximum time)
    if (Math.abs(deltaY) > 50 && deltaTime < 500) {
      if (deltaY > 0) {
        // Swiping up - new affirmation
        getNewAffirmation();
      } else {
        // Swiping down - previous affirmation
        goToPreviousAffirmation();
      }
    }
  };

  // Check for shared affirmation in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedAffirmation = urlParams.get('affirmation');
    if (sharedAffirmation) {
      const allAffirmations = getAllAffirmations();
      const foundAffirmation = allAffirmations.find(a => a.text === sharedAffirmation);
      if (foundAffirmation) {
        setCurrentAffirmation(foundAffirmation);
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const renderLetters = () => {
    const letters = currentAffirmation.text.split('');
    let letterIndex = 0;

    return letters.map((char, index) => {
      if (char === ' ') {
        return <span key={index} className="inline-block w-4"></span>;
      }

      const currentLetterIndex = letterIndex;
      letterIndex++;

      const state = letterStates[currentLetterIndex] || { isClicked: false, isAnimating: false };
      const categoryClass = currentAffirmation.category === 'wealth' ? 'wealth' : 
                           currentAffirmation.category === 'health' ? 'health' :
                           currentAffirmation.category === 'learning' ? 'learning' : '';

      return (
        <span
          key={index}
          className={`
            inline-block cursor-pointer transition-all duration-300 text-6xl md:text-7xl lg:text-8xl font-bold
            ${state.isClicked 
              ? `letter-fill${categoryClass ? `-${categoryClass}` : ''} letter-sparkle ${state.isAnimating ? `letter-glow${categoryClass ? `-${categoryClass}` : ''}` : ''}` 
              : 'text-gray-800 hover:text-gray-600'
            }
          `}
          onClick={() => handleLetterClick(currentLetterIndex)}
          style={{
            fontFamily: "'Fredoka One', cursive",
            textShadow: state.isClicked ? 'none' : '2px 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {char}
        </span>
      );
    });
  };

  // Sort bookmarks: pinned first, then by timestamp (newest first)
  const sortedBookmarks = [...bookmarks].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.timestamp - a.timestamp;
  });

  if (showBookmarks) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowBookmarks(false)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
              Saved Affirmations
            </h1>
            <div className="w-16"></div>
          </div>

          {sortedBookmarks.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No saved affirmations yet</p>
              <p className="text-gray-400">Bookmark your favorites to see them here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p 
                        className="text-lg font-medium text-gray-800 cursor-pointer hover:text-gray-600 transition-colors leading-relaxed"
                        onClick={() => selectAffirmation({ text: bookmark.text, category: bookmark.category })}
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                      >
                        {bookmark.text}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${bookmark.category === 'love' ? 'bg-pink-100 text-pink-700' :
                            bookmark.category === 'wealth' ? 'bg-green-100 text-green-700' :
                            bookmark.category === 'health' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'}
                        `}>
                          {bookmark.category}
                        </span>
                        {bookmark.isPinned && (
                          <span className="text-blue-500 text-xs font-medium">📌 Pinned</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePin(bookmark.id)}
                        className={`p-2 rounded-full transition-all duration-200 ${
                          bookmark.isPinned 
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                        }`}
                        title={bookmark.isPinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Thumbtack className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteBookmark(bookmark.id)}
                        className="p-2 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-all duration-200"
                        title="Delete bookmark"
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
  }

  if (showSearch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowSearch(false)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
              Search Affirmations
            </h1>
            <div className="w-16"></div>
          </div>

          <div className="mb-8">
            <input
              type="text"
              placeholder="Search for affirmations..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-6 py-4 text-lg rounded-xl border border-gray-200 focus:border-purple-300 focus:ring-2 focus:ring-purple-100 outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            />
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              Browse by Topic
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => selectCategoryAffirmations('love')}
                className="bg-pink-100 text-pink-800 px-4 py-3 rounded-lg font-medium hover:bg-pink-200 transition-colors"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                #Love
              </button>
              <button
                onClick={() => selectCategoryAffirmations('wealth')}
                className="bg-green-100 text-green-800 px-4 py-3 rounded-lg font-medium hover:bg-green-200 transition-colors"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                #Wealth
              </button>
              <button
                onClick={() => selectCategoryAffirmations('health')}
                className="bg-blue-100 text-blue-800 px-4 py-3 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                #Abundance
              </button>
              <button
                onClick={() => selectCategoryAffirmations('learning')}
                className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded-lg font-medium hover:bg-yellow-200 transition-colors"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                #Learning
              </button>
              <button
                className="bg-purple-100 text-purple-800 px-4 py-3 rounded-lg font-medium hover:bg-purple-200 transition-colors"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                #Natural
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {searchQuery ? `Search Results (${searchResults.length})` : `Results (${searchResults.length})`}
              </h3>
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-white/20 cursor-pointer"
                  onClick={() => selectAffirmation(result)}
                >
                  <p className="text-lg font-medium text-gray-800 leading-relaxed" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    {result.text}
                  </p>
                  <span className={`
                    inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium
                    ${result.category === 'love' ? 'bg-pink-100 text-pink-700' :
                      result.category === 'wealth' ? 'bg-green-100 text-green-700' :
                      result.category === 'health' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'}
                  `}>
                    {result.category}
                  </span>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No affirmations found</p>
              <p className="text-gray-400">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex flex-col relative overflow-hidden"
      onWheel={handleWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Top Navigation */}
      <nav className="flex items-center justify-between p-4 relative z-40">
        <button
          onClick={getNewAffirmation}
          className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
          style={{ fontFamily: "'Fredoka One', cursive" }}
        >
          Goaly
        </button>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowBookmarks(true)}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
          >
            <Bookmark className="w-6 h-6 text-gray-700" />
          </button>
          
          <button
            onClick={getNewAffirmation}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
          >
            <Plus className="w-6 h-6 text-gray-700" />
          </button>
          
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
          >
            <Search className="w-6 h-6 text-gray-700" />
          </button>
          
          <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="text-center max-w-4xl mx-auto relative">
          <div className="leading-tight" style={{ lineHeight: '0.9' }}>
            {renderLetters()}
          </div>
          
          {/* Burst Animation */}
          {showBurst && (
            <div className="absolute inset-0 pointer-events-none">
              {burstParticles.map((particle) => (
                <div
                  key={particle.id}
                  className="absolute"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    transform: 'translate(-50%, -50%)',
                    animation: `heartBurst 1.5s ease-out ${particle.delay}s forwards`,
                    '--end-x': `${particle.endX}px`,
                    '--end-y': `${particle.endY}px`,
                  } as React.CSSProperties}
                >
                  {renderBurstIcon(particle.category)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="absolute right-4 top-1/2 transform translate-y-20 z-50 flex flex-col gap-3">
        {/* Microphone Icon */}
        <button
          onClick={toggleListening}
          onMouseDown={handleMicrophoneMouseDown}
          onMouseUp={handleMicrophoneMouseUp}
          onTouchStart={handleMicrophoneMouseDown}
          onTouchEnd={handleMicrophoneMouseUp}
          className={`p-3 rounded-full hover:scale-110 transition-all duration-200 ${
            isContinuousMode
              ? 'bg-green-500 animate-pulse'
              : isListening 
                ? 'bg-red-500 animate-pulse' 
                : 'bg-white/20 backdrop-blur-sm hover:bg-white/30'
          }`}
        >
          <svg 
            className={`w-6 h-6 ${isListening ? 'text-white animate-pulse' : 'text-gray-700'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
            />
          </svg>
        </button>
        
        {/* Bookmark icon */}
        <button
          onClick={handleBookmark}
          className="p-3 bg-white bg-opacity-20 rounded-full hover:scale-110 transition-all duration-200"
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-6 h-6 text-blue-500" />
          ) : (
            <Bookmark className="w-6 h-6 text-gray-600" />
          )}
        </button>

        {/* Share icon */}
        <button
          onClick={handleShare}
          className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
        >
          <Link className="w-6 h-6 text-gray-600" />
        </button>
      </div>
        
      {/* Copy Alert */}
      {showCopyAlert && (
        <div className="absolute top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          Link copied to clipboard!
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-gray-600 text-sm" style={{ fontFamily: "'Fredoka', sans-serif" }}>
          Click each letter to make it glow ✨
        </p>
        <p className="text-gray-500 text-xs mt-1" style={{ fontFamily: "'Fredoka', sans-serif" }}>
          Scroll or swipe for new affirmations
        </p>
      </div>
    </div>
  );
};

export default App;