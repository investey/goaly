import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, ChevronUp, ChevronDown, Bookmark, Link, BookmarkCheck, ArrowLeft, X, Search, Banknote, Star, User, Plus } from 'lucide-react';
import { DollarBillIcon } from './components/DollarBillIcon';
import { HealthIcon } from './components/HealthIcon';

const loveAffirmations = [
  "I am worthy of deep love",
  "Love flows to me effortlessly", 
  "I attract love with ease",
  "My heart is open to love",
  "I radiate love and receive love",
  "Love surrounds me always",
  "I deserve unconditional love",
  "Love is my natural state",
  "I am a magnet for love",
  "Love fills every cell of my being",
  "I give and receive love freely",
  "My heart overflows with love",
  "Love is always available to me",
  "I am love in human form",
  "Love guides all my actions",
  "I trust in love's perfect timing",
  "Love heals and transforms me",
  "I am surrounded by loving energy",
  "Love is my greatest strength",
  "I choose love in every moment",
  "Love connects me to all beings",
  "I am deeply loved and cherished",
  "My capacity for love is infinite",
  "I attract my perfect soulmate",
  "Love multiplies when I share it",
  "I am worthy of passionate love",
  "My heart chakra is wide open",
  "I forgive myself with love",
  "Love is the answer to everything",
  "I am a beacon of pure love",
  "My relationships are filled with love",
  "I speak words of love and kindness",
  "Love flows through me to others",
  "I am grateful for all the love in my life",
  "My soul recognizes its perfect match",
  "I trust the universe to bring me love",
  "Love is my default emotion",
  "I am loveable exactly as I am",
  "My heart is a fountain of love",
  "I attract love in all its forms",
  "Love is my superpower",
  "I am surrounded by loving souls",
  "My love story is beautiful and unique",
  "I deserve a love that celebrates me",
  "Love comes to me at the perfect time",
  "I am open to receiving deep love",
  "My heart beats with pure love",
  "I create loving relationships effortlessly",
  "Love is my birthright",
  "I am worthy of epic love",
  "My love attracts my ideal partner",
  "I radiate love wherever I go",
  "Love finds me wherever I am",
  "I am a master of self-love",
  "My heart is healed and whole",
  "Love transforms everything it touches",
  "I am divinely guided to love",
  "My love is a gift to the world",
  "I choose love over fear always",
  "Love is my natural frequency",
  "I am worthy of unconditional acceptance",
  "My heart is a magnet for true love",
  "Love flows to me like a river",
  "I am love walking in human form",
  "My soul mate is seeking me too",
  "Love is my greatest adventure",
  "I trust in love's divine timing",
  "My heart is open to miracles",
  "Love is the essence of who I am",
  "I am worthy of a fairy tale love",
  "My love creates positive change",
  "I attract love that honors my worth"
];

const wealthAffirmations = [
  "I am a money magnet",
  "Wealth flows to me easily",
  "I attract abundance effortlessly",
  "Money comes to me from multiple sources",
  "I am worthy of financial success",
  "Prosperity is my natural state",
  "I create wealth through value",
  "My income increases daily",
  "I am financially free",
  "Money works for me",
  "I attract lucrative opportunities",
  "Wealth is drawn to me",
  "I am a successful entrepreneur",
  "My business thrives and grows",
  "I make smart financial decisions",
  "Abundance surrounds me always",
  "I deserve unlimited prosperity",
  "Money flows like water to me",
  "I am rich in all areas",
  "Financial success is inevitable",
  "I attract profitable ventures",
  "My wealth multiplies exponentially",
  "I am open to receiving money",
  "Success follows me everywhere",
  "I create multiple income streams",
  "My business generates massive profits",
  "I am a wealth creator",
  "Money loves me and I love money",
  "I attract high-paying clients",
  "My net worth increases constantly",
  "I am financially abundant",
  "Prosperity flows through me",
  "I manifest money with ease",
  "My business scales effortlessly",
  "I attract investment opportunities",
  "Wealth is my birthright",
  "I am a money-making machine",
  "Financial freedom is mine",
  "I attract passive income streams",
  "My business empire grows daily",
  "I am worthy of massive wealth",
  "Money comes to me in unexpected ways",
  "I create value and receive abundance",
  "My financial goals manifest quickly",
  "I am a master of money",
  "Wealth creation is my superpower",
  "I attract millionaire opportunities",
  "My business dominates the market",
  "I am financially unstoppable",
  "Money flows to me like a river",
  "I am a magnet for financial miracles",
  "Wealth consciousness is my default state",
  "I attract money while I sleep",
  "My bank account grows exponentially",
  "I am worthy of unlimited abundance",
  "Money comes to me from everywhere",
  "I create wealth with my thoughts",
  "My business is a cash cow",
  "I attract wealthy mentors and partners",
  "Financial abundance is my reality",
  "I am a master wealth builder",
  "Money flows to me effortlessly",
  "I deserve to be financially free",
  "My income exceeds my expenses",
  "I attract profitable investments",
  "Wealth is attracted to my energy",
  "I am financially independent",
  "Money multiplies in my hands",
  "I create value that generates wealth",
  "My business attracts ideal customers",
  "I am a successful money manager",
  "Abundance is my natural state",
  "I attract money-making opportunities",
  "My wealth serves the highest good",
  "I am worthy of financial security",
  "Money comes to me in perfect timing",
  "I create multiple revenue streams",
  "My business generates passive income",
  "I attract financial windfalls",
  "Wealth flows to me consistently",
  "I am a money manifestation master",
  "My financial future is bright",
  "I attract abundance in all forms",
  "Money is my faithful servant",
  "I create wealth through innovation",
  "My business scales automatically",
  "I attract high-value opportunities",
  "Financial success is my destiny",
  "I am worthy of extreme wealth",
  "Money loves to work for me",
  "I attract profitable partnerships",
  "My wealth creates positive impact",
  "I am financially bulletproof",
  "Money flows to me like magic",
  "I create wealth through service",
  "My business is incredibly profitable",
  "I attract money with gratitude",
  "Wealth is my divine inheritance",
  "I am a millionaire in the making",
  "Money comes to me in avalanches"
];

