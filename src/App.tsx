import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  Search, 
  Plus, 
  Menu, 
  Mic
} from 'lucide-react';

// Simple affirmations data
const affirmations = [
  { text: "I am worthy of love and respect", category: "love" },
  { text: "I deserve to be financially free", category: "wealth" },
  { text: "I am strong, healthy, and vibrant", category: "health" },
  { text: "I am constantly learning and growing", category: "learning" }
];

const App: React.FC = () => {
  const [currentAffirmation, setCurrentAffirmation] = useState(affirmations[0]);
  const [clickedLetters, setClickedLetters] = useState<Set<number>>(new Set());
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getRandomAffirmation = () => {
    const newAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    setCurrentAffirmation(newAffirmation);
    setClickedLetters(new Set());
  };

  const handleLetterClick = (index: number) => {
    const newClickedLetters = new Set(clickedLetters);
    newClickedLetters.add(index);
    setClickedLetters(newClickedLetters);
  };

  const renderLetter = (char: string, index: number, letterIndex: number) => {
    if (char === ' ') {
      return <span key={index} className="inline-block w-4"></span>;
    }

    const isClicked = clickedLetters.has(letterIndex);
    
    return (
      <span
        key={index}
        className={`
          inline-block cursor-pointer transition-all duration-300 text-6xl md:text-8xl font-bold
          hover:scale-110 select-none
          ${isClicked ? 'text-pink-500' : 'text-gray-800 hover:text-gray-600'}
        `}
        onClick={() => handleLetterClick(letterIndex)}
        style={{
          fontFamily: 'Fredoka One, cursive',
          textShadow: isClicked ? '0 0 20px rgba(236, 72, 153, 0.8)' : '2px 2px 4px rgba(0,0,0,0.1)'
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

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={getRandomAffirmation}
          className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
          style={{ fontFamily: 'Fredoka One, cursive' }}
        >
          Goaly
        </button>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
            <Bookmark className="w-6 h-6" />
          </button>
          <button
            onClick={getRandomAffirmation}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
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
          onClick={() => setIsBookmarked(!isBookmarked)}
          className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          {isBookmarked ? (
            <BookmarkCheck className="w-6 h-6 text-blue-500" />
          ) : (
            <Bookmark className="w-6 h-6 text-gray-600" />
          )}
        </button>
        
        <button className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
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
        <p 
          className="text-yellow-600 text-sm font-medium"
          style={{ fontFamily: 'Fredoka, cursive' }}
        >
          ✨ Trace Goal or Scroll Up! ✨
        </p>
      </div>
    </div>
  );
};

export default App;