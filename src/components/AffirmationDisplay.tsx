import React from 'react';
import { Affirmation } from '../types';
import { getCategoryLetterClasses } from '../utils/affirmations';

interface AffirmationDisplayProps {
  affirmation: Affirmation;
  completedLetters: Set<number>;
  onLetterClick: (index: number) => void;
}

export const AffirmationDisplay: React.FC<AffirmationDisplayProps> = ({
  affirmation,
  completedLetters,
  onLetterClick
}) => {
  const { fill, glow } = getCategoryLetterClasses(affirmation.category);

  const renderLetter = (char: string, index: number) => {
    const isCompleted = completedLetters.has(index);
    const isSpace = char === ' ';
    
    if (isSpace) {
      return <span key={index} className="inline-block w-4" />;
    }

    return (
      <span
        key={index}
        className={`
          inline-block cursor-pointer transition-all duration-300 select-none
          ${isCompleted ? `${fill} ${glow} letter-sparkle` : 'text-gray-800 hover:text-gray-600'}
        `}
        onClick={() => onLetterClick(index)}
        style={{
          fontFamily: 'Fredoka One, cursive',
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          lineHeight: '1.2',
          textShadow: isCompleted ? '0 0 20px rgba(255, 255, 255, 0.8)' : 'none'
        }}
      >
        {char}
      </span>
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-4xl mx-auto">
        <div className="leading-relaxed">
          {affirmation.text.split('').map(renderLetter)}
        </div>
      </div>
    </div>
  );
};