const healthAffirmations = [
  "I am perfectly healthy and strong",
  "My body heals itself naturally",
  "I radiate vibrant health",
  "Every cell in my body is healthy",
  "I am full of energy and vitality",
  "My body is my temple",
  "I choose healthy foods that nourish me",
  "I love exercising and moving my body",
  "My immune system is powerful",
  "I sleep deeply and wake refreshed",
  "My body functions perfectly",
  "I am strong and resilient",
  "Health flows through every part of me",
  "I am in perfect physical condition",
  "My body recovers quickly",
  "I have unlimited energy",
  "My mind and body are in harmony",
  "I am grateful for my healthy body",
  "I attract perfect health",
  "My body is a healing machine",
  "I feel amazing in my body",
  "I am physically fit and strong",
  "My body deserves love and care",
  "I make healthy choices effortlessly",
  "My metabolism works perfectly",
  "I am at my ideal weight",
  "My body is flexible and strong",
  "I breathe deeply and easily",
  "My heart beats with perfect rhythm",
  "I am mentally and physically balanced",
  "My body regenerates itself daily",
  "I am free from pain and illness",
  "My body moves with grace and ease",
  "I have perfect posture and alignment",
  "My digestive system works flawlessly",
  "I am aging gracefully and healthily",
  "My body is a source of joy",
  "I am committed to my health",
  "My body responds to exercise beautifully",
  "I have incredible stamina and endurance",
  "My body is strong and capable",
  "I trust my body's wisdom",
  "My health improves every day",
  "I am the picture of perfect health",
  "My body is my greatest asset",
  "I feel fantastic in my skin",
  "My body is a masterpiece",
  "I am healthy inside and out",
  "My body serves me perfectly",
  "I am a beacon of health and vitality",
  "My body is a temple of wellness",
  "I attract perfect health naturally",
  "My cells regenerate with perfection",
  "I am vibrant and alive",
  "My body heals faster than expected",
  "I radiate health and happiness",
  "My immune system is invincible",
  "I choose foods that energize me",
  "My body loves to move and exercise",
  "I sleep like a baby every night",
  "My energy levels are consistently high",
  "I am mentally sharp and focused",
  "My body is perfectly balanced",
  "I recover quickly from any challenge",
  "My strength increases daily",
  "I am in tune with my body's needs",
  "My health is my top priority",
  "I feel younger every day",
  "My body is incredibly resilient",
  "I am free from stress and tension",
  "My organs function optimally",
  "I have perfect circulation",
  "My bones are strong and healthy",
  "I breathe with ease and comfort",
  "My skin glows with health",
  "I am at my perfect weight",
  "My body moves like a dancer",
  "I have excellent coordination",
  "My reflexes are lightning fast",
  "I am physically powerful",
  "My body is a healing miracle",
  "I attract wellness in all forms",
  "My health radiates from within",
  "I am genetically blessed",
  "My body loves healthy habits",
  "I am disease-free and thriving",
  "My energy is magnetic",
  "I am physically unstoppable",
  "My body is perfectly designed",
  "I heal at the speed of light",
  "My health is my superpower",
  "I am a picture of perfect fitness",
  "My body is my best friend",
  "I am healthy in every way",
  "My vitality is contagious",
  "I am built for optimal health",
  "My body is a wellness machine",
  "I am healthy beyond measure",
  "My body thrives on life"
];

