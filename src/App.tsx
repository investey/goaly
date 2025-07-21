import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bookmark, Share2, Plus, Search, Menu, ArrowLeft, Pin, X, Mic } from 'lucide-react';
import { DollarBillIcon } from './components/DollarBillIcon';
import { HealthIcon } from './components/HealthIcon';
import { secureStorage, rateLimiter } from './utils/security';

// Affirmations data with categories
const affirmations = [
  // Love & Self-Love (Pink)
  { text: "I am worthy of love and respect", category: "love" },
  { text: "I choose to love myself unconditionally", category: "love" },
  { text: "I attract loving and supportive relationships", category: "love" },
  { text: "I am enough exactly as I am", category: "love" },
  { text: "I radiate love and positivity", category: "love" },
  { text: "I deserve happiness and joy in my life", category: "love" },
  { text: "I am beautiful inside and out", category: "love" },
  { text: "I forgive myself and others with compassion", category: "love" },
  { text: "I am grateful for the love in my life", category: "love" },
  { text: "I trust in my ability to create meaningful connections", category: "love" },
  
  // Wealth & Business (Green)
  { text: "I am a magnet for financial abundance", category: "wealth" },
  { text: "Money flows to me easily and effortlessly", category: "wealth" },
  { text: "I make smart financial decisions", category: "wealth" },
  { text: "I am worthy of financial success", category: "wealth" },
  { text: "Opportunities for wealth surround me", category: "wealth" },
  { text: "I create value and receive abundance in return", category: "wealth" },
  { text: "My business grows and prospers every day", category: "wealth" },
  { text: "I am confident in my ability to generate income", category: "wealth" },
  { text: "I attract successful business partnerships", category: "wealth" },
  { text: "Financial freedom is my natural state", category: "wealth" },
  
  // Health & Fitness (Blue)
  { text: "I am strong, healthy, and full of energy", category: "health" },
  { text: "My body is capable of amazing things", category: "health" },
  { text: "I nourish my body with healthy choices", category: "health" },
  { text: "I enjoy moving my body and staying active", category: "health" },
  { text: "I am grateful for my body's strength and resilience", category: "health" },
  { text: "Every day I grow stronger and healthier", category: "health" },
  { text: "I listen to my body and give it what it needs", category: "health" },
  { text: "I radiate vitality and wellness", category: "health" },
  { text: "My mind and body are in perfect harmony", category: "health" },
  { text: "I choose habits that support my wellbeing", category: "health" },
  
  // Learning & Growth (Yellow)
  { text: "I am constantly learning and growing", category: "learning" },
  { text: "I embrace challenges as opportunities to improve", category: "learning" },
  { text: "My mind is open to new ideas and perspectives", category: "learning" },
  { text: "I have the power to learn anything I set my mind to", category: "learning" },
  { text: "Knowledge comes easily to me", category: "learning" },
  { text: "I am curious and eager to expand my understanding", category: "learning" },
  { text: "Every experience teaches me something valuable", category: "learning" },
  { text: "I trust in my ability to solve problems creatively", category: "learning" },
  { text: "I am becoming the best version of myself", category: "learning" },
  { text: "Growth and progress are my natural way of being", category: "learning" }
];

// Category colors and effects
const categoryStyles = {
  love: {
    fillClass: 'letter-fill',
    glowClass: 'letter-glow',
    burstColor: '#ff69b4'
  },
  wealth: {
    fillClass: 'letter-fill-wealth',
    glowClass: 'letter-glow-wealth',
    burstColor: '#10b981'
  },
  health: {
    fillClass: 'letter-fill-health',
    glowClass: 'letter-glow-health',
    burstColor: '#3b82f6'
  },
  learning: {
    fillClass: 'letter-fill-learning',
    glowClass: 'letter-glow-learning',
    burstColor: '#fbbf24'
  }
};

interface Affirmation {
  text: string;
  category: 'love' | 'wealth' | 'health' | 'learning';
}

interface BookmarkedAffirmation extends Affirmation {
  id: string;
  isPinned: boolean;
}

