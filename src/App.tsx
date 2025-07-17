import React, { useState, useEffect, useRef } from 'react';
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
  "My business is incredibly profitable"
];

function App() {
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  const [category, setCategory] = useState<'love' | 'wealth'>('love');
  const [isListening, setIsListening] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [savedAffirmations, setSavedAffirmations] = useState<string[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [holdTimer, setHoldTimer] = useState<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  const getRandomAffirmation = () => {
    const affirmations = category === 'love' ? loveAffirmations : wealthAffirmations;
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    return affirmations[randomIndex];
  };

  useEffect(() => {
    setCurrentAffirmation(getRandomAffirmation());
  }, [category]);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    setError(null);
    setIsListening(true);
    setIsMatched(false);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      const currentLower = currentAffirmation.toLowerCase();
      
      if (transcript.includes(currentLower.substring(0, Math.min(10, currentLower.length)))) {
        setIsMatched(true);
        setIsListening(false);
        
        if (isContinuousMode) {
          setTimeout(() => {
            setCurrentAffirmation(getRandomAffirmation());
            setIsMatched(false);
            startListening();
          }, 1500);
        }
      } else {
        setIsListening(false);
        if (isContinuousMode) {
          setTimeout(() => startListening(), 1000);
        }
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      
      let errorMessage = 'Speech recognition error';
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
          setIsContinuousMode(false);
          break;
        case 'no-speech':
          errorMessage = 'No speech detected. Please try speaking again.';
          break;
        case 'network':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'audio-capture':
          errorMessage = 'Microphone not found. Please check your microphone.';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      setError(errorMessage);
      
      if (isContinuousMode && event.error !== 'not-allowed' && event.error !== 'audio-capture') {
        setTimeout(() => {
          setError(null);
          startListening();
        }, 2000);
      }
    };

    recognition.onend = () => {
      if (isContinuousMode && !isMatched) {
        setTimeout(() => startListening(), 500);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      setIsListening(false);
      setError('Failed to start speech recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setIsContinuousMode(false);
    if (holdTimer) {
      clearTimeout(holdTimer);
      setHoldTimer(null);
    }
  };

  const handleMouseDown = () => {
    if (isContinuousMode) {
      stopListening();
      return;
    }

    const timer = setTimeout(() => {
      setIsContinuousMode(true);
      startListening();
    }, 4000);
    
    setHoldTimer(timer);
  };

  const handleMouseUp = () => {
    if (holdTimer) {
      clearTimeout(holdTimer);
      setHoldTimer(null);
      
      if (!isContinuousMode) {
        startListening();
      }
    }
  };

  const saveAffirmation = () => {
    if (!savedAffirmations.includes(currentAffirmation)) {
      setSavedAffirmations([...savedAffirmations, currentAffirmation]);
    }
  };

  const removeSavedAffirmation = (affirmation: string) => {
    setSavedAffirmations(savedAffirmations.filter(a => a !== affirmation));
  };

  const getNewAffirmation = () => {
    setCurrentAffirmation(getRandomAffirmation());
    setIsMatched(false);
  };

  const dismissError = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {error && (
        <div className="bg-red-500 text-white p-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={dismissError} className="ml-4 hover:bg-red-600 rounded p-1">
            <X size={20} />
          </button>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 mr-3 text-yellow-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Affirmation Mirror
            </h1>
            <Sparkles className="w-8 h-8 ml-3 text-yellow-400" />
          </div>
          <p className="text-xl text-purple-200">Speak your affirmations and watch them manifest</p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-1">
              <button
                onClick={() => setCategory('love')}
                className={`px-6 py-3 rounded-full transition-all duration-300 flex items-center ${
                  category === 'love'
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'text-pink-200 hover:text-white hover:bg-pink-500/20'
                }`}
              >
                <Heart className="w-5 h-5 mr-2" />
                Love
              </button>
              <button
                onClick={() => setCategory('wealth')}
                className={`px-6 py-3 rounded-full transition-all duration-300 flex items-center ${
                  category === 'wealth'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'text-green-200 hover:text-white hover:bg-green-500/20'
                }`}
              >
                <DollarBillIcon className="w-5 h-5 mr-2" />
                Wealth
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8 text-center">
            <div className="mb-6">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                category === 'love' ? 'bg-pink-500/20 text-pink-200' : 'bg-green-500/20 text-green-200'
              }`}>
                {category === 'love' ? <Heart className="w-4 h-4 mr-2" /> : <DollarBillIcon className="w-4 h-4 mr-2" />}
                {category === 'love' ? 'Love Affirmation' : 'Wealth Affirmation'}
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-8 leading-relaxed">
              "{currentAffirmation}"
            </h2>
            
            <div className="flex justify-center items-center space-x-4 mb-6">
              <button
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isContinuousMode
                    ? 'bg-green-500 hover:bg-green-600 animate-pulse'
                    : isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-white/20 hover:bg-white/30'
                } backdrop-blur-sm shadow-lg`}
                disabled={isListening && !isContinuousMode}
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button
                onClick={saveAffirmation}
                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300"
              >
                {savedAffirmations.includes(currentAffirmation) ? (
                  <BookmarkCheck className="w-6 h-6 text-yellow-400" />
                ) : (
                  <Bookmark className="w-6 h-6" />
                )}
              </button>
              
              <button
                onClick={getNewAffirmation}
                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>
            
            {isContinuousMode && (
              <p className="text-green-300 text-sm">
                Continuous mode active - Click microphone to stop
              </p>
            )}
            
            {isListening && !isContinuousMode && (
              <p className="text-red-300 text-sm animate-pulse">
                Listening... Speak the affirmation
              </p>
            )}
            
            {isMatched && (
              <div className="flex items-center justify-center text-green-400 text-lg font-semibold">
                <Star className="w-6 h-6 mr-2" />
                Perfect match! ✨
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 px-6 py-3 rounded-full transition-all duration-300 flex items-center"
            >
              <Bookmark className="w-5 h-5 mr-2" />
              Saved Affirmations ({savedAffirmations.length})
              {showSaved ? <ChevronUp className="w-5 h-5 ml-2" /> : <ChevronDown className="w-5 h-5 ml-2" />}
            </button>
          </div>

          {showSaved && (
            <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Your Saved Affirmations</h3>
              {savedAffirmations.length === 0 ? (
                <p className="text-center text-purple-200">No saved affirmations yet. Start by bookmarking your favorites!</p>
              ) : (
                <div className="space-y-4">
                  {savedAffirmations.map((affirmation, index) => (
                    <div key={index} className="bg-white/10 rounded-xl p-4 flex items-center justify-between">
                      <p className="flex-1 text-lg">"{affirmation}"</p>
                      <button
                        onClick={() => removeSavedAffirmation(affirmation)}
                        className="ml-4 w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/40 flex items-center justify-center transition-all duration-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;