const learningAffirmations = [
  "I am a fast and eager learner",
  "Knowledge comes easily to me",
  "I absorb information effortlessly",
  "My mind is sharp and focused",
  "I love learning new things",
  "I retain information perfectly",
  "My brain is a powerful learning machine",
  "I understand concepts quickly",
  "Learning brings me joy and excitement",
  "I am curious about everything",
  "My memory is excellent and reliable",
  "I master new skills with ease",
  "Knowledge flows to me naturally",
  "I am intelligent and capable",
  "My mind expands with every lesson",
  "I embrace challenges as learning opportunities",
  "I am a lifelong learner",
  "My concentration is laser-focused",
  "I learn from every experience",
  "My brain creates new connections daily",
  "I am open to new ideas and perspectives",
  "Learning is my superpower",
  "I process information efficiently",
  "My mind is like a sponge for knowledge",
  "I enjoy studying and researching",
  "I am a master student",
  "My learning capacity is unlimited",
  "I connect ideas and concepts easily",
  "Knowledge transforms my life",
  "I am wise beyond my years",
  "My mind is clear and organized",
  "I learn something valuable every day",
  "I am a knowledge seeker",
  "My brain power increases constantly",
  "I understand complex topics easily",
  "Learning accelerates my growth",
  "I am mentally agile and quick",
  "My mind is a treasure trove of knowledge",
  "I apply what I learn immediately",
  "I am a brilliant problem solver",
  "Knowledge is my greatest wealth",
  "I learn from the best teachers",
  "My mind is always growing",
  "I am a student of life",
  "Learning comes naturally to me",
  "I have an insatiable thirst for knowledge",
  "My brain is optimized for learning",
  "I master any subject I choose",
  "Knowledge empowers me completely",
  "I am a learning machine",
  "My mind is a knowledge magnet",
  "I absorb wisdom like a sponge",
  "Learning is my greatest passion",
  "My brain processes information perfectly",
  "I am intellectually unstoppable",
  "Knowledge flows through me effortlessly",
  "I am a genius in my own right",
  "My mind is infinitely expandable",
  "I learn faster than ever before",
  "Wisdom comes to me naturally",
  "I am a master of my mind",
  "My intelligence grows daily",
  "I understand everything I study",
  "Learning is effortless for me",
  "My mind is crystal clear",
  "I am a brilliant thinker",
  "Knowledge is my natural state",
  "I learn with incredible speed",
  "My brain is a supercomputer",
  "I am mentally invincible",
  "Learning transforms my reality",
  "I am a knowledge creator",
  "My mind is perfectly organized",
  "I learn through all my senses",
  "Wisdom flows to me constantly",
  "I am intellectually gifted",
  "My learning never stops",
  "I am a master of information",
  "Knowledge is my greatest tool",
  "I learn from every moment",
  "My mind is a learning laboratory",
  "I am cognitively superior",
  "Learning is my life force",
  "I am a wisdom gatherer",
  "My brain is incredibly powerful",
  "I learn with perfect recall",
  "Knowledge is my superpower",
  "I am mentally magnificent",
  "My mind is a learning miracle",
  "I absorb knowledge instantly",
  "Learning is my greatest joy",
  "I am intellectually brilliant",
  "My mind is a knowledge vault",
  "I learn with laser precision",
  "Wisdom is my natural gift",
  "I am a learning phenomenon",
  "My brain is optimized for genius",
  "Knowledge flows through my DNA",
  "I am a master of understanding"
];

// Combine all affirmations with category labels
const allAffirmations = [
  ...loveAffirmations.map(text => ({ text, category: 'love' })),
  ...wealthAffirmations.map(text => ({ text, category: 'wealth' })),
  ...healthAffirmations.map(text => ({ text, category: 'health' })),
  ...learningAffirmations.map(text => ({ text, category: 'learning' }))
];

const topics = [
  { name: "Love & Self-Love", keywords: ["worthy", "love", "deserve", "radiate", "magnet", "overflows", "heart", "connects"] },
  { name: "Wealth & Business", keywords: ["money", "wealth", "business", "financial", "prosperity", "abundance", "income", "profit"] },
  { name: "Health & Fitness", keywords: ["healthy", "body", "energy", "strong", "vitality", "exercise", "heal", "immune"] },
  { name: "Learning & Growth", keywords: ["learn", "knowledge", "mind", "brain", "study", "understand", "master", "intelligent"] },
  { name: "Abundance", keywords: ["flows", "effortlessly", "surrounds", "available", "fills"] },
  { name: "Natural State", keywords: ["natural", "state", "form", "cell", "being"] }
];

