import React from 'react';
import { Bookmark, Link, Check } from 'lucide-react';
import { Affirmation } from '../types';
import { InteractiveText } from './InteractiveText';

interface AffirmationDisplayProps {
  affirmation: Affirmation;
  isBookmarked: boolean;
  onBookmark: () => void;
  onShare: () => void;
  onLetterClick: (index: number) => void;
  clickedLetters: Set<number>;
  allLettersClicked: boolean;
}

export const AffirmationDisplay: React.FC<AffirmationDisplayProps> = ({
  affirmation,
  isBookmarked,
  onBookmark,
  onShare,
  onLetterClick,
  clickedLetters,
  allLettersClicked,
}) => {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-8">
      <div className="max-w-2xl w-full text-center relative">
        <InteractiveText
          text={affirmation.text}
          category={affirmation.category}
          onLetterClick={onLetterClick}
          clickedLetters={clickedLetters}
          allLettersClicked={allLettersClicked}
        />
        
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-4">
          <button
            onClick={onBookmark}
            onTouchEnd={onBookmark}
            className={`p-3 rounded-full shadow-lg transition-all duration-200 ${
              isBookmarked
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            style={{ touchAction: 'manipulation' }}
          >
            {isBookmarked ? (
              <Check className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
          
          <button
            onClick={onShare}
            onTouchEnd={onShare}
            className="p-3 bg-white text-gray-600 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            aria-label="Share affirmation"
            style={{ touchAction: 'manipulation' }}
          >
            <Link className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};