const App: React.FC = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation>(affirmations[0]);
  const [clickedLetters, setClickedLetters] = useState<Set<number>>(new Set());
  const [showBurst, setShowBurst] = useState(false);
  const [currentView, setCurrentView] = useState<'main' | 'bookmarks' | 'search'>('main');
  const [bookmarks, setBookmarks] = useState<BookmarkedAffirmation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [affirmationHistory, setAffirmationHistory] = useState<Affirmation[]>([affirmations[0]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [showMicInstructions, setShowMicInstructions] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const burstContainerRef = useRef<HTMLDivElement>(null);

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

  // Check if current affirmation is bookmarked
  const isBookmarked = bookmarks.some(bookmark => 
    bookmark.text === currentAffirmation.text && 
    bookmark.category === currentAffirmation.category
  );

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('Speech recognized:', transcript);
        
        if (transcript.includes('new') || transcript.includes('next')) {
          getRandomAffirmation();
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
          setShowMicInstructions(true);
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
      setShowMicInstructions(false);
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicPermission('denied');
      setShowMicInstructions(true);
      return false;
    }
  };

  // Start voice recognition
  const startListening = async () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (!rateLimiter.isAllowed('voice-recognition', 5, 60000)) {
      alert('Too many voice recognition attempts. Please wait a moment.');
      return;
    }

    // Request permission if not already granted
    if (micPermission !== 'granted') {
      const granted = await requestMicPermission();
      if (!granted) return;
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  };

  const getRandomAffirmation = useCallback(() => {
    if (!rateLimiter.isAllowed('new-affirmation', 20, 60000)) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * affirmations.length);
    const newAffirmation = affirmations[randomIndex];
    
    setCurrentAffirmation(newAffirmation);
    setClickedLetters(new Set());
    setShowBurst(false);
    
    // Add to history (keep only last 10)
    setAffirmationHistory(prev => {
      const newHistory = [...prev, newAffirmation];
      return newHistory.slice(-10);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 9));
  }, []);

  const goToPreviousAffirmation = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentAffirmation(affirmationHistory[newIndex]);
      setClickedLetters(new Set());
      setShowBurst(false);
    }
  }, [historyIndex, affirmationHistory]);

  const handleLetterClick = (index: number) => {
    if (!rateLimiter.isAllowed('letter-click', 100, 60000)) {
      return;
    }

    const newClickedLetters = new Set(clickedLetters);
    newClickedLetters.add(index);
    setClickedLetters(newClickedLetters);

    // Check if all letters are clicked
    const totalLetters = currentAffirmation.text.replace(/\s/g, '').length;
    if (newClickedLetters.size === totalLetters) {
      triggerBurstAnimation();
    }
  };

  const triggerBurstAnimation = () => {
    setShowBurst(true);
    
    if (burstContainerRef.current) {
      const container = burstContainerRef.current;
      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Create burst particles
      for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute pointer-events-none';
        
        // Different icons based on category
        if (currentAffirmation.category === 'love') {
          particle.innerHTML = '💖';
        } else if (currentAffirmation.category === 'wealth') {
          particle.innerHTML = '<img src="/dollar-bill.png" alt="💰" class="w-6 h-6" />';
        } else if (currentAffirmation.category === 'health') {
          particle.innerHTML = '<img src="/standing.png" alt="🏃" class="w-6 h-6" />';
        } else {
          particle.innerHTML = '⭐';
        }
        
        particle.style.fontSize = '24px';
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        particle.style.transform = 'translate(-50%, -50%)';
        
        const angle = (i / 12) * 2 * Math.PI;
        const distance = 100 + Math.random() * 50;
        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;
        
        particle.style.setProperty('--end-x', `${endX}px`);
        particle.style.setProperty('--end-y', `${endY}px`);
        particle.style.animation = 'heartBurst 1s ease-out forwards';
        
        container.appendChild(particle);
        
        setTimeout(() => {
          if (container.contains(particle)) {
            container.removeChild(particle);
          }
        }, 1000);
      }
    }

    setTimeout(() => setShowBurst(false), 1000);
  };

  const toggleBookmark = () => {
    if (!rateLimiter.isAllowed('bookmark-action', 10, 60000)) {
      return;
    }

    const affirmationId = `${currentAffirmation.text}-${currentAffirmation.category}`;
    
    if (isBookmarked) {
      // Remove bookmark
      setBookmarks(prev => prev.filter(bookmark => 
        !(bookmark.text === currentAffirmation.text && bookmark.category === currentAffirmation.category)
      ));
    } else {
      // Add bookmark
      const newBookmark: BookmarkedAffirmation = {
        ...currentAffirmation,
        id: affirmationId,
        isPinned: false
      };
      setBookmarks(prev => [...prev, newBookmark]);
    }
  };

  const shareAffirmation = async () => {
    if (!rateLimiter.isAllowed('share-action', 5, 60000)) {
      return;
    }

    const shareText = `"${currentAffirmation.text}" - Goaly Affirmations`;
    const shareUrl = `${window.location.origin}?affirmation=${encodeURIComponent(currentAffirmation.text)}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Goaly Affirmation',
          text: shareText,
          url: shareUrl
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        alert('Affirmation link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  const togglePin = (bookmarkId: string) => {
    setBookmarks(prev => prev.map(bookmark => 
      bookmark.id === bookmarkId 
        ? { ...bookmark, isPinned: !bookmark.isPinned }
        : bookmark
    ));
  };

  const deleteBookmark = (bookmarkId: string) => {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
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

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (currentView !== 'main') return;
      
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        getRandomAffirmation();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        goToPreviousAffirmation();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentView, getRandomAffirmation, goToPreviousAffirmation]);

  // Handle scroll/swipe navigation
  useEffect(() => {
    if (currentView !== 'main') return;

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

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [currentView, getRandomAffirmation, goToPreviousAffirmation]);

  const renderLetter = (char: string, index: number, letterIndex: number) => {
    if (char === ' ') {
      return <span key={index} className="inline-block w-4"></span>;
    }

    const isClicked = clickedLetters.has(letterIndex);
    const style = categoryStyles[currentAffirmation.category];
    
    return (
      <span
        key={index}
        className={`inline-block cursor-pointer transition-all duration-300 text-6xl md:text-7xl lg:text-8xl font-bold select-none ${
          isClicked 
            ? `${style.fillClass} ${style.glowClass} letter-sparkle transform scale-110` 
            : 'text-gray-800 hover:text-gray-600'
        }`}
        onClick={() => handleLetterClick(letterIndex)}
        style={{
          fontFamily: "'Fredoka One', cursive",
          textShadow: isClicked ? 'none' : '2px 2px 4px rgba(0,0,0,0.1)'
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
        const result = renderLetter(char, index, letterIndex);
        letterIndex++;
        return result;
      }
      return renderLetter(char, index, letterIndex);
    });
  };

  if (currentView === 'bookmarks') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentView('main')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={24} />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
              My Bookmarks
            </h1>
            <div className="w-16"></div>
          </div>

          {sortedBookmarks.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No bookmarks yet</p>
              <p className="text-gray-400">Save your favorite affirmations to see them here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="bg-white rounded-lg p-4 shadow-md border-l-4"
                  style={{ 
                    borderLeftColor: categoryStyles[bookmark.category].burstColor 
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-lg font-medium text-gray-800 mb-2">
                        {bookmark.text}
                      </p>
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-medium capitalize"
                        style={{ 
                          backgroundColor: `${categoryStyles[bookmark.category].burstColor}20`,
                          color: categoryStyles[bookmark.category].burstColor
                        }}
                      >
                        {bookmark.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => togglePin(bookmark.id)}
                        className={`p-2 rounded-full transition-colors ${
                          bookmark.isPinned 
                            ? 'text-blue-600 bg-blue-100' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                        title={bookmark.isPinned ? 'Unpin' : 'Pin to top'}
                      >
                        <Pin size={16} />
                      </button>
                      <button
                        onClick={() => deleteBookmark(bookmark.id)}
                        className="p-2 rounded-full text-red-400 hover:text-red-600 transition-colors"
                        title="Delete bookmark"
                      >
                        <X size={16} />
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

  if (currentView === 'search') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentView('main')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={24} />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
              Search Affirmations
            </h1>
            <div className="w-16"></div>
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search affirmations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {['all', 'love', 'wealth', 'health', 'learning'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredAffirmations.map((affirmation, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 shadow-md border-l-4 cursor-pointer hover:shadow-lg transition-shadow"
                style={{ 
                  borderLeftColor: categoryStyles[affirmation.category].burstColor 
                }}
                onClick={() => {
                  setCurrentAffirmation(affirmation);
                  setClickedLetters(new Set());
                  setShowBurst(false);
                  setCurrentView('main');
                }}
              >
                <p className="text-lg font-medium text-gray-800 mb-2">
                  {affirmation.text}
                </p>
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium capitalize"
                  style={{ 
                    backgroundColor: `${categoryStyles[affirmation.category].burstColor}20`,
                    color: categoryStyles[affirmation.category].burstColor
                  }}
                >
                  {affirmation.category}
                </span>
              </div>
            ))}
          </div>

          {filteredAffirmations.length === 0 && (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No affirmations found</p>
              <p className="text-gray-400">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 relative overflow-hidden">
      {/* Microphone Instructions Modal */}
      {showMicInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Enable Microphone Access</h3>
            <p className="text-gray-600 mb-4">
              To use voice commands, please allow microphone access in your browser settings:
            </p>
            <ol className="list-decimal list-inside text-sm text-gray-600 mb-4 space-y-1">
              <li>Click the microphone icon in your browser's address bar</li>
              <li>Select "Allow" for microphone access</li>
              <li>Refresh the page if needed</li>
            </ol>
            <p className="text-sm text-gray-500 mb-4">
              Voice commands: "new" or "next" for new affirmation, "bookmark" to save, "share" to share.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowMicInstructions(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={requestMicPermission}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={getRandomAffirmation}
            className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors"
            style={{ fontFamily: "'Fredoka One', cursive" }}
          >
            Goaly
          </button>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('bookmarks')}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
              title="View bookmarks"
            >
              <Bookmark size={20} className="text-gray-700" />
            </button>
            
            <button
              onClick={getRandomAffirmation}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
              title="New affirmation"
            >
              <Plus size={20} className="text-gray-700" />
            </button>
            
            <button
              onClick={() => setCurrentView('search')}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
              title="Search affirmations"
            >
              <Search size={20} className="text-gray-700" />
            </button>
            
            <button
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-colors"
              title="Menu"
            >
              <Menu size={20} className="text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-4">
        {/* Bookmark Icon */}
        <button
          onClick={toggleBookmark}
          className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
            isBookmarked
              ? 'bg-blue-600 text-white'
              : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white'
          }`}
          title={isBookmarked ? 'Remove bookmark' : 'Bookmark this affirmation'}
        >
          <Bookmark size={20} className={isBookmarked ? 'fill-current' : ''} />
        </button>

        {/* Microphone Icon */}
        <button
          onClick={startListening}
          disabled={isListening}
          className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
            isListening
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white'
          }`}
          title={isListening ? 'Listening...' : 'Voice commands'}
        >
          <Mic size={20} />
        </button>
        
        {/* Share Icon */}
        <button
          onClick={shareAffirmation}
          className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg text-gray-700 hover:bg-white transition-colors"
          title="Share this affirmation"
        >
          <Share2 size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-4xl mx-auto relative" ref={burstContainerRef}>
          <div className="mb-8">
            {renderAffirmationText()}
          </div>
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>Click each letter to make it glow ✨</p>
            <p>Scroll up for new • Scroll down for previous</p>
            {historyIndex > 0 && (
              <p className="text-purple-600">← {historyIndex + 1} of {affirmationHistory.length} →</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;