function App() {
  const [currentView, setCurrentView] = useState<'main' | 'bookmarks' | 'search'>('main');
  const [currentAffirmation, setCurrentAffirmation] = useState(() => {
    const randomAffirmation = allAffirmations[Math.floor(Math.random() * allAffirmations.length)];
    return randomAffirmation;
  });
  const [affirmationHistory, setAffirmationHistory] = useState<typeof currentAffirmation[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [bookmarkedPhrases, setBookmarkedPhrases] = useState<string[]>([]);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [clickedLetters, setClickedLetters] = useState<Set<number>>(new Set());
  const [showHearts, setShowHearts] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [dynamicFontSize, setDynamicFontSize] = useState('text-[16vw] sm:text-[14vw] md:text-[12vw] lg:text-[10vw] xl:text-[8vw] 2xl:text-[7vw]');
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [pinnedPhrases, setPinnedPhrases] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryAffirmations, setCategoryAffirmations] = useState<typeof allAffirmations>([]);
  const [usedCategoryAffirmations, setUsedCategoryAffirmations] = useState<Set<string>>(new Set());
  const [showPlusPopup, setShowPlusPopup] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null);
  const [holdStartTime, setHoldStartTime] = useState<number | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  // Load bookmarks from localStorage on component mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('affirmation-bookmarks');
    if (savedBookmarks) {
      setBookmarkedPhrases(JSON.parse(savedBookmarks));
    }
    const savedPinned = localStorage.getItem('affirmation-pinned');
    if (savedPinned) {
      setPinnedPhrases(JSON.parse(savedPinned));
    }
  }, []);

  // Save bookmarks to localStorage whenever bookmarks change
  useEffect(() => {
    localStorage.setItem('affirmation-bookmarks', JSON.stringify(bookmarkedPhrases));
  }, [bookmarkedPhrases]);

  // Save pinned phrases to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('affirmation-pinned', JSON.stringify(pinnedPhrases));
  }, [pinnedPhrases]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onstart = () => {
        setIsListening(true);
      };
      
      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        console.log('Speech recognized:', transcript);
        
        // Get current affirmation text
        const currentText = currentAffirmation.text.toLowerCase();
        
        // Check if the spoken text matches the affirmation (with fuzzy matching)
        if (isTextMatch(transcript, currentText)) {
          console.log('Match found! Filling letters...');
          fillAllLettersGradually();
          
          // In continuous mode, get new affirmation after successful match
          if (isContinuousMode) {
            setTimeout(() => {
              generateNewPhrase();
            }, 2000); // Wait 2 seconds after animation completes
          }
          // Don't stop recognition after successful match - keep listening
        } else {
          console.log('No match found');
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.log('Speech recognition error:', event.error);
        if (event.error === 'aborted' || event.error === 'not-allowed') {
          setIsListening(false);
        } else {
          // For other errors, try to restart after a brief delay
          setTimeout(() => {
            if (isListening) {
              try {
                recognitionInstance.start();
              } catch (e) {
                console.log('Failed to restart recognition:', e);
                setIsListening(false);
              }
            }
          }, 1000);
        }
      };
      
      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        if (isListening && !isContinuousMode) {
          // Restart recognition if we're still supposed to be listening
          setTimeout(() => {
            if (isListening) {
              try {
                recognitionInstance.start();
              } catch (e) {
                console.log('Failed to restart recognition:', e);
                setIsListening(false);
              }
            }
          }, 500);
        } else {
          setIsListening(false);
        }
      };
      
      setRecognition(recognitionInstance);
    }
  }, [currentAffirmation, isListening, isContinuousMode]);

  const startListening = () => {
    if (!recognition) {
      console.log('Speech recognition not available');
      return;
    }
    
    // Reset any existing progress
    setClickedLetters(new Set());
    setShowHearts(false);
    
    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
    setIsContinuousMode(false);
  };

  const handleMicrophoneMouseDown = () => {
    setHoldStartTime(Date.now());
    const timer = setTimeout(() => {
      // After 4 seconds, enable continuous mode
      setIsContinuousMode(true);
      if (recognition) {
        recognition.continuous = true;
      }
      console.log('Continuous listening mode enabled');
    }, 4000);
    setHoldTimer(timer);
  };

  const handleMicrophoneMouseUp = () => {
    const holdDuration = holdStartTime ? Date.now() - holdStartTime : 0;
    
    if (holdTimer) {
      clearTimeout(holdTimer);
      setHoldTimer(null);
    }
    
    setHoldStartTime(null);
    
    if (holdDuration < 4000) {
      // Short press - normal single listening
      setIsContinuousMode(false);
      if (recognition) {
        recognition.continuous = false;
      }
      startListening();
    } else {
      // Long press - start continuous mode
      startListening();
    }
  };

  // Fuzzy text matching function
  const isTextMatch = (spoken: string, target: string): boolean => {
    // Remove punctuation and extra spaces
    const cleanSpoken = spoken.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    const cleanTarget = target.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    
    // Exact match
    if (cleanSpoken === cleanTarget) return true;
    
    // Word-by-word matching (allows for small differences)
    const spokenWords = cleanSpoken.split(' ');
    const targetWords = cleanTarget.split(' ');
    
    if (spokenWords.length !== targetWords.length) return false;
    
    let matchCount = 0;
    for (let i = 0; i < targetWords.length; i++) {
      const spokenWord = spokenWords[i];
      const targetWord = targetWords[i];
      
      // Exact word match
      if (spokenWord === targetWord) {
        matchCount++;
      }
      // Similar word match (handles pronunciation variations)
      else if (isWordSimilar(spokenWord, targetWord)) {
        matchCount++;
      }
    }
    
    // Require at least 80% word match
    return matchCount / targetWords.length >= 0.8;
  };

  // Check if two words are similar (handles common speech recognition errors)
  const isWordSimilar = (word1: string, word2: string): boolean => {
    if (Math.abs(word1.length - word2.length) > 2) return false;
    
    // Simple edit distance check
    let differences = 0;
    const maxLength = Math.max(word1.length, word2.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (word1[i] !== word2[i]) differences++;
    }
    
    // Allow up to 2 character differences for short words, more for longer words
    const allowedDifferences = Math.max(1, Math.floor(maxLength * 0.3));
    return differences <= allowedDifferences;
  };

  // Fill all letters gradually to simulate natural interaction
  const fillAllLettersGradually = () => {
    if (isResetting) return;
    
    const letters = currentAffirmation.text.split('');
    const letterIndices = letters
      .map((char, index) => char !== ' ' ? index : -1)
      .filter(index => index !== -1);
    
    // Clear any existing letters first
    setClickedLetters(new Set());
    
    // Fill letters gradually with small delays
    letterIndices.forEach((letterIndex, arrayIndex) => {
      setTimeout(() => {
        setClickedLetters(prev => new Set([...prev, letterIndex]));
      }, arrayIndex * 50); // 50ms delay between each letter
    });
  };

  // Handle microphone click
  const handleMicrophoneClick = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. Please try Chrome, Safari, or Edge.');
      return;
    }
    
    if (isListening || (recognition && recognition.recognizing)) {
    if (isListening || (recognition && recognition.recognizing)) {
      recognition.stop();
      return;
    }
    
    if (isContinuousMode) {
      // Stop continuous mode
      stopListening();
        // Only start if not already recognizing
        if (!recognition.recognizing) {
          recognition.start();
        }
      return;
    }
    
    // Reset any existing progress
    setClickedLetters(new Set());
    setShowHearts(false);
    
    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  };

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = allAffirmations.filter(affirmation =>
      affirmation.text.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results.map(a => a.text));
  };

  const handleTopicSearch = (topic: typeof topics[0]) => {
    // Filter affirmations by topic keywords
    const categoryAffirmations = allAffirmations.filter(affirmation =>
      topic.keywords.some(keyword =>
        affirmation.text.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    // Select a random affirmation from the category
    if (categoryAffirmations.length > 0) {
      // Set up category browsing state
      setSelectedCategory(topic.name);
      setCategoryAffirmations(categoryAffirmations);
      setUsedCategoryAffirmations(new Set());
      
      const randomAffirmation = categoryAffirmations[Math.floor(Math.random() * categoryAffirmations.length)];
      setCurrentAffirmation(randomAffirmation);
      setUsedCategoryAffirmations(new Set([randomAffirmation.text]));
    }
    
    // Return to main feed
    setCurrentView('main');
    setSearchQuery('');
    setSearchResults([]);
    // Reset history and interactions for clean state
    setAffirmationHistory([]);
    setCurrentHistoryIndex(-1);
    setClickedLetters(new Set());
    setShowHearts(false);
    setIsResetting(false);
  };

  const handleSearchResultClick = (phrase: string) => {
    const affirmationObj = allAffirmations.find(a => a.text === phrase);
    if (affirmationObj) {
      setCurrentAffirmation(affirmationObj);
    }
    setCurrentView('main');
    setSearchQuery('');
    setSearchResults([]);
    // Reset history and interactions for clean state
    setAffirmationHistory([]);
    setCurrentHistoryIndex(-1);
    setClickedLetters(new Set());
    setShowHearts(false);
    setIsResetting(false);
    // Reset category browsing
    setSelectedCategory(null);
    setCategoryAffirmations([]);
    setUsedCategoryAffirmations(new Set());
  };

  const returnToMainFeed = () => {
    // Generate a new random affirmation
    const newAffirmation = allAffirmations[Math.floor(Math.random() * allAffirmations.length)];
    setCurrentAffirmation(newAffirmation);
    setCurrentView('main');
    // Reset all state for fresh start
    setAffirmationHistory([]);
    setCurrentHistoryIndex(-1);
    setClickedLetters(new Set());
    setShowHearts(false);
    setIsResetting(false);
    setSearchQuery('');
    setSearchResults([]);
    // Reset category browsing
    setSelectedCategory(null);
    setCategoryAffirmations([]);
    setUsedCategoryAffirmations(new Set());
  };

  // Split affirmation into individual characters (including spaces)
  const letters = currentAffirmation.text.split('');
  const totalLetters = letters.filter(char => char !== ' ').length;

  // Calculate optimal font size based on content
  const calculateOptimalFontSize = (text: string) => {
    // Use consistent, larger font sizes for all phrases
    return 'text-[14vw] sm:text-[12vw] md:text-[10vw] lg:text-[8vw] xl:text-[6vw] 2xl:text-[5vw]';
  };

  // Update font size when affirmation changes
  useEffect(() => {
    setDynamicFontSize(calculateOptimalFontSize(currentAffirmation.text));
  }, [currentAffirmation]);

  const generateNewPhrase = () => {
    if (isResetting) return;
    
    // Add current affirmation to history and maintain max 10 items
    setAffirmationHistory(prev => {
      const newHistory = [...prev];
      if (currentHistoryIndex === -1 || newHistory[currentHistoryIndex]?.text !== currentAffirmation.text) {
        newHistory.push(currentAffirmation);
        // Keep only last 10 items
        if (newHistory.length > 10) {
          newHistory.shift();
        }
      }
      return newHistory;
    });
    
    setCurrentHistoryIndex(prev => {
      const newIndex = prev === -1 ? 0 : Math.min(prev + 1, 9);
      return newIndex;
    });
    
    let newAffirmation;
    
    // If we're in category browsing mode
    if (selectedCategory && categoryAffirmations.length > 0) {
      // Get unused affirmations from the current category
      const unusedCategoryAffirmations = categoryAffirmations.filter(
        affirmation => !usedCategoryAffirmations.has(affirmation.text)
      );
      
      if (unusedCategoryAffirmations.length > 0) {
        // Select from unused category affirmations
        newAffirmation = unusedCategoryAffirmations[Math.floor(Math.random() * unusedCategoryAffirmations.length)];
        setUsedCategoryAffirmations(prev => new Set([...prev, newAffirmation.text]));
      } else {
        // All category affirmations used, switch to random mode
        setSelectedCategory(null);
        setCategoryAffirmations([]);
        setUsedCategoryAffirmations(new Set());
        
        // Generate random affirmation from all categories
        do {
          newAffirmation = allAffirmations[Math.floor(Math.random() * allAffirmations.length)];
        } while (newAffirmation.text === currentAffirmation.text);
      }
    } else {
      // Normal random mode
      do {
        newAffirmation = allAffirmations[Math.floor(Math.random() * allAffirmations.length)];
      } while (newAffirmation.text === currentAffirmation.text);
    }
    
    setIsResetting(true);
    setShowHearts(false);
    setClickedLetters(new Set());
    
    setTimeout(() => {
      setCurrentAffirmation(newAffirmation);
      setIsResetting(false);
    }, 300);
  };

  const goToNextPhrase = () => {
    if (isResetting) return;
    
    // If we're not at the end of history, go forward
    if (currentHistoryIndex < affirmationHistory.length - 1) {
      const nextIndex = currentHistoryIndex + 1;
      const nextAffirmation = affirmationHistory[nextIndex];
      
      setIsResetting(true);
      setShowHearts(false);
      setClickedLetters(new Set());
      
      setTimeout(() => {
        setCurrentAffirmation(nextAffirmation);
        setCurrentHistoryIndex(nextIndex);
        setIsResetting(false);
      }, 300);
    } else {
      // Generate new phrase if at the end
      generateNewPhrase();
    }
  };

  const goToPreviousPhrase = () => {
    if (isResetting || currentHistoryIndex <= 0) return;
    
    const previousIndex = currentHistoryIndex - 1;
    const previousAffirmation = affirmationHistory[previousIndex];
    
    setIsResetting(true);
    setShowHearts(false);
    setClickedLetters(new Set());
    
    setTimeout(() => {
      setCurrentAffirmation(previousAffirmation);
      setCurrentHistoryIndex(previousIndex);
      setIsResetting(false);
    }, 300);
  };

  const handleBookmark = () => {
    if (bookmarkedPhrases.includes(currentAffirmation.text)) {
      // Remove from bookmarks
      setBookmarkedPhrases(prev => prev.filter(phrase => phrase !== currentAffirmation.text));
    } else {
      // Add to bookmarks (newest first)
      setBookmarkedPhrases(prev => [currentAffirmation.text, ...prev]);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}?phrase=${encodeURIComponent(currentAffirmation.text)}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 3000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 3000);
    }
  };

  const handleRemoveBookmark = (phraseToRemove: string) => {
    setBookmarkedPhrases(prev => prev.filter(phrase => phrase !== phraseToRemove));
    setPinnedPhrases(prev => prev.filter(phrase => phrase !== phraseToRemove));
    setDeleteConfirmation(null);
  };

  const handlePinPhrase = (phrase: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the bookmark click
    
    if (pinnedPhrases.includes(phrase)) {
      // Unpin the phrase
      setPinnedPhrases(prev => prev.filter(p => p !== phrase));
    } else {
      // Pin the phrase to the top
      setPinnedPhrases(prev => [phrase, ...prev]);
    }
  };

  // Organize bookmarks: pinned first, then unpinned
  const organizedBookmarks = [
    ...pinnedPhrases.filter(phrase => bookmarkedPhrases.includes(phrase)),
    ...bookmarkedPhrases.filter(phrase => !pinnedPhrases.includes(phrase))
  ];

  const handleBookmarkClick = (phrase: string) => {
    // Navigate back to main view with the selected phrase
    const affirmationObj = allAffirmations.find(a => a.text === phrase);
    if (affirmationObj) {
      setCurrentAffirmation(affirmationObj);
    }
    setCurrentView('main');
    // Reset history and interactions for clean state
    setAffirmationHistory([]);
    setCurrentHistoryIndex(-1);
    setClickedLetters(new Set());
    setShowHearts(false);
    setIsResetting(false);
    // Reset category browsing
    setSelectedCategory(null);
    setCategoryAffirmations([]);
    setUsedCategoryAffirmations(new Set());
  };

  const handleDeleteClick = (phrase: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the bookmark click
    setDeleteConfirmation(phrase);
  };

  // Handle URL parameters for shared phrases
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedPhrase = urlParams.get('phrase');
    if (sharedPhrase) {
      const affirmationObj = allAffirmations.find(a => a.text === decodeURIComponent(sharedPhrase));
      if (affirmationObj) {
        setCurrentAffirmation(affirmationObj);
      }
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Handle scroll events
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (currentView !== 'main') return;
      
      e.preventDefault();
      
      if (e.deltaY > 0) {
        // Scrolling down - go to next phrase
        goToNextPhrase();
      } else {
        // Scrolling up - go to previous phrase
        goToPreviousPhrase();
      }
    };

    if (currentView === 'main') {
      window.addEventListener('wheel', handleWheel, { passive: false });
      return () => window.removeEventListener('wheel', handleWheel);
    }
  }, [currentView, currentHistoryIndex, affirmationHistory, currentAffirmation, isResetting]);

  const handleLetterClick = (index: number) => {
    if (letters[index] === ' ' || clickedLetters.has(index) || isResetting) return;
    
    setClickedLetters(prev => new Set([...prev, index]));
  };

  // Touch handlers for swipe detection
  const handleTouchStartSwipe = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMoveSwipe = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEndSwipe = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);
    const minSwipeDistance = 50;
    
    if (isVerticalSwipe && Math.abs(distanceY) > minSwipeDistance) {
      if (distanceY > 0) {
        // Swipe up - next phrase
        generateNewPhrase();
      } else {
        // Swipe down - previous phrase
        goToPreviousPhrase();
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsTouching(true);
    setIsDragging(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsTouching(false);
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouching) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    
    if (element && element.hasAttribute('data-letter-index')) {
      const index = parseInt(element.getAttribute('data-letter-index')!);
      if (letters[index] !== ' ' && !clickedLetters.has(index) && !isResetting) {
        setClickedLetters(prev => new Set([...prev, index]));
      }
    }
  };

  const handleMouseEnter = (index: number) => {
    if ((isDragging || isTouching) && letters[index] !== ' ' && !clickedLetters.has(index) && !isResetting) {
      setClickedLetters(prev => new Set([...prev, index]));
    }
  };

  useEffect(() => {
    if (clickedLetters.size === totalLetters && !showHearts) {
      // Small delay before hearts appear
      setTimeout(() => {
        setShowHearts(true);
      }, 500);
    }
  }, [clickedLetters.size, totalLetters, showHearts]);

  // Get the appropriate color class based on category
  const getLetterColorClass = (category: string) => {
    switch (category) {
      case 'wealth':
        return 'letter-fill-wealth letter-glow-wealth';
      case 'health':
        return 'letter-fill-health letter-glow-health';
      case 'learning':
        return 'letter-fill-learning letter-glow-learning';
      default:
        return 'letter-fill letter-glow'; // Default pink for love
    }
  };

  useEffect(() => {
    if (showHearts) {
      // Hearts animation lasts 3 seconds, then reset
      const timer = setTimeout(() => {
        setIsResetting(true);
        setShowHearts(false);
        setClickedLetters(new Set());
        
        // Brief delay before allowing interactions again
        setTimeout(() => {
          setIsResetting(false);
        }, 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showHearts]);

  // Generate burst effects based on category
  const generateBurstEffect = () => {
    const category = currentAffirmation.category;
    const hearts = [];
    
    for (let i = 0; i < 50; i++) {
      const angle = (i * 7.2) + (Math.random() * 7.2); // More evenly distributed angles
      const delay = Math.random() * 1000;
      const duration = 1500 + Math.random() * 1500;
      const size = 240 + Math.random() * 360;
      
      // Calculate end position to reach edges/corners of screen
      const distance = 800 + Math.random() * 600; // Ensure hearts travel far enough off screen
      const endX = Math.cos(angle * Math.PI / 180) * distance;
      const endY = Math.sin(angle * Math.PI / 180) * distance;
      
      let IconComponent;
      let colorClass;
      
      switch (category) {
        case 'wealth':
          IconComponent = DollarBillIcon;
          colorClass = 'text-green-500';
          break;
        case 'health':
          IconComponent = HealthIcon;
          colorClass = 'text-blue-500';
          break;
        case 'learning':
          IconComponent = Star;
          colorClass = 'text-yellow-500';
          break;
        default:
          IconComponent = Heart;
          colorClass = 'text-pink-500';
      }
      
      hearts.push(
        <IconComponent
          key={i}
          className={`absolute ${colorClass} pointer-events-none`}
          style={{
            left: '50%',
            top: '50%',
            width: `${size}px`,
            height: `${size}px`,
            animation: `heartBurst ${duration}ms ease-out ${delay}ms both`,
            '--end-x': `${endX}px`,
            '--end-y': `${endY}px`,
            zIndex: 1000,
          } as React.CSSProperties}
          fill="currentColor"
        />
      );
    }
    return hearts;
  };

  if (currentView === 'search') {
    return (
      <div className="min-h-screen bg-white p-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => setCurrentView('main')}
            className="hover:scale-110 transition-all duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 ml-1">Search</h1>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for affirmations..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Topics */}
        {searchQuery === '' && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Browse by Topic</h2>
            <div className="grid grid-cols-2 gap-3">
              {topics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => handleTopicSearch(topic)}
                  className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-1">
          {searchResults.length === 0 && searchQuery !== '' ? (
            <p className="text-gray-500 text-center mt-12">No affirmations found for "{searchQuery}"</p>
          ) : (
            searchResults.map((phrase, index) => (
              <div 
                key={index} 
                className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSearchResultClick(phrase)}
              >
                <p className="text-gray-800">{phrase}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'bookmarks') {
    return (
      <div className="min-h-screen bg-white p-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => setCurrentView('main')}
            className="hover:scale-110 transition-all duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 ml-1">Bookmarks</h1>
        </div>

        {/* Bookmarks List */}
        <div className="space-y-1">
          {bookmarkedPhrases.length === 0 ? (
            <p className="text-gray-500 text-center mt-12">No bookmarks yet. Bookmark your favorite affirmations!</p>
          ) : (
            organizedBookmarks.map((phrase, index) => {
              const isPinned = pinnedPhrases.includes(phrase);
              return (
              <div 
                key={index} 
                className={`${isPinned ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'} p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors`}
                onClick={() => handleBookmarkClick(phrase)}
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Pin Icon */}
                  <button
                    onClick={(e) => handlePinPhrase(phrase, e)}
                    className="p-1 hover:scale-110 transition-all duration-200 flex-shrink-0"
                    title={isPinned ? "Unpin" : "Pin to top"}
                  >
                    <img 
                      src="/thumbtack (3).png" 
                      alt="Pin" 
                      className="w-4 h-4"
                      style={{
                        filter: isPinned 
                          ? 'brightness(0) saturate(100%) invert(58%) sepia(96%) saturate(1458%) hue-rotate(201deg) brightness(97%) contrast(96%)'
                          : 'grayscale(100%) brightness(0.7) opacity(0.6)'
                      }}
                    />
                  </button>
                  
                  <p className="text-gray-800 flex-1">{phrase}</p>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Delete Icon */}
                  <button
                    onClick={(e) => handleDeleteClick(phrase, e)}
                    className="p-2 text-blue-500 hover:scale-110 transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              );
            })
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Bookmark</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this bookmark?</p>
              <p className="text-gray-800 font-medium mb-6 p-3 bg-gray-50 rounded italic">"{deleteConfirmation}"</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  No
                </button>
                <button
                  onClick={() => handleRemoveBookmark(deleteConfirmation)}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden"
      onTouchStart={handleTouchStartSwipe}
      onTouchMove={handleTouchMoveSwipe}
      onTouchEnd={handleTouchEndSwipe}
    >
      {/* Top Navigation */}
      <div className="absolute top-4 left-0 right-0 z-50 px-4">
        <div className="flex justify-between items-center">
          {/* Goaly Button */}
          <button
            onClick={returnToMainFeed}
            className="px-3 py-2 hover:scale-110 transition-all duration-200 flex items-center justify-center"
          >
            <span className="text-xl font-black text-gray-700" style={{ fontFamily: '"Fredoka One", sans-serif' }}>
              Goaly
            </span>
          </button>

          {/* Bookmarks Button */}
          <button
            onClick={() => setCurrentView('bookmarks')}
            className="p-3 hover:scale-110 transition-all duration-200"
          >
            <img 
              src="/save (1).png" 
              alt="Bookmarks" 
              className="w-6 h-6"
            />
          </button>

          {/* Plus Icon */}
          <button
            onClick={() => setShowPlusPopup(true)}
            className="p-3 hover:scale-110 transition-all duration-200"
          >
            <img 
              src="/plus.png" 
              alt="Plus" 
              className="w-8 h-8"
            />
          </button>

          {/* Search Icon */}
          <button
            onClick={() => setCurrentView('search')}
            className="p-3 hover:scale-110 transition-all duration-200"
          >
            <Search className="w-6 h-6 text-gray-700" />
          </button>

          {/* 3-Line Menu Icon */}
          <button
            className="p-3 hover:scale-110 transition-all duration-200"
          >
            <div className="flex flex-col gap-1">
              <div className="w-6 h-0.5 bg-gray-700"></div>
              <div className="w-6 h-0.5 bg-gray-700"></div>
              <div className="w-6 h-0.5 bg-gray-700"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Bookmark and Share Icons - Right Side Edge */}
      <div className="absolute right-4 top-1/2 transform translate-y-20 z-50 flex flex-col gap-3">
        {/* Bookmark Icon */}
        <button
          onClick={handleBookmark}
          className="p-3 bg-white bg-opacity-20 rounded-full hover:scale-110 transition-all duration-200"
        >
          {bookmarkedPhrases.includes(currentAffirmation.text) ? (
            <BookmarkCheck className="w-6 h-6 text-blue-600" />
          ) : (
            <Bookmark className="w-6 h-6 text-gray-700" />
          )}
        </button>
        
        {/* Share Icon (Link) */}
        <button
          onClick={handleShare}
          className="p-3 bg-white bg-opacity-20 rounded-full hover:scale-110 transition-all duration-200"
        >
          <Link className="w-6 h-6 text-gray-700" />
        </button>
        
        {/* Microphone Icon */}
        <button
          onClick={handleMicrophoneClick}
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
      </div>

      {/* Copy Alert */}
      {showCopyAlert && (
        <div className="absolute top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          Link copied to clipboard!
        </div>
      )}

      {/* Plus Icon Popup Modal */}
      {showPlusPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            {/* Close X button */}
            <button
              onClick={() => setShowPlusPopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Content */}
            <div className="pr-8">
              <p className="text-gray-800 leading-relaxed">
                Thank you for your interest in submitting a goal or affirmation to share on the app! 
                Since we're still getting set up, please submit it via the help desk{' '}
                <a 
                  href="https://bit.ly/glysupport" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  here
                </a>
                . Thanks!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Text */}
      <div 
        className="text-center select-none flex-1 flex items-center w-full px-2 sm:px-4 md:px-6 lg:px-8 -mt-8 sm:mt-0"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        <div className="flex flex-wrap justify-center items-center gap-x-1 sm:gap-x-2 md:gap-x-3 lg:gap-x-4 xl:gap-x-6 leading-none w-full">
          {currentAffirmation.text.split(' ').map((word, wordIndex) => (
            <div key={wordIndex} className="flex mr-[2vw] sm:mr-[1.5vw] md:mr-[1.2vw] lg:mr-[1vw] xl:mr-[0.8vw] last:mr-0">
              {word.split('').map((letter, letterIndex) => {
                const globalIndex = currentAffirmation.text.split('').findIndex((char, i) => {
                  const wordsSoFar = currentAffirmation.text.split(' ').slice(0, wordIndex).join(' ');
                  const lettersSoFar = wordsSoFar.length + (wordsSoFar ? 1 : 0) + letterIndex;
                  return i === lettersSoFar;
                });
                
                return (
                  <span
                    key={letterIndex}
                    data-letter-index={globalIndex}
                    className={`
                      inline-block cursor-pointer
                      ${dynamicFontSize}
                      font-black
                      transition-all duration-500
                      ${clickedLetters.has(globalIndex) 
                        ? `${getLetterColorClass(currentAffirmation.category)} transition-none`
                        : ''
                      }
                    `}
                    style={{
                      fontFamily: '"Fredoka One", "Fredoka", sans-serif',
                      fontWeight: '900',
                      color: clickedLetters.has(globalIndex) ? 'transparent' : '#ffffff',
                      textShadow: !clickedLetters.has(globalIndex) 
                        ? window.innerWidth <= 768 
                          ? '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 2px 2px 4px rgba(0,0,0,0.3)'
                          : '0.15vw 0.15vw 0.3vw rgba(0,0,0,0.4)'
                        : 'none',
                      WebkitTextStroke: window.innerWidth <= 768 ? 'none' : '0.2vw #000000',
                      textStroke: window.innerWidth <= 768 ? 'none' : '0.2vw #000000',
                    }}
                    onClick={() => handleLetterClick(globalIndex)}
                    onTouchStart={() => handleLetterClick(globalIndex)}
                    onMouseEnter={() => handleMouseEnter(globalIndex)}
                  >
                    {letter}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}

      {/* Hearts burst animation */}
      {showHearts && (
        <div className="absolute inset-0 pointer-events-none">
          {generateBurstEffect()}
        </div>
      )}
      
      {/* Instructions */}
      <div className="absolute bottom-20 sm:bottom-4 md:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 text-gray-400 text-xs sm:text-sm md:text-base text-center flex items-center gap-2 px-4 pb-2">
        <Sparkles className="w-4 h-4 text-yellow-500" />
        <p className="whitespace-nowrap">Trace Goal or Scroll Up!</p>
        <Sparkles className="w-4 h-4 text-yellow-500" />
      </div>
    </div>
  );
}

export default App;